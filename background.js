// TabMind Background Service Worker
// Handles tab monitoring, AI analysis, and workspace state management

let workspaceState = {
  clusters: [],
  lastAnalysis: null,
  tabData: new Map(),
}

// Initialize extension
const chrome = window.chrome // Declare the chrome variable
chrome.runtime.onInstalled.addListener(async () => {
  console.log("[TabMind] Extension installed")

  // Set up side panel behavior
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

  // Load saved state
  const saved = await chrome.storage.local.get("workspaceState")
  if (saved.workspaceState) {
    workspaceState = saved.workspaceState
  }

  // Start monitoring tabs
  analyzeTabs()
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

    // Check if AI is available
    const aiAvailable = await checkAIAvailability()
    if (!aiAvailable) {
      console.log("[TabMind] AI not available yet")
      return
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
    const clusters = await clusterTabs(tabInfo)
    workspaceState.clusters = clusters
    workspaceState.lastAnalysis = Date.now()

    // Save state
    await chrome.storage.local.set({ workspaceState })

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

// Check if Chrome's built-in AI is available
async function checkAIAvailability() {
  try {
    if (!window.ai || !window.ai.languageModel) {
      return false
    }

    const capabilities = await window.ai.languageModel.capabilities()
    return capabilities.available === "readily"
  } catch (e) {
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

    // Use Summarizer API if available
    if (window.ai && window.ai.summarizer) {
      const canSummarize = await window.ai.summarizer.capabilities()
      if (canSummarize.available === "readily") {
        const summarizer = await window.ai.summarizer.create()
        const summary = await summarizer.summarize(pageText)
        return summary
      }
    }

    return null
  } catch (e) {
    return null
  }
}

// Cluster tabs using Prompt API
async function clusterTabs(tabInfo) {
  try {
    if (!window.ai || !window.ai.languageModel) {
      return fallbackClustering(tabInfo)
    }

    const capabilities = await window.ai.languageModel.capabilities()
    if (capabilities.available !== "readily") {
      return fallbackClustering(tabInfo)
    }

    const session = await window.ai.languageModel.create({
      systemPrompt: `You are an intelligent tab clustering assistant. Analyze tab titles and URLs to group related tabs into meaningful clusters. Return a JSON array of clusters, where each cluster has a "name" (descriptive category), "description" (what this cluster is about), and "tabIds" (array of tab IDs belonging to this cluster).`,
    })

    const tabList = tabInfo.map((t) => ({
      id: t.id,
      title: t.title,
      url: t.url,
    }))

    const prompt = `Analyze these tabs and create intelligent clusters:\n${JSON.stringify(tabList, null, 2)}\n\nReturn only valid JSON with this structure: [{"name": "cluster name", "description": "what this is about", "tabIds": [1, 2, 3]}]`

    const result = await session.prompt(prompt)

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
  }
})

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
