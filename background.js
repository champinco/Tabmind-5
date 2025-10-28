// TabMind Background Service Worker
// Handles tab monitoring, AI analysis, and workspace state management

let workspaceState = {
  clusters: [],
  lastAnalysis: null,
  tabData: new Map(),
  originalTabIds: [], // Store initial tab IDs for revert
}

let currentAISession = null
// chrome API is globally available in extensions

// Declare chrome variable
const chrome = window.chrome

// Initialize extension
console.log("[TabMind] Service worker starting...")

chrome.runtime.onInstalled.addListener(async () => {
  console.log("[TabMind] Extension installed")

  // Set up side panel behavior
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

  // Load saved state
  const saved = await chrome.storage.local.get("workspaceState")
  if (saved.workspaceState) {
    workspaceState = saved.workspaceState
    // Ensure tabData is a Map, as it is stored as an array of arrays in chrome.storage
    if (Array.isArray(workspaceState.tabData)) {
      workspaceState.tabData = new Map(workspaceState.tabData)
    } else if (!workspaceState.tabData) {
      workspaceState.tabData = new Map()
    }
  }

  // Start monitoring tabs
  analyzeTabs()

  // Get initial tabs for revert
  const initialTabs = await chrome.tabs.query({ currentWindow: true })
  workspaceState.originalTabIds = initialTabs.map((t) => t.id)
})

// Listen for tab changes
chrome.tabs.onCreated.addListener(() => analyzeTabs())
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    analyzeTabs()
  }
})
chrome.tabs.onRemoved.addListener(() => analyzeTabs())
chrome.tabs.onActivated.addListener(() => analyzeTabs())

// Main tab analysis function using Chrome's built-in AI
async function analyzeTabs() {
  try {
    const tabs = await chrome.tabs.query({})

    // Check if AI is available (Analysis will proceed even if not available, using fallback)
    const aiAvailable = await checkAIAvailability()
    if (!aiAvailable) {
      console.log("[TabMind] AI not available, proceeding with fallback analysis.")
    }

    // Extract tab information
    const tabInfo = await Promise.all(
      tabs.map(async (tab) => {
        // Get cached data or fetch new
        let data = workspaceState.tabData.get(tab.id)

        if (!data || data.url !== tab.url) {
          data = {
            id: tab.id,
            title: tab.title,
            url: tab.url,
            favIconUrl: tab.favIconUrl,
            lastAccessed: Date.now(),
          }

          // Try to get page content summary
          try {
            const summary = await getPageSummary(tab.id)
            data.summary = summary
          } catch (e) {
            console.log("[TabMind] Could not get summary for tab", tab.id)
          }

          workspaceState.tabData.set(tab.id, data)
        }

        return data
      }),
    )

    // Use AI to cluster tabs
    let clusters = await clusterTabs(tabInfo)

    // Generate summaries for each cluster
    clusters = await Promise.all(
      clusters.map(async (cluster) => {
        cluster.summary = await generateClusterSummary(cluster)
        return cluster
      }),
    )
    workspaceState.clusters = clusters
    workspaceState.lastAnalysis = Date.now()

    // Prepare state for storage (convert Map to plain object)
    const stateToSave = {
      ...workspaceState,
      tabData: Array.from(workspaceState.tabData.entries()),
    }
    // Save state
    await chrome.storage.local.set({ workspaceState: stateToSave })

    // Notify side panel
    chrome.runtime
      .sendMessage({
        type: "WORKSPACE_UPDATED",
        data: workspaceState,
      })
      .catch(() => {
        // Side panel might not be open
      })
  } catch (error) {
    console.error("[TabMind] Error analyzing tabs:", error)
  }
}

async function checkAIAvailability() {
  try {
    if (!self.ai || !self.ai.languageModel) {
      console.log("[TabMind] AI languageModel API not available")
      return false
    }

    const capabilities = await self.ai.languageModel.capabilities()
    console.log("[TabMind] AI capabilities:", capabilities)

    if (capabilities.available === "readily") {
      return true
    } else if (capabilities.available === "after-download") {
      console.log("[TabMind] AI model needs to be downloaded")
      return false
    } else {
      console.log("[TabMind] AI not available:", capabilities.available)
      return false
    }
  } catch (e) {
    console.error("[TabMind] Error checking AI availability:", e)
    return false
  }
}

