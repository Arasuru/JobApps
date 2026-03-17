"use client";

import { useState, ChangeEvent } from "react";
import CvEditor from "../components/CvEditor";

export default function Home() {
  const [profileMarkdown, setProfileMarkdown] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState("<h2 class='text-gray-400 text-center mt-20'>Your generated CV will appear here.</h2>");
  const [isLoading, setIsLoading] = useState(false);

  // --- NEW: File Upload Logic ---
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setProfileMarkdown(content); // Populates the textarea automatically
      }
    };
    reader.readAsText(file);
    
    // Reset the input value so the same file can be uploaded again if needed
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    setFileName(null);
    setProfileMarkdown("");
  };
  // ------------------------------

  const handleGenerate = async () => {
    if (!profileMarkdown || !jobDescription) {
      alert("Please provide both your profile and the job description.");
      return;
    }

    setIsLoading(true);
    setGeneratedHtml("<h2 class='text-gray-400 text-center mt-20'>Generating your CV...</h2>");

    try {
      const response = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileMarkdown, jobDescription }),
      });

      const data = await response.json();

      if (data.generatedHtml) {
        setGeneratedHtml(data.generatedHtml);
      } else {
        alert("Something went wrong: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to the API.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-gray-50 text-gray-900">
      
      {/* Left Column: Inputs */}
      <div className="w-1/3 p-8 border-r bg-white shadow-sm flex flex-col gap-6 overflow-y-auto">
        <h1 className="text-2xl font-bold">AI CV Builder</h1>
        
        {/* Profile Section with Upload Button */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <label className="font-semibold text-sm">Your Markdown Profile</label>
            
            {/* The Hidden File Input and Custom Label Button */}
            <label className="cursor-pointer text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded transition-colors">
              Upload .md
              <input 
                type="file" 
                accept=".md,.txt" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </label>
          </div>

          {/* Status message showing the loaded file */}
          {fileName && (
            <div className="text-xs text-green-700 bg-green-50 p-2 rounded flex justify-between items-center border border-green-200">
              <span>Loaded: <strong>{fileName}</strong></span>
              <button onClick={handleRemoveFile} className="text-red-500 hover:underline">
                Remove
              </button>
            </div>
          )}

          <textarea 
            value={profileMarkdown}
            onChange={(e) => setProfileMarkdown(e.target.value)}
            className="w-full h-48 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" 
            placeholder="Paste your .md profile here, or upload a file above..."
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

        <button 
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-md transition-colors mt-4"
        >
          {isLoading ? "Generating..." : "Generate Tailored CV"}
        </button>
      </div>

      {/* Right Column: Output / Editor */}
      <div className="w-2/3 p-8 bg-gray-100 flex justify-center items-start overflow-y-auto">
        <CvEditor content={generatedHtml} />
      </div>

    </main>
  );
}