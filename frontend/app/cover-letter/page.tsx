"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useReactToPrint } from "react-to-print";
import Link from "next/link";
import "./cover-letter.css";

import AcademicCoverLetterTemplate from "../../components/templates/AcademicCoverLetterTemplate";
import JobCoverLetterTemplate from "../../components/templates/JobCoverLetterTemplate";

import {
  EMPTY_PERSONAL_INFO,
  FIELD_LABELS,
  type PersonalInfo,
} from "../../components/templates/registry";

// ─── Cover letter template types ─────────────────────────────────────────────

type ClTemplateId = "job" | "academic";

const CL_FIELDS: Record<ClTemplateId, (keyof PersonalInfo)[]> = {
  job:      ["Firstname", "Lastname", "email", "phone", "location", "linkedin", "IndustryPortfolio"],
  academic: ["Firstname", "Lastname", "email", "phone", "location", "PhDPortfolio"],
};

// ─── localStorage helpers

function loadStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function saveStored(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── Component

export default function CoverLetter() {
  const [profileMarkdown, setProfileMarkdown] = useState("");
  const [fileName, setFileName]               = useState<string | null>(null);
  const [jobDescription, setJobDescription]   = useState("");
  const [personalInfo, setPersonalInfo]       = useState<PersonalInfo>(EMPTY_PERSONAL_INFO);
  const [selectedTemplate, setSelectedTemplate] = useState<ClTemplateId>("job");
  const [clData, setClData]                   = useState<any>(null);
  const [isLoading, setIsLoading]             = useState(false);
  const [isExtracting, setIsExtracting]       = useState(false);
  const [sidebarOpen, setSidebarOpen]         = useState(true);

  const documentRef = useRef<HTMLDivElement>(null);

  // ── Hydrate from localStorage ──
  useEffect(() => {
    setProfileMarkdown(loadStored("profileMarkdown", ""));
    setPersonalInfo(loadStored("personalInfo", EMPTY_PERSONAL_INFO));
  }, []);

  // ── Persist to localStorage ──
  useEffect(() => { saveStored("profileMarkdown", profileMarkdown); }, [profileMarkdown]);
  useEffect(() => { saveStored("personalInfo", personalInfo); }, [personalInfo]);

  // ── Derived ──
  const visibleFields = CL_FIELDS[selectedTemplate];

  // ── Handlers ──
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
          if (data && !data.error) setPersonalInfo(data);
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

  const handleFieldChange = (key: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!profileMarkdown || !jobDescription) {
      alert("Please provide both your profile and the job description.");
      return;
    }
    setIsLoading(true);
    setClData(null);
    try {
      const response = await fetch("/api/generate-cl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileMarkdown, jobDescription }),
      });
      const data = await response.json();
      if (data.documentData) setClData(data.documentData);
      else alert("Something went wrong: " + (data.error || "Unknown error"));
    } catch {
      alert("Failed to connect to the API.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = useReactToPrint({
    contentRef: documentRef,
    documentTitle: "Cover Letter",
  });

  // ── Template renderer ──
  const renderTemplate = () => {
    if (isLoading) return (
      <div className="cv-empty-state">
        <span className="cv-loading-icon">⏳</span>
        <p>Writing your cover letter…</p>
      </div>
    );
    if (!clData) return (
      <div className="cv-empty-state">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>Your cover letter will appear here</p>
      </div>
    );
    switch (selectedTemplate) {
      case "job":      return <JobCoverLetterTemplate      clData={clData} personalInfo={personalInfo} />;
      case "academic": return <AcademicCoverLetterTemplate clData={clData} personalInfo={personalInfo} />;
    }
  };

  // ── Personal info field pairs — same pattern as cv-writer ──
  const FIELD_PAIRS: (keyof PersonalInfo)[][] = [
    ["Firstname", "Lastname"],
    ["email", "phone"],
    ["location", "linkedin"],
    ["IndustryPortfolio"],
    ["PhDPortfolio"],
  ];

  // ── JSX ──────────────────────────────────────────────────────────────────────
  return (
    <div className={`cw-root${sidebarOpen ? "" : " sidebar-collapsed"}`}>

      {/* ── LEFT SIDEBAR — inputs ── */}
      <aside className="cw-left">
        <div className="cw-left-header">
          <Link href="/" className="cw-back-btn" aria-label="Back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <span className="cw-left-title">Cover Letter</span>
        </div>

        <div className="cw-left-body">

          {/* Profile */}
          <div className="cw-field-block">
            <div className="cw-field-row">
              <span className="cw-field-label">Your Profile</span>
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
            {isExtracting && <span className="extracting-status">⏳ Extracting info…</span>}
            <textarea
              className="cw-textarea"
              value={profileMarkdown}
              onChange={e => setProfileMarkdown(e.target.value)}
              placeholder="Paste your markdown profile, or upload a .md file…"
            />
          </div>

          {/* Personal Details */}
          <div className="cw-field-block">
            <div className="cw-field-row">
              <span className="cw-field-label">Personal Details</span>
            </div>
            <div className="cw-info-grid">
              {FIELD_PAIRS.map(pair => {
                const visiblePair = pair.filter(f => visibleFields.includes(f));
                if (visiblePair.length === 0) return null;
                return visiblePair.map(field => (
                  <input
                    key={field}
                    type={field === "email" ? "email" : "text"}
                    placeholder={FIELD_LABELS[field]}
                    value={personalInfo[field]}
                    onChange={e => handleFieldChange(field, e.target.value)}
                    className={`cw-input${visiblePair.length === 1 ? " col-span-2" : ""}`}
                  />
                ));
              })}
            </div>
          </div>

          {/* Job Description */}
          <div className="cw-field-block">
            <div className="cw-field-row">
              <span className="cw-field-label">Job Description</span>
            </div>
            <textarea
              className="cw-textarea"
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the job listing here…"
            />
          </div>

        </div>

        {/* Pinned footer */}
        <div className="cw-left-footer">
          <button className="btn-generate" onClick={handleGenerate} disabled={isLoading}>
            {isLoading
              ? <><span style={{ animation: "pulse 1s infinite" }}>⏳</span> Writing…</>
              : <><span>✦</span> Generate Letter</>}
          </button>
        </div>
      </aside>

      {/* ── CENTER — preview ── */}
      <main className="cw-center">
        <div className="cw-topbar">
          <div className="cw-topbar-left">
            <button
              className="cw-sidebar-toggle"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle sidebar"
            >
              <span /><span /><span />
            </button>
            <span className="cw-topbar-title">Career Studio</span>
          </div>
          <button className="cw-export-btn" onClick={() => handleExportPDF()}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export PDF
          </button>
        </div>

        <div className="cw-preview-scroll">
          <div className="cw-a4-wrapper">
            <div ref={documentRef}>
              {renderTemplate()}
            </div>
          </div>
        </div>
      </main>

      {/* ── RIGHT SIDEBAR — template toggle ── */}
      <aside className="cw-right">
        <div className="cw-right-header">
          <span className="cw-field-label">Style</span>
        </div>
        <div className="cl-toggle-group">
          <button
            className={`cl-toggle-btn${selectedTemplate === "job" ? " selected" : ""}`}
            onClick={() => setSelectedTemplate("job")}
          >
            <span className="cl-toggle-name">Job</span>
            <span className="cl-toggle-sub">Industry</span>
          </button>
          <button
            className={`cl-toggle-btn${selectedTemplate === "academic" ? " selected" : ""}`}
            onClick={() => setSelectedTemplate("academic")}
          >
            <span className="cl-toggle-name">Academic</span>
            <span className="cl-toggle-sub">PhD / Research</span>
          </button>
        </div>
      </aside>

    </div>
  );
}