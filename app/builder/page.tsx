"use client";

import { useState, ChangeEvent, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Link from "next/link";
import "./builder.css";

import JobCoverLetterTemplate from "../../components/templates/JobCoverLetterTemplate";
import GermanJobCvTemplate from "../../components/templates/GermanJobCvTemplate";
import AcademicCoverLetterTemplate from "../../components/templates/AcademicCoverLetterTemplate";
import AcademicCvTemplate from "../../components/templates/AcademicCvTemplate";
import IndianJobCvTemplate from "../../components/templates/IndianJobCvTemplate";

export default function Home() {
  // ── Sidebar toggle ──────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Existing state (unchanged) ──────────────────────────────────────────────
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
    "IndustryPortfolio": "",
    "PhDPortfolio": ""
  });
  const [isExtracting, setIsExtracting] = useState(false);

  const [cvData, setCvData] = useState<any>(null);
  const [coverLetterData, setCoverLetterData] = useState<any>(null);

  const [isLoadingCV, setIsLoadingCV] = useState(false);
  const [isLoadingCL, setIsLoadingCL] = useState(false);

  const [cvTemplate, setCvTemplate] = useState("job-germany");
  const [clTemplate, setClTemplate] = useState("job");

  const documentRef = useRef<HTMLDivElement>(null);

  const [isEditingJson, setIsEditingJson] = useState(false);
  const [jsonString, setJsonString] = useState("");
  const [jsonError, setJsonError] = useState("");

  // ── Handlers (all logic unchanged) ─────────────────────────────────────────
  const toggleJsonEditor = () => {
    const targetData = activeTab === "cv" ? cvData : coverLetterData;
    if (!targetData) {
      alert("Please generate a document first before editing its data.");
      return;
    }
    setJsonString(JSON.stringify(targetData, null, 2));
    setIsEditingJson(true);
    setJsonError("");
  };

  const saveJson = () => {
    try {
      const parsed = JSON.parse(jsonString);
      if (activeTab === "cv") setCvData(parsed);
      else setCoverLetterData(parsed);
      setIsEditingJson(false);
      setJsonError("");
    } catch (e) {
      setJsonError("Invalid JSON. Please check for missing commas or quotes.");
    }
  };

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
    reader.onload = async (event) => {
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
            setPersonalInfo(data);
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
      setCvData(null);
    } else {
      setIsLoadingCL(true);
      setCoverLetterData(null);
    }

    const payload = {
      profileMarkdown,
      jobDescription,
      documentType: type,
      templateType: type === "cv" ? cvTemplate : clTemplate,
      personalInfo,
    };

    try {
      const response = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.documentData) {
        if (type === "cv") setCvData(data.documentData);
        else setCoverLetterData(data.documentData);
      } else {
        alert("Something went wrong: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to the API.");
    } finally {
      if (type === "cv") setIsLoadingCV(false);
      else setIsLoadingCL(false);
    }
  };

  // ── Document renderer (logic unchanged, loading colors updated) ─────────────
  const renderDocument = () => {
    if (activeTab === "cv" && isLoadingCV) {
      return (
        <p style={{
          color: '#f0855a',
          textAlign: 'center',
          marginTop: '100px',
          fontStyle: 'italic',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '15px',
          letterSpacing: '0.01em',
        }}>
          <span style={{ animation: "pulse 1s infinite", marginRight: '8px' }}>⏳</span>
          ✦ Tailoring your CV…
        </p>
      );
    }
    if (activeTab === "coverLetter" && isLoadingCL) {
      return (
        <p style={{
          color: '#f0855a',
          textAlign: 'center',
          marginTop: '100px',
          fontStyle: 'italic',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '15px',
          letterSpacing: '0.01em',
        }}>
          <span style={{ animation: "pulse 1s infinite", marginRight: '8px' }}>⏳</span>
          ✦ Drafting your Cover Letter…
        </p>
      );
    }

    if (activeTab === "cv" && cvData) {
      switch (cvTemplate) {
        case "job-germany":
          return <GermanJobCvTemplate cvData={cvData} personalInfo={personalInfo} />;
        case "job-india":
          return <IndianJobCvTemplate cvData={cvData} personalInfo={personalInfo} />;
        case "phd-germany":
          return <AcademicCvTemplate cvData={cvData} personalInfo={personalInfo} />;
        default:
          return <GermanJobCvTemplate cvData={cvData} personalInfo={personalInfo} />;
      }
    }

    if (activeTab === "coverLetter" && coverLetterData) {
      switch (clTemplate) {
        case "job":
          return <JobCoverLetterTemplate clData={coverLetterData} personalInfo={personalInfo} />;
        case "phd":
          return <AcademicCoverLetterTemplate clData={coverLetterData} personalInfo={personalInfo} />;
        default:
          return <JobCoverLetterTemplate clData={coverLetterData} personalInfo={personalInfo} />;
      }
    }

    // Empty state
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '12px',
        color: '#4a3e36',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4a3e36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <p style={{ fontSize: '14px', fontStyle: 'italic' }}>Your document will appear here</p>
      </div>
    );
  };

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className={`root${sidebarOpen ? "" : " sidebar-closed"}`}>

      {/* Backdrop — clicking closes sidebar */}
      <div
        className="sidebar-backdrop"
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sb-header">
          <h1 className="sb-title">The Career <span>Studio</span></h1>
          <button
            className="sb-close-btn"
            aria-label="Close sidebar"
          >
            <Link href="/" >←</Link>
          </button>
          <button
            className="sb-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className="sb-body">

          {/* Profile */}
          <div className="field-block">
            <div className="field-row">
              <span className="field-label">Your Profile</span>
              <label className="upload-pill">
                ↑ Upload .md
                <input
                  type="file"
                  accept=".md,.txt"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
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
          </div>

          {/* Personal Details */}
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
                onChange={e => setPersonalInfo({ ...personalInfo, Firstname: e.target.value })}
                className="input-field"
              />
              <input
                type="text" placeholder="Last Name"
                value={personalInfo.Lastname}
                onChange={e => setPersonalInfo({ ...personalInfo, Lastname: e.target.value })}
                className="input-field"
              />
              <input
                type="email" placeholder="Email"
                value={personalInfo.email}
                onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                className="input-field"
              />
              <input
                type="text" placeholder="Phone"
                value={personalInfo.phone}
                onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                className="input-field"
              />
              <input
                type="text" placeholder="Location"
                value={personalInfo.location}
                onChange={e => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                className="input-field"
              />
              <input
                type="text" placeholder="Industry Portfolio URL"
                value={personalInfo.IndustryPortfolio}
                onChange={e => setPersonalInfo({ ...personalInfo, IndustryPortfolio: e.target.value })}
                className="input-field"
              />
              <input
                type="text" placeholder="PhD Portfolio URL"
                value={personalInfo.PhDPortfolio}
                onChange={e => setPersonalInfo({ ...personalInfo, PhDPortfolio: e.target.value })}
                className="input-field"
              />
              <input
                type="text" placeholder="LinkedIn URL"
                value={personalInfo.linkedin}
                onChange={e => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                className="input-field col-span-2"
              />
            </div>
          </div>

          {/* Job Description */}
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

          {/* Template Selection */}
          <div className="field-block">
            <div className="field-row">
              <span className="field-label">Document Templates</span>
            </div>
            <div className="info-grid">
              <select
                value={cvTemplate}
                onChange={(e) => setCvTemplate(e.target.value)}
                className="input-field"
              >
                <option value="job-germany">CV: Job (Germany)</option>
                <option value="phd-germany">CV: PhD (Germany)</option>
                <option value="job-india">CV: Job (India)</option>
              </select>
              <select
                value={clTemplate}
                onChange={(e) => setClTemplate(e.target.value)}
                className="input-field"
              >
                <option value="job">Letter: Job</option>
                <option value="phd">Letter: PhD</option>
              </select>
            </div>
          </div>

        </div>

        {/* Pinned footer — generate buttons */}
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

      {/* ── WORKSPACE ── */}
      <main className="workspace">

        {/* Top chrome bar */}
        <div className="ws-topbar">

          {/* Hamburger toggle */}
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle sidebar"
          >
            <span /><span /><span />
          </button>

          {/* Centered label */}
          <span className="ws-label">Career Studio</span>

          {/* Right toolbar */}
          <div className="toolbar-right">
            {!isEditingJson ? (
              <>
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

                <button
                  className="export-btn"
                  onClick={toggleJsonEditor}
                  style={{ borderColor: 'transparent' }}
                >
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px' }}>{`{ }`}</span>
                  Edit Data
                </button>

                <button className="export-btn" onClick={() => handleExportPDF()}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export PDF
                </button>
              </>
            ) : (
              <>
                {jsonError && (
                  <span style={{ color: '#f0855a', fontSize: '12px', fontWeight: 600 }}>
                    {jsonError}
                  </span>
                )}
                <button
                  className="export-btn"
                  onClick={() => setIsEditingJson(false)}
                  style={{ borderColor: 'transparent' }}
                >
                  Cancel
                </button>
                <button
                  className="export-btn"
                  onClick={saveJson}
                  style={{ background: 'var(--ember)', color: 'var(--coral)', borderColor: 'var(--ember)' }}
                >
                  ✓ Apply Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="ws-scroll">
          {isEditingJson ? (
            <div className="json-editor-wrapper">
              <textarea
                className="json-textarea"
                value={jsonString}
                onChange={(e) => setJsonString(e.target.value)}
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="a4-wrapper">
              <div ref={documentRef}>
                {renderDocument()}
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}