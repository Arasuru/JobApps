"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useReactToPrint } from "react-to-print";
import Link from "next/link";
import "./cv-writer.css";

import GermanJobCvTemplate from "../../components/templates/GermanJobCvTemplate";
import AcademicCvTemplate from "../../components/templates/AcademicCvTemplate";
import IndianJobCvTemplate from "../../components/templates/IndianJobCvTemplate";

import {
  CV_TEMPLATES,
  EMPTY_PERSONAL_INFO,
  FIELD_LABELS,
  FIELD_PAIRS,
  getTemplate,
  type TemplateId,
  type PersonalInfo,
} from "../../components/templates/registry";

// ─── localStorage helpers

function loadStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveStored(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── Component

export default function CvWriter() {
  // ── State ──
  const [profileMarkdown, setProfileMarkdown] = useState("");
  const [fileName, setFileName]               = useState<string | null>(null);
  const [jobDescription, setJobDescription]   = useState("");
  const [personalInfo, setPersonalInfo]       = useState<PersonalInfo>(EMPTY_PERSONAL_INFO);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("european");
  const [cvData, setCvData]                   = useState<any>(null);
  const [isLoading, setIsLoading]             = useState(false);
  const [isExtracting, setIsExtracting]       = useState(false);
  const [sidebarOpen, setSidebarOpen]         = useState(true);
  const documentRef = useRef<HTMLDivElement>(null);

  //Load from localStorage on mount
  useEffect(() => {
    setProfileMarkdown(loadStored("profileMarkdown", ""));
    setPersonalInfo(loadStored("personalInfo", EMPTY_PERSONAL_INFO));
  }, []);

  // ── Persist to localStorage on change ──
  useEffect(() => { saveStored("profileMarkdown", profileMarkdown); }, [profileMarkdown]);
  useEffect(() => { saveStored("personalInfo", personalInfo); }, [personalInfo]);

  // ── Derived ──
  const template      = getTemplate(selectedTemplate);
  const visibleFields = template.fields;

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
    setCvData(null);

    try {
      const response = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileMarkdown,
          jobDescription,
        }),
      });
      const data = await response.json();
      if (data.documentData) setCvData(data.documentData);
      else alert("Something went wrong: " + (data.error || "Unknown error"));
    } catch {
      alert("Failed to connect to the API.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = useReactToPrint({
    contentRef: documentRef,
    documentTitle: "CV",
  });

  // ── Template renderer ──
  const renderTemplate = () => {
    if (isLoading) return (
      <div className="cv-empty-state">
        <span className="cv-loading-icon">⏳</span>
        <p>Tailoring your CV…</p>
      </div>
    );

    if (!cvData) return (
      <div className="cv-empty-state">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <p>Your CV will appear here</p>
      </div>
    );

    switch (selectedTemplate) {
      case "european":   return <GermanJobCvTemplate  cvData={cvData} personalInfo={personalInfo} />;
      case "academic":   return <AcademicCvTemplate   cvData={cvData} personalInfo={personalInfo} />;
      case "south-asian": return <IndianJobCvTemplate  cvData={cvData} personalInfo={personalInfo} />;
      default:           return <GermanJobCvTemplate  cvData={cvData} personalInfo={personalInfo} />;
    }
  };

  // ── JSX ──
  return (
    <div className={`cw-root${sidebarOpen ? "" : " sidebar-collapsed"}`}>

      {/* ── LEFT SIDEBAR — inputs ── */}
      <aside className="cw-left">

        {/* Header */}
        <div className="cw-left-header">
          <Link href="/" className="cw-back-btn" aria-label="Back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <span className="cw-left-title">CV Writer</span>
        </div>

        {/* Scrollable body */}
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

          {/* Personal Details — only fields the selected template needs */}
          <div className="cw-field-block">
            <div className="cw-field-row">
              <span className="cw-field-label">Personal Details</span>
            </div>
            <div className="cw-info-grid">
              {FIELD_PAIRS.map((pair, pi) => {
                // Only render pairs that have at least one visible field
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
              ? <><span style={{ animation: "pulse 1s infinite" }}>⏳</span> Crafting CV…</>
              : <><span>✦</span> Generate CV</>}
          </button>
        </div>
      </aside>

      {/* ── CENTER — preview ── */}
      <main className="cw-center">

        {/* Topbar */}
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

        {/* A4 preview area */}
        <div className="cw-preview-scroll">
          <div className="cw-a4-wrapper">
            <div ref={documentRef}>
              {renderTemplate()}
            </div>
          </div>
        </div>

      </main>

      {/* ── RIGHT SIDEBAR — template picker ── */}
      <aside className="cw-right">
        <div className="cw-right-header">
          <span className="cw-field-label">Templates</span>
        </div>
        <div className="cw-template-list">
          {CV_TEMPLATES.map(t => (
            <button
              key={t.id}
              className={`cw-template-item${selectedTemplate === t.id ? " selected" : ""}`}
              onClick={() => setSelectedTemplate(t.id)}
            >
              <div className="cw-template-indicator" />
              <div className="cw-template-info">
                <span className="cw-template-name">{t.name}</span>
                <div className="cw-template-tags">
                  <span className="cw-tag">{t.tags[0]}</span>
                  <span className="cw-tag-sep">·</span>
                  <span className="cw-tag">{t.tags[1]}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

    </div>
  );
}