// Get page summary using Summarizer API
async function getPageSummary(tabId) {
  try {
    // Inject content script to get page text
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const text = document.body.innerText
        return text.slice(0, 5000) // Limit to first 5000 chars
      },
    })

    const pageText = results[0].result

    if (!pageText || pageText.trim().length < 100) {
      return null
    }

    if (self.ai && self.ai.summarizer) {
      const canSummarize = await self.ai.summarizer.capabilities()
      if (canSummarize.available === "readily") {
        const summarizer = await self.ai.summarizer.create({
          type: "tl;dr",
          format: "plain-text",
          length: "short",
        })
        const summary = await summarizer.summarize(pageText)
        summarizer.destroy()
        return summary
      }
    }

    return null
  } catch (e) {
    console.error("[TabMind] Error getting page summary:", e)
    return null
  }
}

async function clusterTabs(tabInfo) {
  try {
    if (!self.ai || !self.ai.languageModel) {
      return fallbackClustering(tabInfo)
    }

    const capabilities = await self.ai.languageModel.capabilities()
    if (capabilities.available !== "readily") {
      return fallbackClustering(tabInfo)
    }

    // Clean up previous session if exists
    if (currentAISession) {
      try {
        currentAISession.destroy()
      } catch (e) {
        console.log("[TabMind] Error destroying previous session:", e)
      }
      currentAISession = null
    }

    currentAISession = await self.ai.languageModel.create({
      systemPrompt: `You are an intelligent tab clustering assistant. Analyze tab titles and URLs to group related tabs into meaningful clusters. Return a JSON array of clusters, where each cluster has a "name" (descriptive category), "description" (what this cluster is about), and "tabIds" (array of tab IDs belonging to this cluster). Create 3-7 clusters maximum.`,
      temperature: 0.3,
      topK: 3,
    })

    const tabList = tabInfo.map((t) => ({
      id: t.id,
      title: t.title,
      url: t.url,
    }))

    const prompt = `Analyze these tabs and create intelligent clusters:\n${JSON.stringify(tabList, null, 2)}\n\nReturn only valid JSON with this structure: [{"name": "cluster name", "description": "what this is about", "tabIds": [1, 2, 3]}]`

    const result = await currentAISession.prompt(prompt)

    // Parse AI response
    const jsonMatch = result.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const clusters = JSON.parse(jsonMatch[0])
      return clusters
    }

    return fallbackClustering(tabInfo)
  } catch (error) {
    console.error("[TabMind] AI clustering failed:", error)
    return fallbackClustering(tabInfo)
  }
}

// Fallback clustering based on domain similarity
function fallbackClustering(tabInfo) {
  const domainMap = new Map()

  tabInfo.forEach((tab) => {
    try {
      const url = new URL(tab.url)
      const domain = url.hostname.replace("www.", "")

      if (!domainMap.has(domain)) {
        domainMap.set(domain, [])
      }
      domainMap.get(domain).push(tab.id)
    } catch (e) {
      // Invalid URL
    }
  })

  const clusters = Array.from(domainMap.entries()).map(([domain, tabIds]) => ({
    name: domain,
    description: `Tabs from ${domain}`,
    tabIds,
  }))

  return clusters
}

async function generateClusterSummary(cluster) {
  const tabTitles = cluster.tabIds
    .map((id) => {
      const tabData = workspaceState.tabData.get(id)
      return tabData ? tabData.title : null
    })
    .filter(Boolean)

  if (tabTitles.length === 0) {
    return `This workspace contains ${cluster.tabIds.length} tabs.`
  }

  // Skip AI summary if not available
  if (!self.ai || !self.ai.languageModel) {
    return `${cluster.tabIds.length} tabs related to ${cluster.name}`
  }

  try {
    const capabilities = await self.ai.languageModel.capabilities()
    if (capabilities.available !== "readily") {
      return `${cluster.tabIds.length} tabs related to ${cluster.name}`
    }

    const session = await self.ai.languageModel.create({
      systemPrompt: `You are a concise workspace summarizer. Based on the provided list of tab titles, generate a single, brief, and engaging sentence (max 15 words) that summarizes the main topic of this group of tabs. The summary should be in the third person and focus on the content.`,
      temperature: 0.5,
      topK: 3,
    })

    const prompt = `Tab titles for the workspace "${cluster.name}":\n${tabTitles.join("\n")}`

    const result = await session.prompt(prompt)
    session.destroy()
    return result.trim()
  } catch (error) {
    console.error("[TabMind] Error generating cluster summary:", error)
    return `${cluster.tabIds.length} tabs related to ${cluster.name}`
  }
}

