// TabMind Content Script
// Extracts page metadata and content for AI analysis

;(() => {
  // Declare chrome variable
  const chrome = window.chrome

  // Extract page metadata
  function extractMetadata() {
    const metadata = {
      title: document.title,
      description: "",
      keywords: [],
      headings: [],
      links: [],
    }

    // Get meta description
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metadata.description = metaDesc.content
    }

    // Get meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (metaKeywords) {
      metadata.keywords = metaKeywords.content.split(",").map((k) => k.trim())
    }

    // Get main headings
    const headings = document.querySelectorAll("h1, h2")
    metadata.headings = Array.from(headings)
      .slice(0, 5)
      .map((h) => h.textContent.trim())

    // Get main links
    const links = document.querySelectorAll("a[href]")
    metadata.links = Array.from(links)
      .slice(0, 10)
      .map((a) => ({
        text: a.textContent.trim(),
        href: a.href,
      }))

    return metadata
  }

  // Send metadata to background script
  chrome.runtime
    .sendMessage({
      type: "PAGE_METADATA",
      data: extractMetadata(),
    })
    .catch(() => {
      // Extension context invalidated
    })
})()
