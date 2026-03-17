"use client";

import { useState, ChangeEvent, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import CvEditor from "../components/CvEditor";

export default function Home() {
  const [profileMarkdown, setProfileMarkdown] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  
  const [activeTab, setActiveTab] = useState<'cv' | 'coverLetter'>('cv');
  const [cvHtml, setCvHtml] = useState("<h2 class='text-gray-400 text-center mt-20'>Your generated CV will appear here.</h2>");
  const [coverLetterHtml, setCoverLetterHtml] = useState("<h2 class='text-gray-400 text-center mt-20'>Your generated Cover Letter will appear here.</h2>");
  
  const [isLoadingCV, setIsLoadingCV] = useState(false);
  const [isLoadingCL, setIsLoadingCL] = useState(false);

  // --- NEW: Print Setup ---
  const documentRef = useRef<HTMLDivElement>(null);
  
  const handleExportPDF = useReactToPrint({
    contentRef: documentRef, // <-- Updated for v3 API
    documentTitle: activeTab === 'cv' ? 'Tailored_CV' : 'Cover_Letter',
  });
  // ------------------------

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") setProfileMarkdown(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    setFileName(null);
    setProfileMarkdown("");
  };

  const handleGenerate = async (type: 'cv' | 'coverLetter') => {
    if (!profileMarkdown || !jobDescription) {
      alert("Please provide both your profile and the job description.");
      return;
    }

    setActiveTab(type);

    if (type === 'cv') {
      setIsLoadingCV(true);
      setCvHtml("<h2 class='text-gray-400 text-center mt-20'>Generating your CV...</h2>");
    } else {
      setIsLoadingCL(true);
      setCoverLetterHtml("<h2 class='text-gray-400 text-center mt-20'>Generating your Cover Letter...</h2>");
    }

    try {
      const response = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileMarkdown, jobDescription, documentType: type }),
      });

      const data = await response.json();

      if (data.generatedHtml) {
        if (type === 'cv') setCvHtml(data.generatedHtml);
        else setCoverLetterHtml(data.generatedHtml);
      } else {
        alert("Something went wrong: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to the API.");
    } finally {
      if (type === 'cv') setIsLoadingCV(false);
      else setIsLoadingCL(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-gray-50 text-gray-900">
      
      {/* Left Column: Inputs */}
      <div className="w-1/3 p-8 border-r bg-white shadow-sm flex flex-col gap-6 overflow-y-auto print:hidden">
        <h1 className="text-2xl font-bold">AI CV Builder</h1>
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <label className="font-semibold text-sm">Your Markdown Profile</label>
            <label className="cursor-pointer text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded transition-colors">
              Upload .md
              <input type="file" accept=".md,.txt" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          {fileName && (
            <div className="text-xs text-green-700 bg-green-50 p-2 rounded flex justify-between items-center border border-green-200">
              <span>Loaded: <strong>{fileName}</strong></span>
              <button onClick={handleRemoveFile} className="text-red-500 hover:underline">Remove</button>
            </div>
          )}

          <textarea 
            value={profileMarkdown}
            onChange={(e) => setProfileMarkdown(e.target.value)}
            className="w-full h-48 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" 
            placeholder="Paste your .md profile here..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-sm">Job Description</label>
          <textarea 
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full h-48 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
            placeholder="Paste the JD here..."
          />
        </div>

        <div className="flex gap-4 mt-4">
          <button 
            onClick={() => handleGenerate('cv')}
            disabled={isLoadingCV || isLoadingCL}
            className="w-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-md transition-colors"
          >
            {isLoadingCV ? "..." : "Generate CV"}
          </button>
          
          <button 
            onClick={() => handleGenerate('coverLetter')}
            disabled={isLoadingCV || isLoadingCL}
            className="w-1/2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-md transition-colors"
          >
            {isLoadingCL ? "..." : "Generate Letter"}
          </button>
        </div>
      </div>

      {/* Right Column: Output / Editor */}
      <div className="w-2/3 p-8 bg-gray-100 flex flex-col items-center overflow-y-auto print:bg-white print:p-0 print:w-full">
        
        {/* Navigation Tabs & Export Button */}
        <div className="w-[210mm] flex justify-between items-end mb-4 border-b border-gray-300 print:hidden">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('cv')}
              className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'cv' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              CV / Resume
            </button>
            <button 
              onClick={() => setActiveTab('coverLetter')}
              className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'coverLetter' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Cover Letter
            </button>
          </div>

          {/* Export PDF Button */}
          <button 
            onClick={handleExportPDF}
            className="mb-2 bg-gray-800 hover:bg-black text-white px-4 py-1.5 rounded text-sm font-semibold transition-colors flex items-center gap-2"
          >
            Export to PDF
          </button>
        </div>

        {/* The Editor Wrapper (This specific div is what gets captured for the PDF) */}
        <div ref={documentRef} className="print:w-full">
          <CvEditor content={activeTab === 'cv' ? cvHtml : coverLetterHtml} />
        </div>
      </div>

    </main>
  );
}