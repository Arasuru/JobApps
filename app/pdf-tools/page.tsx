"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import "./pdf-tools.css";

export default function PdfToolsPage() {
  const [activeTab, setActiveTab] = useState<"merge" | "split" | "markdown">("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [markdownOutput, setMarkdownOutput] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setMarkdownOutput("");
  };

  // --- TOOL 1: MERGE PDFs ---
  const handleMerge = async () => {
    if (files.length < 2) return alert("Please upload at least 2 PDFs to merge.");
    setProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save();
      downloadFile(mergedBytes, "Merged_Application.pdf", "application/pdf");
    } catch (error) {
      console.error(error);
      alert("Failed to merge PDFs.");
    }
    setProcessing(false);
  };

  // --- TOOL 2: SPLIT PDF ---
  const handleSplit = async () => {
    if (files.length !== 1) return alert("Please upload exactly 1 PDF to split.");
    setProcessing(true);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const totalPages = originalPdf.getPageCount();

      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
        newPdf.addPage(copiedPage);
        const pdfBytes = await newPdf.save();
        downloadFile(pdfBytes, `Page_${i + 1}_${files[0].name}`, "application/pdf");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to split PDF.");
    }
    setProcessing(false);
  };

  // --- TOOL 3: EXTRACT TEXT TO MARKDOWN ---
  const handleExtractText = async () => {
    if (files.length !== 1) return alert("Please upload exactly 1 PDF to extract.");
    
    setProcessing(true);
    setMarkdownOutput("");

    try {
      const formData = new FormData();
      formData.append("file", files[0]);

      const res = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      // 1. Grab the raw response as plain text FIRST, no matter what it is.
      const rawText = await res.text(); 

      // 2. If the server threw a 500 error, stop here and show us the real problem.
      if (!res.ok) {
         console.error("The Server completely crashed:", rawText);
         alert(`Server Error: ${res.status}. Check console for details.`);
         return; // The 'finally' block below will still run and turn off the spinner!
      }

      // 3. If it IS ok, now it is safe to turn that text into JSON.
      const data = JSON.parse(rawText);

      if (data.text) {
        // 1. Package the text into a Markdown file (Blob)
        const blob = new Blob(["\uFEFF" + data.text.trim()], { type: 'text/markdown;charset=utf-8' });
        
        // 2. Create an invisible download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // 3. Name the file (If you have a 'files' state, we try to use its name, otherwise fallback)
        const originalName = files[0]?.name || 'document.pdf';
        link.download = originalName.replace(/\.pdf$/i, '.md'); 
        
        // 4. Force the browser to click the link, then clean up the garbage
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
    } catch (error) {
      // Catches network failures (like if the Python server is offline)
      console.error("Network or Parsing Error:", error);
      alert("Failed to connect to the server or parse the file.");
      
    } finally {
      // 💡 This guarantees your UI spinner turns off, no matter what happened above!
      setProcessing(false);
    }
  };

  const downloadFile = (data: Uint8Array, filename: string, type: string) => {
    const blob = new Blob([data as BlobPart], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabTitles = {
    merge:    "Merge Application Documents",
    split:    "Split PDF into Pages",
    markdown: "Extract Text from PDF",
  };

  const tabDescriptions = {
    merge:    "Upload your Cover Letter, CV, and transcripts. They will be merged in the order you upload them.",
    split:    "Upload a single PDF. This tool will split every page into its own standalone PDF file.",
    markdown: "Upload a PDF resume. We will extract the raw text so you can paste it into your Master Markdown Profile.",
  };

  return (
    <div className="toolkit-layout">

      {/* ── LEFT SIDEBAR ── */}
      <div className="sidebar">
        <Link href="/" className="back-link">← Back to Studio</Link>

        <div className="header">
          <h1>PDF <span>Toolkit</span></h1>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '8px', lineHeight: '1.6' }}>
            Process files locally. 100% private.
          </p>
        </div>

        <div className="tabs">
          <button
            className={`tab-btn${activeTab === "merge" ? " active" : ""}`}
            onClick={() => { setActiveTab("merge"); clearFiles(); }}
          >
            Merge PDFs
          </button>

          <button
            className={`tab-btn${activeTab === "split" ? " active" : ""}`}
            onClick={() => { setActiveTab("split"); clearFiles(); }}
          >
            Split PDF Pages
          </button>

          {/* Coming soon — disabled */}
          <button
            className={`tab-btn${activeTab === "markdown" ? " active" : ""}`}
            onClick={() => { setActiveTab("markdown"); clearFiles(); }}
          >
            Extract Text
          </button>
        </div>
      </div>

      {/* ── RIGHT WORKSPACE ── */}
      <div className="workspace">
        <div className="tool-container">

          {/* Title */}
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '22px',
            fontWeight: 400,
            color: 'var(--ink)',
            marginBottom: '8px',
            letterSpacing: '-0.01em',
          }}>
            {tabTitles[activeTab]}
          </h2>

          {/* Description */}
          <p style={{
            fontSize: '13.5px',
            color: 'var(--ink-soft)',
            marginBottom: '28px',
            lineHeight: '1.65',
          }}>
            {tabDescriptions[activeTab]}
          </p>

          {/* Upload box */}
          <label className="upload-area">
            <span style={{ fontSize: '28px', display: 'block', marginBottom: '10px' }}>📂</span>
            <span style={{
              fontWeight: 600,
              fontSize: '13.5px',
              color: 'var(--ink-mid)',
              display: 'block',
              marginBottom: '4px',
            }}>
              Click to upload PDF{activeTab === "merge" ? "s" : ""}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
              {activeTab === "merge" ? "Select multiple files" : "Select one file"}
            </span>
            <input
              type="file"
              multiple={activeTab === "merge"}
              accept=".pdf"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </label>

          {/* File list */}
          {files.length > 0 && (
            <div className="file-list">
              {files.map((f, i) => (
                <div key={i} className="file-item">
                  <span>{i + 1}. {f.name}</span>
                </div>
              ))}
              <button
                onClick={clearFiles}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink-soft)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'right',
                  marginTop: '4px',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ember-mid)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-soft)')}
              >
                ✕ Clear all files
              </button>
            </div>
          )}

          {/* Action buttons */}
          {activeTab === "merge" && (
            <button
              className="action-btn"
              onClick={handleMerge}
              disabled={files.length < 2 || processing}
            >
              {processing ? "Merging…" : "⬇ Merge PDFs & Download"}
            </button>
          )}

          {activeTab === "split" && (
            <button
              className="action-btn"
              onClick={handleSplit}
              disabled={files.length !== 1 || processing}
            >
              {processing ? "Splitting…" : "⬇ Split & Download All Pages"}
            </button>
          )}

          {activeTab === "markdown" && (
            <>
              <button
                className="action-btn"
                onClick={handleExtractText}
                disabled={files.length !== 1 || processing}
              >
                {processing ? "Extracting…" : "Extract Raw Text"}
              </button>
              {markdownOutput && (
                <textarea
                  className="md-output"
                  value={markdownOutput}
                  onChange={(e) => setMarkdownOutput(e.target.value)}
                  placeholder="Extracted text will appear here…"
                />
              )}
            </>
          )}

        </div>
      </div>

    </div>
  );
}