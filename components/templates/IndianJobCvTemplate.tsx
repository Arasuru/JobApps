"use client";

import React, { forwardRef } from "react";
import "../css/indian-cv.css";

interface Props {
  cvData: any;
  personalInfo: any;
}

const IndianJobCvTemplate = forwardRef<HTMLDivElement, Props>(({ cvData, personalInfo }, ref) => {
  if (!cvData) return null;

  return (
    <div ref={ref} className="in-cv-page">
      
      {/* HEADER */}
      <header className="in-header">
        <h1 className="in-name" contentEditable suppressContentEditableWarning>
          {personalInfo.Firstname} {personalInfo.Lastname}
        </h1>
        {personalInfo.Title && (
          <h2 className="in-title" contentEditable suppressContentEditableWarning>
            {personalInfo.Title}
          </h2>
        )}
        
        <div className="in-contact-info">
          {personalInfo.email && (
            <span className="in-contact-item">
              <strong>Email:</strong> <span contentEditable suppressContentEditableWarning>{personalInfo.email}</span>
            </span>
          )}
          <span className="in-separator">|</span>
          {personalInfo.phone && (
            <span className="in-contact-item">
              <strong>Phone:</strong> <span contentEditable suppressContentEditableWarning>{personalInfo.phone}</span>
            </span>
          )}
          <span className="in-separator">|</span>
          {personalInfo.location && (
            <span className="in-contact-item">
              <strong>Location:</strong> <span contentEditable suppressContentEditableWarning>{personalInfo.location}</span>
            </span>
          )}
        </div>
        <div className="in-contact-links">
          {personalInfo.linkedin && (
            <span className="in-contact-item">
              <strong>LinkedIn:</strong> <a href={`https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" contentEditable suppressContentEditableWarning>{personalInfo.linkedin}</a>
            </span>
          )}
          {personalInfo.IndustryPortfolio && (
            <>
              <span className="in-separator">|</span>
              <span className="in-contact-item">
                <strong>Portfolio:</strong> <a href={`https://${personalInfo.IndustryPortfolio}`} target="_blank" rel="noreferrer" contentEditable suppressContentEditableWarning>{'arasuru.github.io'}</a>
              </span>
            </>
          )}
        </div>
      </header>

      <div className="in-content">

        {/* CAREER OBJECTIVE */}
        {cvData.summary && (
          <section className="in-section">
            <h3 className="in-section-title">CAREER OBJECTIVE</h3>
            <p className="in-summary" contentEditable suppressContentEditableWarning>
              {cvData.summary}
            </p>
          </section>
        )}

        {/* WORK EXPERIENCE */}
        {cvData.experience?.length > 0 && (
          <section className="in-section">
            <h3 className="in-section-title">PROFESSIONAL EXPERIENCE</h3>
            {cvData.experience.map((job: any, i: number) => (
              <div key={i} className="in-entry">
                <div className="in-entry-header">
                  <div className="in-role" contentEditable suppressContentEditableWarning>{job.role}</div>
                  <div className="in-date" contentEditable suppressContentEditableWarning>{job.date}</div>
                </div>
                <div className="in-company">
                  <span contentEditable suppressContentEditableWarning>{job.company}</span>
                  {job.location && <span contentEditable suppressContentEditableWarning>, {job.location}</span>}
                </div>
                {job.achievements?.length > 0 && (
                  <ul className="in-bullets">
                    {job.achievements.map((a: string, j: number) => (
                      <li key={j} contentEditable suppressContentEditableWarning>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* TECHNICAL SKILLS */}
        {cvData.skills?.length > 0 && (
          <section className="in-section">
            <h3 className="in-section-title">IT PROFICIENCY</h3>
            <div className="in-skills-table">
              {cvData.skills.map((skill: any, i: number) => (
                <div key={i} className="in-skill-row">
                  <div className="in-skill-category" contentEditable suppressContentEditableWarning>{skill.category}</div>
                  <div className="in-skill-items" contentEditable suppressContentEditableWarning>{skill.items.join(", ")}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS */}
        {cvData.projects?.length > 0 && (
          <section className="in-section">
            <h3 className="in-section-title">KEY PROJECTS</h3>
            {cvData.projects.map((project: any, i: number) => (
              <div key={i} className="in-project">
                <div className="in-project-name" contentEditable suppressContentEditableWarning>{project.name}</div>
                {project.description && (
                  <div className="in-project-desc" contentEditable suppressContentEditableWarning>{project.description}</div>
                )}
                {project.keywords?.length > 0 && (
                  <div className="in-project-tech">
                    <strong contentEditable suppressContentEditableWarning>Environment:</strong> <span contentEditable suppressContentEditableWarning>{project.keywords.join(", ")}</span>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* EDUCATION */}
        {cvData.education?.length > 0 && (
          <section className="in-section">
            <h3 className="in-section-title">ACADEMIC CREDENTIALS</h3>
            <div className="in-edu-table">
              {cvData.education.map((edu: any, i: number) => (
                <div key={i} className="in-edu-row">
                  <div className="in-edu-col-main">
                    <strong contentEditable suppressContentEditableWarning>{edu.degree}</strong>
                    {edu.Focus && <div contentEditable suppressContentEditableWarning>Specialization: {edu.Focus}</div>}
                    <div contentEditable suppressContentEditableWarning>{edu.institution} {edu.location ? `, ${edu.location}` : ""}</div>
                  </div>
                  <div className="in-edu-col-meta">
                    <div contentEditable suppressContentEditableWarning><strong>Passing Year:</strong> {edu.date}</div>
                    {edu.Grade && <div contentEditable suppressContentEditableWarning><strong>Score:</strong> {edu.Grade}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PERSONAL DOSSIER */}
        <section className="in-section print-avoid-break">
          <h3 className="in-section-title">PERSONAL DOSSIER</h3>
          <div className="in-personal-grid">
            {cvData.Languages?.length > 0 && (
              <div className="in-personal-row">
                <div className="in-personal-label">Languages Known</div>
                <div className="in-personal-value" contentEditable suppressContentEditableWarning>
                  {cvData.Languages.map((l: any) => l.language).join(", ")}
                </div>
              </div>
            )}
            <div className="in-personal-row">
              <div className="in-personal-label">Current Location</div>
              <div className="in-personal-value" contentEditable suppressContentEditableWarning>{personalInfo.location}</div>
            </div>
            {/* You can add more standard Indian fields here like DOB, Nationality, etc. */}
          </div>
        </section>

        {/* DECLARATION */}
        <section className="in-section in-declaration print-avoid-break">
          <h3 className="in-section-title">DECLARATION</h3>
          <p contentEditable suppressContentEditableWarning>
            I hereby declare that the above-mentioned information is true to the best of my knowledge and belief.
          </p>
          <div className="in-signature-block">
            <div className="in-sig-left">
              <div contentEditable suppressContentEditableWarning><strong>Place:</strong> {personalInfo.location?.split(',')[0] || "City"}</div>
              <div contentEditable suppressContentEditableWarning><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</div>
            </div>
            <div className="in-sig-right">
              <div className="in-sig-name" contentEditable suppressContentEditableWarning>
                ({personalInfo.Firstname} {personalInfo.Lastname})
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
});

IndianJobCvTemplate.displayName = "IndianJobCvTemplate";
export default IndianJobCvTemplate;