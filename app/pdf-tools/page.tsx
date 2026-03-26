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
      // Append new files to the existing array
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

  // --- TOOL 2: SPLIT PDF (Extracts first page as an example, or splits all) ---
  const handleSplit = async () => {
    if (files.length !== 1) return alert("Please upload exactly 1 PDF to split.");
    setProcessing(true);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const totalPages = originalPdf.getPageCount();

      // For this tool, let's extract every page as its own PDF
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

  // --- TOOL 3: EXTRACT TEXT TO MARKDOWN (Powered by PyMuPDF) ---
  const handleExtractText = async () => {
    if (files.length !== 1) return alert("Please upload exactly 1 PDF to extract.");
    setProcessing(true);
    setMarkdownOutput(""); // Clear old output

    try {
      // Package the file into FormData to send to our API
      const formData = new FormData();
      formData.append("file", files[0]);

      const res = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.text) {
        setMarkdownOutput(data.text.trim());
      } else {
        alert("Extraction Error: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to the extraction API.");
    }
    
    setProcessing(false);
  };

  // Helper to trigger browser download
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

  return (
    <>

      <div className="toolkit-layout">
        
        {/* LEFT SIDEBAR */}
        <div className="sidebar">
          <Link href="/" className="back-link">&larr; Back to Studio</Link>
          <div className="header">
            <h1>PDF Toolkit</h1>
            <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '8px' }}>Process files locally. 100% private.</p>
          </div>
          <div className="tabs" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
            <button className={`tab-btn ${activeTab === "merge" ? "active" : ""}`} onClick={() => { setActiveTab("merge"); clearFiles(); }}>
              Merge PDFs
            </button>
            <button className={`tab-btn ${activeTab === "split" ? "active" : ""}`} onClick={() => { setActiveTab("split"); clearFiles(); }}>
              Split PDF Pages
            </button>
            <button className={`tab-btn ${activeTab === "markdown" ? "active" : ""}`} style={{ opacity: 0.65, cursor: 'not-allowed' }}>
              Extract Text (Markdown)
              <span style={{ fontSize: '10px', color: 'var(--ink-soft)', marginLeft: '6px' }}>(Coming Soon)</span>
            </button>
          </div>
        </div>

        {/* RIGHT WORKSPACE */}
        <div className="workspace">
          <div className="tool-container">
            
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', marginBottom: '8px' }}>
              {activeTab === "merge" && "Merge Application Documents"}
              {activeTab === "split" && "Split PDF into Pages"}
              {activeTab === "markdown" && "Extract Text from PDF"}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '24px' }}>
              {activeTab === "merge" && "Upload your generated Cover Letter, CV, and transcripts. They will be merged in the order you upload them."}
              {activeTab === "split" && "Upload a single PDF. This tool will split every page into its own standalone PDF file."}
              {activeTab === "markdown" && "Upload a PDF resume. We will extract the raw text so you can paste it into your Master Markdown Profile."}
            </p>

            {/* Upload Box */}
            <label className="upload-area" style={{ display: 'block' }}>
              <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📂</span>
              <span style={{ fontWeight: 700, color: 'var(--ink-mid)' }}>Click to upload PDF files</span>
              <input type="file" multiple={activeTab === "merge"} accept=".pdf" style={{ display: "none" }} onChange={handleFileChange} />
            </label>

            {/* File List */}
            {files.length > 0 && (
              <div className="file-list">
                {files.map((f, i) => (
                  <div key={i} className="file-item">
                    <span>{i + 1}. {f.name}</span>
                  </div>
                ))}
                <button onClick={clearFiles} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textAlign: 'right', marginTop: '4px' }}>
                  Clear Files
                </button>
              </div>
            )}

            {/* Action Buttons */}
            {activeTab === "merge" && (
              <button className="action-btn" onClick={handleMerge} disabled={files.length < 2 || processing}>
                {processing ? "Merging..." : "Merge PDFs & Download"}
              </button>
            )}

            {activeTab === "split" && (
              <button className="action-btn" onClick={handleSplit} disabled={files.length !== 1 || processing}>
                {processing ? "Splitting..." : "Split & Download All Pages"}
              </button>
            )}

            {activeTab === "markdown" && (
              <>
                <button className="action-btn" onClick={handleExtractText} disabled={files.length !== 1 || processing}>
                  {processing ? "Extracting..." : "Extract Raw Text"}
                </button>
                {markdownOutput && (
                  <textarea 
                    className="md-output" 
                    value={markdownOutput} 
                    onChange={(e) => setMarkdownOutput(e.target.value)}
                    placeholder="Extracted text will appear here..."
                  />
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}