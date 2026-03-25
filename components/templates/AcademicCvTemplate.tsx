"use client";

import React, { forwardRef } from "react";
import "../css/academic-cv.css";

interface Props {
  cvData: any;
  personalInfo: any;
}

const Icons = {
  email: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  phone: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  location: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  link: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
  scholar: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l10 6.5-10 6.5-10-6.5z"></path><path d="M22 8.5v7.5"></path><path d="M6 10.6V16c0 2.2 2.7 4 6 4s6-1.8 6-4v-5.4"></path></svg>
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
      
      <header className="acad-header">
        <h1 className="acad-name" contentEditable suppressContentEditableWarning>
          {personalInfo.Firstname} {personalInfo.Lastname}
        </h1>
        {personalInfo.Title && (
          <p className="acad-subtitle" contentEditable suppressContentEditableWarning>
            {personalInfo.Title}
          </p>
        )}
        
        <div className="acad-contact">
          {personalInfo.email && (
            <span className="acad-contact-item">{Icons.email} <span contentEditable suppressContentEditableWarning>{personalInfo.email}</span></span>
          )}
          {personalInfo.phone && (
            <span className="acad-contact-item">{Icons.phone} <span contentEditable suppressContentEditableWarning>{personalInfo.phone}</span></span>
          )}
          {personalInfo.location && (
            <span className="acad-contact-item">{Icons.location} <span contentEditable suppressContentEditableWarning>{personalInfo.location}</span></span>
          )}
          {personalInfo.PhDPortfolio && (
            <span className="acad-contact-item">{Icons.link} <a href={toHref(personalInfo.PhDPortfolio)} target="_blank" rel="noreferrer" contentEditable suppressContentEditableWarning>{'arasuru.github.io'}</a></span>
          )}
        </div>
      </header>

      <div className="acad-content">

        {/* RESEARCH INTERESTS */}
        {cvData.researchInterests && (
          <section className="acad-section">
            <h2 className="acad-section-title">Research Interests</h2>
            <p className="acad-text" contentEditable suppressContentEditableWarning>
              {cvData.researchInterests}
            </p>
          </section>
        )}

        {/* EDUCATION */}
        {cvData.education?.length > 0 && (
          <section className="acad-section">
            <h2 className="acad-section-title">Education</h2>
            {cvData.education.map((edu: any, i: number) => (
              <div key={i} className="acad-item">
                <div className="acad-item-header">
                  <h3 className="acad-degree" contentEditable suppressContentEditableWarning>{edu.degree}</h3>
                  <span className="acad-date" contentEditable suppressContentEditableWarning>{edu.date}</span>
                </div>
                <div className="acad-institution" contentEditable suppressContentEditableWarning>{edu.institution}, {edu.location}</div>
                
                {(edu.thesis || edu.advisor || edu.grade) && (
                  <ul className="acad-details-list">
                    {edu.thesis && <li contentEditable suppressContentEditableWarning><strong>Thesis:</strong> <em>{edu.thesis}</em></li>}
                    {edu.advisor && <li contentEditable suppressContentEditableWarning><strong>Advisor:</strong> {edu.advisor}</li>}
                    {edu.grade && <li contentEditable suppressContentEditableWarning><strong>Grade:</strong> {edu.grade}</li>}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* PUBLICATIONS */}
        {cvData.publications?.length > 0 && (
          <section className="acad-section">
            <h2 className="acad-section-title">Publications</h2>
            <ol className="acad-pub-list">
              {cvData.publications.map((pub: any, i: number) => (
                <li key={i} className="acad-pub-item" contentEditable suppressContentEditableWarning>
                  {pub.authors}. ({pub.year}). <strong>{pub.title}</strong>. <em>{pub.journal}</em>. {pub.doi && <a href={toHref(pub.doi)} target="_blank" rel="noreferrer">doi:{pub.doi}</a>}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* RESEARCH & ACADEMIC EXPERIENCE */}
        {cvData.experience?.length > 0 && (
          <section className="acad-section">
            <h2 className="acad-section-title">Academic & Research Experience</h2>
            {cvData.experience.map((exp: any, i: number) => (
              <div key={i} className="acad-item">
                <div className="acad-item-header">
                  <h3 className="acad-role" contentEditable suppressContentEditableWarning>{exp.role}</h3>
                  <span className="acad-date" contentEditable suppressContentEditableWarning>{exp.date}</span>
                </div>
                <div className="acad-institution" contentEditable suppressContentEditableWarning>{exp.institution}</div>
                {exp.advisor && <div className="acad-subtext" contentEditable suppressContentEditableWarning>Advisor: {exp.advisor}</div>}
                {exp.achievements?.length > 0 && (
                  <ul className="acad-bullets">
                    {exp.achievements.map((a: string, j: number) => (
                      <li key={j} contentEditable suppressContentEditableWarning>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* HONORS & AWARDS */}
        {cvData.awards?.length > 0 && (
          <section className="acad-section">
            <h2 className="acad-section-title">Honors, Grants & Awards</h2>
            <div className="acad-award-list">
              {cvData.awards.map((award: any, i: number) => (
                <div key={i} className="acad-award-item">
                  <span className="acad-award-date" contentEditable suppressContentEditableWarning>{award.year}</span>
                  <span className="acad-award-name" contentEditable suppressContentEditableWarning>{award.title}, <em>{award.issuer}</em> {award.amount && `(${award.amount})`}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TECHNICAL SKILLS */}
        {cvData.skills?.length > 0 && (
          <section className="acad-section">
            <h2 className="acad-section-title">Technical Skills</h2>
            <div className="acad-skills">
              {cvData.skills.map((skill: any, i: number) => (
                <div key={i} className="acad-skill-line">
                  <strong contentEditable suppressContentEditableWarning>{skill.category}:</strong> <span contentEditable suppressContentEditableWarning>{skill.items.join(", ")}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* REFERENCES */}
        {cvData.references?.length > 0 && (
          <section className="acad-section">
            <h2 className="acad-section-title">Academic References</h2>
            <div className="acad-ref-grid">
              {cvData.references.map((ref: any, i: number) => (
                <div key={i} className="acad-ref-card">
                  <strong contentEditable suppressContentEditableWarning className="block text-gray-900">{ref.name}</strong>
                  <div contentEditable suppressContentEditableWarning className="text-gray-700">{ref.title}</div>
                  <div contentEditable suppressContentEditableWarning className="text-gray-700">{ref.institution}</div>
                  <a href={`mailto:${ref.email}`} contentEditable suppressContentEditableWarning className="text-blue-700 underline mt-1 block">{ref.email}</a>
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