// Handle messages from side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_WORKSPACE") {
    sendResponse(workspaceState)
  } else if (message.type === "REFRESH_ANALYSIS") {
    analyzeTabs().then(() => {
      sendResponse({ success: true })
    })
    return true // Keep channel open for async response
  } else if (message.type === "APPLY_CLUSTERS") {
    applyTabGroups(message.clusters).then(() => {
      sendResponse({ success: true })
    })
    return true
  } else if (message.type === "REVERT_TABS") {
    revertTabs().then(() => {
      sendResponse({ success: true })
    })
    return true
  }
})

// Revert tabs to original state
async function revertTabs() {
  try {
    console.log("[TabMind] Reverting tabs...")

    // 1. Ungroup all tabs in the current window
    const groups = await chrome.tabGroups.query({ currentWindow: true })
    for (const group of groups) {
      const tabsInGroup = await chrome.tabs.query({ groupId: group.id })
      const tabIds = tabsInGroup.map((tab) => tab.id)
      if (tabIds.length > 0) {
        await chrome.tabs.ungroup(tabIds)
      }
    }

    // 2. Close all tabs that are NOT in the original list
    const currentTabs = await chrome.tabs.query({ currentWindow: true })
    const tabsToClose = currentTabs.filter((tab) => !workspaceState.originalTabIds.includes(tab.id))

    if (tabsToClose.length > 0 && tabsToClose.length < currentTabs.length) {
      await chrome.tabs.remove(tabsToClose.map((t) => t.id))
    }

    console.log("[TabMind] Tabs reverted successfully.")
  } catch (error) {
    console.error("[TabMind] Error reverting tabs:", error)
    throw error
  }
}

// Apply clusters as Chrome tab groups
async function applyTabGroups(clusters) {
  try {
    console.log("[TabMind] Applying tab groups...", clusters)

    const groups = await chrome.tabGroups.query({})
    for (const group of groups) {
      const tabsInGroup = await chrome.tabs.query({ groupId: group.id })
      const tabIds = tabsInGroup.map((tab) => tab.id)
      if (tabIds.length > 0) {
        await chrome.tabs.ungroup(tabIds)
      }
    }

    const colors = ["grey", "blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange"]

    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i]

      const validTabIds = []
      for (const tabId of cluster.tabIds) {
        try {
          const tab = await chrome.tabs.get(tabId)
          if (tab) {
            validTabIds.push(tabId)
          }
        } catch (e) {
          console.log("[TabMind] Tab no longer exists:", tabId)
        }
      }

      if (validTabIds.length > 0) {
        try {
          const groupId = await chrome.tabs.group({ tabIds: validTabIds })
          await chrome.tabGroups.update(groupId, {
            title: cluster.name,
            color: colors[i % colors.length],
            collapsed: false,
          })
          console.log("[TabMind] Created group:", cluster.name, "with", validTabIds.length, "tabs")
        } catch (error) {
          console.error("[TabMind] Error creating group for cluster:", cluster.name, error)
        }
      }
    }

    console.log("[TabMind] Tab groups applied successfully")
  } catch (error) {
    console.error("[TabMind] Error applying tab groups:", error)
    throw error
  }
}

chrome.runtime.onStartup.addListener(() => {
  console.log("[TabMind] Browser started, service worker active")
})

chrome.action.onClicked.addListener(() => {
  console.log("[TabMind] Extension icon clicked")
})

console.log("[TabMind] Service worker loaded and ready")
