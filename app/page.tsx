export default function Page() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#6366f1]"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            </svg>
            <h1 className="text-4xl font-bold">TabMind</h1>
          </div>
          <p className="text-xl text-[#a0a0a0]">AI-Powered Chrome Extension for Intelligent Tab Management</p>
        </div>

        {/* Alert Box */}
        <div className="mb-12 rounded-lg border border-[#6366f1]/30 bg-[#6366f1]/10 p-6">
          <div className="mb-2 flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#6366f1]"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
            <h2 className="text-lg font-semibold text-[#6366f1]">Chrome Extension Project</h2>
          </div>
          <p className="text-sm leading-relaxed text-[#a0a0a0]">
            This is a Chrome extension that cannot be previewed in a web browser. To use TabMind, you need to install it
            as an unpacked extension in Chrome.
          </p>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Features</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-6">
              <h3 className="mb-2 font-semibold text-[#6366f1]">AI-Powered Clustering</h3>
              <p className="text-sm text-[#a0a0a0]">Uses Chrome's Prompt API to intelligently group related tabs</p>
            </div>
            <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-6">
              <h3 className="mb-2 font-semibold text-[#6366f1]">Smart Summaries</h3>
              <p className="text-sm text-[#a0a0a0]">Generates concise summaries using the Summarizer API</p>
            </div>
            <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-6">
              <h3 className="mb-2 font-semibold text-[#6366f1]">Privacy-First</h3>
              <p className="text-sm text-[#a0a0a0]">All AI processing happens locally on your device</p>
            </div>
            <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-6">
              <h3 className="mb-2 font-semibold text-[#6366f1]">One-Click Organization</h3>
              <p className="text-sm text-[#a0a0a0]">Apply AI-generated clusters as Chrome tab groups instantly</p>
            </div>
          </div>
        </div>

        {/* Installation Steps */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Installation Steps</h2>
          <div className="space-y-4">
            <div className="flex gap-4 rounded-lg border border-[#2a2a2a] bg-[#141414] p-6">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#6366f1] text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Enable Chrome AI Features</h3>
                <p className="text-sm text-[#a0a0a0]">
                  Go to <code className="rounded bg-[#1a1a1a] px-2 py-1">chrome://flags</code> and enable AI flags
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-lg border border-[#2a2a2a] bg-[#141414] p-6">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#6366f1] text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Download Extension Files</h3>
                <p className="text-sm text-[#a0a0a0]">Download the ZIP file and extract it to a permanent location</p>
              </div>
            </div>
            <div className="flex gap-4 rounded-lg border border-[#2a2a2a] bg-[#141414] p-6">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#6366f1] text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Load in Chrome</h3>
                <p className="text-sm text-[#a0a0a0]">
                  Go to <code className="rounded bg-[#1a1a1a] px-2 py-1">chrome://extensions</code>, enable Developer
                  mode, and click "Load unpacked"
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-lg border border-[#2a2a2a] bg-[#141414] p-6">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#6366f1] text-sm font-bold">
                4
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Start Using TabMind</h3>
                <p className="text-sm text-[#a0a0a0]">Click the TabMind icon in your toolbar to open the side panel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Requirements</h2>
          <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-6">
            <ul className="space-y-2 text-sm text-[#a0a0a0]">
              <li className="flex items-start gap-2">
                <span className="text-[#6366f1]">•</span>
                <span>Chrome 138+ (Canary, Dev, or Beta channel)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#6366f1]">•</span>
                <span>GPU with more than 4 GB VRAM, OR CPU with 16 GB+ RAM and 4+ cores</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#6366f1]">•</span>
                <span>At least 22 GB free storage space</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#6366f1]">•</span>
                <span>Windows 10/11, macOS 13+, or Linux</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="mb-4 text-[#a0a0a0]">
            For detailed installation instructions, see INSTALLATION.md in the project files
          </p>
          <div className="flex justify-center gap-4">
            <button className="rounded-lg bg-[#6366f1] px-6 py-3 font-semibold transition-colors hover:bg-[#4f46e5]">
              Download Extension
            </button>
            <button className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-6 py-3 font-semibold transition-colors hover:bg-[#1a1a1a]">
              View Documentation
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-[#2a2a2a] pt-8 text-center text-sm text-[#707070]">
          <p>Built for the Chrome Built-in AI Challenge 2025</p>
          <p className="mt-2">Uses Chrome's Prompt API and Summarizer API</p>
        </div>
      </div>
    </div>
  )
}
