"use client";

import { useState, ChangeEvent, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import CvEditor from "../components/CvEditor";
import { set } from "zod";

export default function Home() {
  const [profileMarkdown, setProfileMarkdown] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"cv" | "coverLetter">("cv");
  const [personalInfo, setPersonalInfo] = useState({
    "Firstname": "",
  "Lastname": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "Portfolio": ""
  });
  const [isExtracting, setIsExtracting] = useState(false);
    
  const [cvHtml, setCvHtml] = useState(
    "<p style='color:#aaa;text-align:center;margin-top:60px;font-style:italic;'>Your tailored CV will appear here.</p>"
  );
  const [coverLetterHtml, setCoverLetterHtml] = useState(
    "<p style='color:#aaa;text-align:center;margin-top:60px;font-style:italic;'>Your tailored Cover Letter will appear here.</p>"
  );

  const [isLoadingCV, setIsLoadingCV] = useState(false);
  const [isLoadingCL, setIsLoadingCL] = useState(false);

  const documentRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = useReactToPrint({
    contentRef: documentRef,
    documentTitle: activeTab === "cv" ? "Tailored_CV" : "Cover_Letter",
  });

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsExtracting(true);

    const reader = new FileReader();
    reader.onload = async(event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setProfileMarkdown(content);
        try {
          const res = await fetch("/api/extract-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileMarkdown: content }),
          });
          const data = await res.json();
          if (data && !data.error) {
            setPersonalInfo(data); // Populate the form!
          }
        } catch (err) {
          console.error("Extraction failed", err);
        } finally {
          setIsExtracting(false);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleRemoveFile = () => {
    setFileName(null);
    setProfileMarkdown("");
  };

  const handleGenerate = async (type: "cv" | "coverLetter") => {
    if (!profileMarkdown || !jobDescription) {
      alert("Please provide both your profile and the job description.");
      return;
    }
    setActiveTab(type);
    if (type === "cv") {
      setIsLoadingCV(true);
      setCvHtml("<p style='color:#4e7242;text-align:center;margin-top:60px;font-style:italic;'>✦ Tailoring your CV…</p>");
    } else {
      setIsLoadingCL(true);
      setCoverLetterHtml("<p style='color:#4e7242;text-align:center;margin-top:60px;font-style:italic;'>✦ Drafting your Cover Letter…</p>");
    }
    try {
      const response = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileMarkdown, jobDescription, documentType: type }),
      });
      const data = await response.json();
      if (data.generatedHtml) {
        if (type === "cv") setCvHtml(data.generatedHtml);
        else setCoverLetterHtml(data.generatedHtml);
      } else {
        alert("Something went wrong: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to the API.");
    } finally {
      if (type === "cv") setIsLoadingCV(false);
      else setIsLoadingCL(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:          #f0ece4;
          --panel:       #faf8f4;
          --border:      #ddd8ce;
          --border2:     #cec8bc;
          --moss:        #4e7242;
          --moss-mid:    #6a9460;
          --moss-light:  #c2d9bc;
          --amber:       #c9883a;
          --amber-light: #f0d9b8;
          --ink:         #27231c;
          --ink-mid:     #5c564e;
          --ink-soft:    #9c958c;
          --white:       #fffefb;
          --tray:        #3a3a3a;
          --tray-dark:   #2e2e2e;
          --radius-sm:   8px;
          --radius-md:   14px;
          --radius-lg:   20px;
        }

        html, body { height: 100%; overflow: hidden; }

        .root {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          font-family: 'Nunito', sans-serif;
          color: var(--ink);
        }

        /* ══════════════════════════════════════
           FIXED SIDEBAR
        ══════════════════════════════════════ */
        .sidebar {
          width: 360px;
          flex-shrink: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--panel);
          border-right: 1px solid var(--border);
          position: relative;
          z-index: 20;
          overflow: hidden;
        }

        .sidebar > * { position: relative; z-index: 1; }

        .sb-header {
          padding: 32px 28px 20px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .sb-title {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          font-weight: 700;
          line-height: 1.18;
          color: var(--ink);
          letter-spacing: -0.02em;
        }
        .sb-title span {
          font-style: italic;
          font-weight: 400;
          color: var(--amber);
        }

        .sb-body {
          flex: 1;
          overflow-y: auto;
          padding: 22px 28px 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          scrollbar-width: thin;
          scrollbar-color: var(--border2) transparent;
        }

        .field-block { display: flex; flex-direction: column; gap: 7px; }

        .field-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .field-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: var(--ink-mid);
        }

        .upload-pill {
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          font-weight: 700;
          background: var(--amber-light);
          color: var(--amber);
          border: 1.5px solid rgba(201,136,58,0.28);
          border-radius: 20px;
          padding: 4px 13px;
          cursor: pointer;
          transition: all 0.18s;
        }
        .upload-pill:hover {
          background: var(--amber);
          color: white;
          border-color: var(--amber);
          transform: translateY(-1px);
        }

        .file-tag {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #eef5ec;
          border: 1px solid var(--moss-light);
          border-radius: var(--radius-sm);
          padding: 7px 12px;
          font-size: 12px;
          color: var(--moss);
          font-weight: 600;
        }
        .file-tag button {
          background: none; border: none; cursor: pointer;
          font-size: 11px; color: var(--ink-soft);
          font-family: 'Nunito', sans-serif;
          transition: color 0.15s; padding: 0; font-weight: 700;
        }
        .file-tag button:hover { color: #c0392b; }

        .textarea {
          width: 100%;
          height: 150px;
          padding: 12px 14px;
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          color: var(--ink);
          line-height: 1.65;
          resize: none;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .textarea::placeholder { color: var(--ink-soft); }
        .textarea:focus {
          border-color: var(--moss-mid);
          box-shadow: 0 0 0 3px rgba(78,114,66,0.10);
        }

        /* ── Input fields (matches .textarea) ── */
        .input-field {
          width: 100%;
          padding: 10px 14px;
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          color: var(--ink);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field::placeholder { color: var(--ink-soft); }
        .input-field:focus {
          border-color: var(--moss-mid);
          box-shadow: 0 0 0 3px rgba(78,114,66,0.10);
        }

        /* ── Grid for Personal Details ── */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 2px;
        }
        .info-grid .col-span-2 {
          grid-column: span 2;
        }

        .extracting-status {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--amber);
          animation: pulse 1.5s infinite;
        }

        /* Pinned footer — never scrolls away */
        .sb-footer {
          flex-shrink: 0;
          padding: 16px 28px 28px;
          border-top: 1px solid var(--border);
          background: var(--panel);
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          z-index: 1;
        }
        .sb-footer::before {
          content: '';
          position: absolute;
          top: -18px; left: 0; right: 0;
          height: 18px;
          background: linear-gradient(to bottom, transparent, rgba(250,248,244,0.95));
          pointer-events: none;
        }

        .btn-cv {
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 700;
          background: var(--moss);
          color: white;
          border: none;
          padding: 15px 24px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 18px rgba(78,114,66,0.25);
        }
        .btn-cv:hover:not(:disabled) {
          background: var(--moss-mid);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(78,114,66,0.32);
        }
        .btn-cv:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

        .btn-cl {
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 600;
          background: transparent;
          color: var(--ink-mid);
          border: 1.5px solid var(--border2);
          padding: 13px 24px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-cl:hover:not(:disabled) {
          background: #eef5ec;
          border-color: var(--moss-light);
          color: var(--moss);
          transform: translateY(-1px);
        }
        .btn-cl:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ══════════════════════════════════════
           RIGHT PANEL — fixed height, two zones:
           1. ws-topbar  → sticky header bar
           2. ws-scroll  → scrollable A4 tray
        ══════════════════════════════════════ */
        .workspace {
          flex: 1;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--tray);
        }

        /* Top chrome bar — tabs + export, fixed at top of workspace */
        .ws-topbar {
          flex-shrink: 0;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          background: var(--panel);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: relative;
          z-index: 10;
        }

        .ws-label {
          font-family: 'Playfair Display', serif;
          font-size: 13px;
          font-style: italic;
          color: rgba(7, 5, 5, 0.35);
          letter-spacing: 0.01em;
        }

        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Tabs in dark tray style */
        .tab-group {
          display: flex;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(5, 5, 5, 0.1);
          border-radius: var(--radius-md);
          padding: 4px;
          gap: 3px;
        }

        .tab {
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 700;
          padding: 7px 20px;
          border-radius: 9px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: rgba(7, 6, 6, 0.45);
          letter-spacing: 0.04em;
        }
        .tab:hover { color: rgba(255, 136, 0, 0.91); }
        .tab.active {
          background: var(--white);
          color: var(--ink);
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }

        .export-btn {
          font-family: 'Nunito', sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.18);
          color: rgba(0, 0, 0, 0.55);
          padding: 8px 15px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .export-btn:hover {
          background: var(--amber);
          border-color: var(--amber);
          color: white;
          box-shadow: 0 4px 16px rgba(201,136,58,0.40);
          transform: translateY(-1px);
        }

        /* The actual scrollable tray where A4 pages live */
        .ws-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: auto;
          /* CvEditor renders its own .a4-page-viewer with dark bg + pages */
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.15) transparent;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @media print {
          .sidebar, .ws-topbar { display: none; }
          .workspace { height: auto; }
          .ws-scroll { overflow: visible; }
        }
      `}</style>

      <div className="root">

        {/* ── FIXED SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sb-header">
            <h1 className="sb-title">
              Land your<br /><span>dream role</span>
            </h1>
          </div>

          <div className="sb-body">
            {/* Profile */}
            <div className="field-block">
              <div className="field-row">
                <span className="field-label">Your Profile</span>
                <label className="upload-pill">
                  ↑ Upload .md
                  <input type="file" accept=".md,.txt" style={{ display: "none" }} onChange={handleFileUpload} />
                </label>
              </div>
              {fileName && (
                <div className="file-tag">
                  <span>📄 {fileName}</span>
                  <button onClick={handleRemoveFile}>✕ Remove</button>
                </div>
              )}
              <textarea
                className="textarea"
                value={profileMarkdown}
                onChange={(e) => setProfileMarkdown(e.target.value)}
                placeholder="Paste your markdown profile, or upload a .md file…"
              />
              {/* --- Extracted Info Panel --- */}
            <div className="field-block">
              <div className="field-row">
                <span className="field-label">Personal Details</span>
                {isExtracting && (
                  <span className="extracting-status">⏳ Extracting...</span>
                )}
              </div>
              
              <div className="info-grid">
                <input 
                  type="text" placeholder="First Name" 
                  value={personalInfo.Firstname} 
                  onChange={e => setPersonalInfo({...personalInfo, Firstname: e.target.value})}
                  className="input-field" 
                />
                <input 
                  type="text" placeholder="Last Name" 
                  value={personalInfo.Lastname} 
                  onChange={e => setPersonalInfo({...personalInfo, Lastname: e.target.value})}
                  className="input-field" 
                />
                <input 
                  type="email" placeholder="Email" 
                  value={personalInfo.email} 
                  onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})}
                  className="input-field" 
                />
                <input 
                  type="text" placeholder="Phone" 
                  value={personalInfo.phone} 
                  onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})}
                  className="input-field" 
                />
                <input 
                  type="text" placeholder="Location" 
                  value={personalInfo.location} 
                  onChange={e => setPersonalInfo({...personalInfo, location: e.target.value})}
                  className="input-field" 
                />
                <input 
                  type="text" placeholder="Portfolio URL" 
                  value={personalInfo.Portfolio} 
                  onChange={e => setPersonalInfo({...personalInfo, Portfolio: e.target.value})}
                  className="input-field" 
                />
                <input 
                  type="text" placeholder="LinkedIn URL" 
                  value={personalInfo.linkedin} 
                  onChange={e => setPersonalInfo({...personalInfo, linkedin: e.target.value})}
                  className="input-field col-span-2" 
                />
              </div>
            </div>
            {/* ------------------------------- */}
            </div>

            {/* Job description */}
            <div className="field-block">
              <div className="field-row">
                <span className="field-label">Job Description</span>
              </div>
              <textarea
                className="textarea"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job listing here…"
              />
            </div>
          </div>

          {/* Pinned generate buttons */}
          <div className="sb-footer">
            <button
              className="btn-cv"
              onClick={() => handleGenerate("cv")}
              disabled={isLoadingCV || isLoadingCL}
            >
              {isLoadingCV
                ? <><span style={{ animation: "pulse 1s infinite" }}>⏳</span> Crafting CV…</>
                : <><span>✦</span> Generate CV</>}
            </button>
            <button
              className="btn-cl"
              onClick={() => handleGenerate("coverLetter")}
              disabled={isLoadingCV || isLoadingCL}
            >
              {isLoadingCL
                ? <><span style={{ animation: "pulse 1s infinite" }}>⏳</span> Writing Letter…</>
                : <><span>✉</span> Write Cover Letter</>}
            </button>
          </div>
        </aside>

        {/* ── RIGHT WORKSPACE ── */}
        <main className="workspace">

          {/* Sticky dark chrome bar */}
          <div className="ws-topbar">
            <span className="ws-label">Document Preview</span>

            <div className="toolbar-right">
              <div className="tab-group">
                <button
                  className={`tab${activeTab === "cv" ? " active" : ""}`}
                  onClick={() => setActiveTab("cv")}
                >
                  CV
                </button>
                <button
                  className={`tab${activeTab === "coverLetter" ? " active" : ""}`}
                  onClick={() => setActiveTab("coverLetter")}
                >
                  Cover Letter
                </button>
              </div>

              <button className="export-btn" onClick={() => handleExportPDF()}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export PDF
              </button>
            </div>
          </div>

          {/* 
            Scrollable A4 tray.
            CvEditor renders its own .a4-page-viewer wrapper with:
            - dark #3a3a3a background
            - white A4 paper sheet(s) with shadow
            - visual page-break lines every 297mm
          */}
          <div className="ws-scroll">
            <div ref={documentRef}>
              <CvEditor content={activeTab === "cv" ? cvHtml : coverLetterHtml} />
            </div>
          </div>

        </main>

      </div>
    </>
  );
}