import Link from "next/link";
import './home.css';

export default function HomePage() {
  return (
    <>
      <main>
        <div className="hero">
          <h1>The Career <span>Studio</span></h1>
          <p>Your intelligent workspace for crafting modern, highly-tailored career documents.</p>
        </div>

        <div className="grid">
          
          {/* Active PDF Toolkit Tile */}
          <Link href="/pdf-tools" className="tile">
            <div className="tile-icon" style={{ background: '#e6e8eb', color: '#5c564e' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
                <path d="M10 9H8"></path>
              </svg>
            </div>
            <h2 className="tile-title">PDF Toolkit</h2>
            <p className="tile-desc">Convert existing resumes to Markdown, merge application documents, or split PDF pages.</p>
            <div className="tile-arrow">Launch Tools &rarr;</div>
          </Link>

          {/* Active Builder Tile */}
          <Link href="/builder" className="tile">
            <div className="tile-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h2 className="tile-title">Document Builder</h2>
            <p className="tile-desc">Generate ATS-friendly CVs and tailored cover letters in seconds using your master Markdown profile.</p>
            <div className="tile-arrow">Launch App &rarr;</div>
          </Link>

          {/* NEW: Application Tracker Tile */}
          <Link href="/application-tracker" className="tile">
            <div className="tile-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="3" x2="15" y2="21"></line>
              </svg>
            </div>
            <h2 className="tile-title">Application Tracker</h2>
            <p className="tile-desc">Manage your job hunt with an interactive Kanban board directly linked to your AI applications.</p>
            <div className="tile-arrow">Open Tracker &rarr;</div>
          </Link>

          {/* Placeholder Tile for future expansion */}
          <div className="tile" style={{ opacity: 0.65, cursor: 'not-allowed' }}>
            <div className="tile-icon" style={{ background: '#f0d9b8', color: '#c9883a' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h2 className="tile-title">Interview Prep</h2>
            <p className="tile-desc">AI-driven mock interviews and question generation based on your target job description.</p>
            <div className="tile-arrow">Coming Soon</div>
          </div>

        </div>
      </main>
    </>
  );
}