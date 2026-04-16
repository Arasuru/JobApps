"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Interface matching your FastAPI backend schema
interface Application {
  id: number;
  company_name: string;
  job_title: string;
  status: string;
  job_url?: string;
  job_location?: string;
}

export default function ApplicationTrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const COLUMNS = ["Wishlist", "Applied", "Interview", "Offer", "Rejected"];

  // 1. Fetch data on load
  useEffect(() => {
    fetch('http://127.0.0.1:8000/tracker/applications')
      .then(res => res.json())
      .then(data => setApplications(data))
      .catch(err => console.error("Error fetching apps:", err));
  }, []);

  // 2. Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, appId: number) => {
    e.dataTransfer.setData("appId", appId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    const appId = e.dataTransfer.getData("appId");
    if (!appId) return;

    // Optimistic UI Update: Move it instantly
    setApplications(prev => prev.map(app => 
      app.id === parseInt(appId) ? { ...app, status: newStatus } : app
    ));

    // Send PATCH request to FastAPI backend
    try {
      const response = await fetch(`http://localhost:8000/tracker/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_status: newStatus })
      });

      if (!response.ok) {
        throw new Error("Failed to update status on server");
      }
    } catch (error) {
      console.error("Failed to update status in DB", error);
      // In a production app, you might want to fetch the original state again here to undo the optimistic update
    }
  };

  // 3. Render
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#2c2c2c] font-sans pt-12">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link href="/" className="text-sm text-gray-500 hover:text-black mb-2 inline-block">
              &larr; Back to Studio
            </Link>
            <h1 className="text-4xl font-serif text-[#111]">Application Tracker</h1>
            <p className="text-gray-600 mt-2">Drag and drop applications to update their status.</p>
          </div>
          <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors">
            + New Application
          </button>
        </div>

        {/* Kanban Board */}
        <div className="flex space-x-6 overflow-x-auto pb-8">
          {COLUMNS.map(columnStatus => (
            <div 
              key={columnStatus}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columnStatus)}
              className="min-w-[320px] w-[320px] bg-gray-100 rounded-xl p-4 flex flex-col shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="font-semibold text-gray-700 tracking-wide">{columnStatus}</h2>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {applications.filter(app => app.status === columnStatus).length}
                </span>
              </div>
              
              <div className="flex-1 space-y-3 min-h-[150px]">
                {applications
                  .filter(app => app.status === columnStatus)
                  .map(app => (
                    <div 
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative"
                    >
                      <h3 className="font-bold text-gray-900 mb-1">{app.job_title}</h3>
                      <p className="text-sm text-gray-600 font-medium">{app.company_name}</p>
                      
                      {app.job_location && (
                        <p className="text-xs text-gray-400 mt-2 flex items-center">
                          📍 {app.job_location}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}