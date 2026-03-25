"use client";

import { useState, ChangeEvent, useRef } from "react";
import { useReactToPrint } from "react-to-print";

// Imported CSS file here!
import "./page.css"; 

import JobCoverLetterTemplate from "../components/templates/JobCoverLetterTemplate";
import GermanJobCvTemplate from "../components/templates/GermanJobCvTemplate";

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
      personalInfo
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

  return (
    <div className="root">
      {/* ── FIXED SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sb-header">
          <h1 className="sb-title">
             &copy;Arasuru
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
                type="text" placeholder="Industry Portfolio URL" 
                value={personalInfo.IndustryPortfolio} 
                onChange={e => setPersonalInfo({...personalInfo, IndustryPortfolio: e.target.value})}
                className="input-field" 
              />
              <input 
                type="text" placeholder="PhD Portfolio URL" 
                value={personalInfo.PhDPortfolio} 
                onChange={e => setPersonalInfo({...personalInfo, PhDPortfolio: e.target.value})}
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
        {/* Template Selection */}
        <div className="field-block" style={{ paddingBottom: '10px' }}>
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

        <div className="ws-scroll">
          <div className="ws-scroll a4-wrapper">
            <div ref={documentRef}>
              
              {/* Loading States */}
              {activeTab === "cv" && isLoadingCV && (
                <p style={{color:'#4e7242', textAlign:'center', marginTop:'100px', fontStyle:'italic'}}>
                  <span style={{ animation: "pulse 1s infinite" }}>⏳</span> ✦ Tailoring your CV…
                </p>
              )}
              {activeTab === "coverLetter" && isLoadingCL && (
                <p style={{color:'#4e7242', textAlign:'center', marginTop:'100px', fontStyle:'italic'}}>
                  <span style={{ animation: "pulse 1s infinite" }}>⏳</span> ✦ Drafting your Cover Letter…
                </p>
              )}

              {/* Render Documents */}
              {activeTab === "cv" && !isLoadingCV && cvData && cvTemplate === "job-germany" && (
                <GermanJobCvTemplate cvData={cvData} personalInfo={personalInfo} />
              )}
              
              {/* (Add other CV templates here later: phd-germany, job-india) */}

              {activeTab === "coverLetter" && !isLoadingCL && coverLetterData && (
                <JobCoverLetterTemplate clData={coverLetterData} personalInfo={personalInfo} />
              )}

            </div>
          </div>
        </div>

      </main>

    </div>
  );
}