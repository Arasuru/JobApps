"use client";

import React, { forwardRef } from "react";
import "../css/academic-cv.css";

interface Education {
  degree: string;
  institution: string;
  date: string;
  location: string;
  Focus?: string;
  Grade?: string;
}

interface Experience {
  role: string;
  company: string;
  date: string;
  location: string;
  achievements?: string[];
}

interface Skill {
  category: string;
  items: string[];
}

interface Publication {
  title: string;
  journal: string;
  date: string;
  link?: string;
}

interface Project {
  name: string;
  description: string;
  keywords?: string[];
}

interface Language {
  language: string;
  proficiency: string;
}

interface CvData {
  summary?: string;
  researchInterests?: string[];
  experience?: Experience[];
  education?: Education[];
  skills?: Skill[];
  publications?: Publication[];
  projects?: Project[];
  Languages?: Language[];
}

interface Props {
  cvData: CvData;
  personalInfo: any;
}

const Icons = {
  email: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  phone: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  location: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  link: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  linkedin: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
  ),
};

function toHref(raw: string): string {
  if (!raw) return "#";
  if (/^https?:\/\//i.test(raw) || /^mailto:/i.test(raw) || /^tel:/i.test(raw)) return raw;
  return `https://${raw}`;
}

const AcademicCvTemplate = forwardRef<HTMLDivElement, Props>(({ cvData, personalInfo }, ref) => {
  if (!cvData) return null;

  return (
    <div ref={ref} className="acad-page">

      {/* ── HEADER ── */}
      <header className="acad-header">
        <h1 className="acad-name" contentEditable suppressContentEditableWarning>
          {personalInfo.Firstname} {personalInfo.Lastname}
        </h1>

        <div className="acad-contact">
          {personalInfo.email && (
            <span className="acad-contact-item">
              {Icons.email}
              <span contentEditable suppressContentEditableWarning>{personalInfo.email}</span>
            </span>
          )}
          {personalInfo.phone && (
            <span className="acad-contact-item">
              {Icons.phone}
              <span contentEditable suppressContentEditableWarning>{personalInfo.phone}</span>
            </span>
          )}
          {personalInfo.location && (
            <span className="acad-contact-item">
              {Icons.location}
              <span contentEditable suppressContentEditableWarning>{personalInfo.location}</span>
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="acad-contact-item">
              {Icons.linkedin}
              <a href={toHref(personalInfo.linkedin)} target="_blank" rel="noreferrer" contentEditable suppressContentEditableWarning>
                {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/i, "")}
              </a>
            </span>
          )}
          {personalInfo.PhDPortfolio && (
            <span className="acad-contact-item">
              {Icons.link}
              <a href={toHref(personalInfo.PhDPortfolio)} target="_blank" rel="noreferrer" contentEditable suppressContentEditableWarning>
                {personalInfo.PhDPortfolio.replace(/^https?:\/\/(www\.)?/i, "")}
              </a>
            </span>
          )}
        </div>
      </header>

      <div className="acad-content">

        {/* ── SUMMARY ── */}
        {cvData.summary && (
          <section className="acad-section">
            <h2 className="acad-section-title">Profile</h2>
            <p className="acad-text" contentEditable suppressContentEditableWarning>
              {cvData.summary}
            </p>
          </section>
        )}

        {/* ── RESEARCH INTERESTS ── */}
        {cvData.researchInterests && cvData.researchInterests.length > 0 && (
          <section className="acad-section">
            <h2 className="acad-section-title">Research Interests</h2>
            <p className="acad-text" contentEditable suppressContentEditableWarning>
              {cvData.researchInterests.join(" · ")}
            </p>
          </section>
        )}

        {/* ── EDUCATION ── */}
        {cvData.education && cvData.education.length > 0 && (
          <section className="acad-section">
            <h2 className="acad-section-title">Education</h2>
            {cvData.education.map((edu, i) => (
              <div key={i} className="acad-item print-avoid-break">
                <div className="acad-item-header">
                  <h3 className="acad-role" contentEditable suppressContentEditableWarning>
                    {edu.degree}
                  </h3>
                  <span className="acad-date" contentEditable suppressContentEditableWarning>
                    {edu.date}
                  </span>
                </div>
                <div className="acad-institution" contentEditable suppressContentEditableWarning>
                  {edu.institution}{edu.location ? `, ${edu.location}` : ""}
                </div>
                {(edu.Focus || edu.Grade) && (
                  <ul className="acad-details-list">
                    {edu.Focus && (
                      <li contentEditable suppressContentEditableWarning>
                        <strong>Focus:</strong> {edu.Focus}
                      </li>
                    )}
                    {edu.Grade && (
                      <li contentEditable suppressContentEditableWarning>
                        <strong>Grade:</strong> {edu.Grade}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}


        {/* ── PUBLICATIONS ── */}
        {cvData.publications && cvData.publications.length > 0 && (
          <section className="acad-section">
            <h2 className="acad-section-title">Publications</h2>
            <ol className="acad-pub-list">
              {cvData.publications.map((pub, i) => (
                <li key={i} className="acad-pub-item" contentEditable suppressContentEditableWarning>
                  <strong>{pub.title}</strong>. <em>{pub.journal}</em>, {pub.date}.
                  {pub.link && (
                    <> <a href={toHref(pub.link)} target="_blank" rel="noreferrer">[link]</a></>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
        
        {/* ── PROJECTS ── */}
        {cvData.projects && cvData.projects.length > 0 && (
          <section className="acad-section">
            <h2 className="acad-section-title">Projects</h2>
            {cvData.projects.map((proj, i) => (
              <div key={i} className="acad-item print-avoid-break">
                <h3 className="acad-role" contentEditable suppressContentEditableWarning>
                  {proj.name}
                </h3>
                <p className="acad-text" contentEditable suppressContentEditableWarning>
                  {proj.description}
                </p>
                {proj.keywords && proj.keywords.length > 0 && (
                  <div className="acad-keywords">
                    {proj.keywords.map((kw, j) => (
                      <span key={j} className="acad-keyword" contentEditable suppressContentEditableWarning>
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
        {/* ── EXPERIENCE ── */}
        {cvData.experience && cvData.experience.length > 0 && (
          <section className="acad-section">
            <h2 className="acad-section-title">Professional Experience</h2>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="acad-item print-avoid-break">
                <div className="acad-item-header">
                  <h3 className="acad-role" contentEditable suppressContentEditableWarning>
                    {exp.role}
                  </h3>
                  <span className="acad-date" contentEditable suppressContentEditableWarning>
                    {exp.date}
                  </span>
                </div>
                <div className="acad-institution" contentEditable suppressContentEditableWarning>
                  {exp.company}{exp.location ? `, ${exp.location}` : ""}
                </div>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="acad-bullets">
                    {exp.achievements.map((a, j) => (
                      <li key={j} contentEditable suppressContentEditableWarning>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ── SKILLS ── */}
        {cvData.skills && cvData.skills.length > 0 && (
          <section className="acad-section">
            <h2 className="acad-section-title">Technical Skills</h2>
            <div className="acad-skills">
              {cvData.skills.map((skill, i) => (
                <div key={i} className="acad-skill-line">
                  <strong contentEditable suppressContentEditableWarning>{skill.category}:</strong>{" "}
                  <span contentEditable suppressContentEditableWarning>{skill.items.join(", ")}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── LANGUAGES ── */}
        {cvData.Languages && cvData.Languages.length > 0 && (
          <section className="acad-section">
            <h2 className="acad-section-title">Languages</h2>
            <div className="acad-skills">
              {cvData.Languages.map((lang, i) => (
                <div key={i} className="acad-skill-line">
                  <strong contentEditable suppressContentEditableWarning>{lang.language}:</strong>{" "}
                  <span contentEditable suppressContentEditableWarning>{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
});

AcademicCvTemplate.displayName = "AcademicCvTemplate";
export default AcademicCvTemplate;