// TabMind Side Panel UI
// Handles user interface and interactions

let currentWorkspace = null
let chrome // Declare the chrome variable

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadWorkspace()
  setupEventListeners()

  // Listen for workspace updates
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "WORKSPACE_UPDATED") {
      currentWorkspace = message.data
      renderWorkspace()
    }
  })
})

// Setup event listeners
function setupEventListeners() {
  document.getElementById("refreshBtn").addEventListener("click", refreshAnalysis)
  document.getElementById("applyGroupsBtn").addEventListener("click", applyTabGroups)
}

// Load workspace from background
async function loadWorkspace() {
  try {
    showAIStatus(true)

    const response = await chrome.runtime.sendMessage({ type: "GET_WORKSPACE" })
    currentWorkspace = response

    renderWorkspace()
    showAIStatus(false)
  } catch (error) {
    console.error("[TabMind] Error loading workspace:", error)
    showAIStatus(false)
  }
}

// Refresh analysis
async function refreshAnalysis() {
  try {
    showAIStatus(true)

    await chrome.runtime.sendMessage({ type: "REFRESH_ANALYSIS" })

    // Wait a bit for analysis to complete
    setTimeout(() => {
      loadWorkspace()
    }, 1000)
  } catch (error) {
    console.error("[TabMind] Error refreshing:", error)
    showAIStatus(false)
  }
}

// Apply tab groups
async function applyTabGroups() {
  console.log("[v0] Apply groups clicked")

  if (!currentWorkspace || !currentWorkspace.clusters) {
    console.log("[v0] No workspace or clusters available")
    return
  }

  try {
    const btn = document.getElementById("applyGroupsBtn")
    btn.disabled = true
    btn.textContent = "Applying..."

    console.log("[v0] Sending APPLY_CLUSTERS message with", currentWorkspace.clusters.length, "clusters")

    const response = await chrome.runtime.sendMessage({
      type: "APPLY_CLUSTERS",
      clusters: currentWorkspace.clusters,
    })

    console.log("[v0] Apply clusters response:", response)

    btn.textContent = "Applied!"
    setTimeout(() => {
      btn.disabled = false
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
        </svg>
        Apply Tab Groups
      `
    }, 2000)
  } catch (error) {
    console.error("[TabMind] Error applying groups:", error)
    const btn = document.getElementById("applyGroupsBtn")
    btn.disabled = false
    btn.textContent = "Error - Try Again"

    setTimeout(() => {
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
        </svg>
        Apply Tab Groups
      `
    }, 2000)
  }
}

// Render workspace
function renderWorkspace() {
  if (!currentWorkspace) return

  // Update stats
  const totalTabs = currentWorkspace.tabData ? currentWorkspace.tabData.size : 0
  const totalClusters = currentWorkspace.clusters ? currentWorkspace.clusters.length : 0
  const lastAnalyzed = currentWorkspace.lastAnalysis ? formatTimeAgo(currentWorkspace.lastAnalysis) : "Never"

  document.getElementById("totalTabs").textContent = totalTabs
  document.getElementById("totalClusters").textContent = totalClusters
  document.getElementById("lastAnalyzed").textContent = lastAnalyzed

  // Show/hide empty state
  const emptyState = document.getElementById("emptyState")
  const clustersContainer = document.getElementById("clustersContainer")

  if (!currentWorkspace.clusters || currentWorkspace.clusters.length === 0) {
    emptyState.classList.remove("hidden")
    clustersContainer.classList.add("hidden")
    return
  }

  emptyState.classList.add("hidden")
  clustersContainer.classList.remove("hidden")

  // Render clusters
  renderClusters()
}

// Render clusters
function renderClusters() {
  const container = document.getElementById("clustersContainer")
  container.innerHTML = ""

  currentWorkspace.clusters.forEach((cluster, index) => {
    const clusterEl = createClusterElement(cluster, index)
    container.appendChild(clusterEl)
  })
}

// Create cluster element
function createClusterElement(cluster, index) {
  const div = document.createElement("div")
  div.className = "cluster"
  div.dataset.index = index

  const tabs = cluster.tabIds.map((id) => currentWorkspace.tabData.get(id)).filter(Boolean)

  div.innerHTML = `
    <div class="cluster-header">
      <div class="cluster-info">
        <div class="cluster-name">
          ${escapeHtml(cluster.name)}
          <span class="cluster-badge">${tabs.length}</span>
        </div>
        <div class="cluster-description">${escapeHtml(cluster.description)}</div>
      </div>
      <div class="cluster-toggle">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
    <div class="cluster-tabs">
      ${tabs.map((tab) => createTabElement(tab)).join("")}
    </div>
  `

  // Add click handler for header
  const header = div.querySelector(".cluster-header")
  header.addEventListener("click", () => {
    div.classList.toggle("expanded")
  })

  // Add click handlers for tabs
  const tabElements = div.querySelectorAll(".tab-item")
  tabElements.forEach((tabEl, i) => {
    tabEl.addEventListener("click", (e) => {
      e.stopPropagation()
      chrome.tabs.update(tabs[i].id, { active: true })
    })
  })

  return div
}

// Create tab element
function createTabElement(tab) {
  const favicon = tab.favIconUrl
    ? `<img src="${escapeHtml(tab.favIconUrl)}" class="tab-favicon" alt="">`
    : '<div class="tab-favicon-placeholder"></div>'

  return `
    <div class="tab-item">
      ${favicon}
      <div class="tab-info">
        <div class="tab-title">${escapeHtml(tab.title)}</div>
        <div class="tab-url">${escapeHtml(getDisplayUrl(tab.url))}</div>
      </div>
    </div>
  `
}

// Show/hide AI status
function showAIStatus(show) {
  const status = document.getElementById("aiStatus")
  if (show) {
    status.classList.remove("hidden")
  } else {
    status.classList.add("hidden")
  }
}

// Utility functions
function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) return "Just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function getDisplayUrl(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace("www.", "")
  } catch {
    return url
  }
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}
