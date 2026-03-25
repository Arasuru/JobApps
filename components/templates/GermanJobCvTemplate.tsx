"use client";

import React, { forwardRef } from "react";
import "../css/german-cv.css";

interface Props {
  cvData: any;
  personalInfo: any;
}

const Icons = {
  email: <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>,
  phone: <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>,
  location: <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>,
  linkedin: <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.389 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.779 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd"/></svg>,
  web: <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16A8 8 0 0010 2zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd"/></svg>,
};

function toHref(raw: string): string {
  if (!raw) return "#";
  if (/^https?:\/\//i.test(raw) || /^mailto:/i.test(raw) || /^tel:/i.test(raw)) return raw;
  return `https://${raw}`;
}

const GermanJobCvTemplate = forwardRef<HTMLDivElement, Props>(({ cvData, personalInfo }, ref) => {
  if (!cvData) return null;

  return (
    <div ref={ref} className="cv-page">
      <header className="cv-header">
        <h1 className="cv-name" contentEditable suppressContentEditableWarning>
          {personalInfo.Firstname} {personalInfo.Lastname}
        </h1>
        {personalInfo.Title && (
          <h2 className="cv-subtitle" contentEditable suppressContentEditableWarning>
            {personalInfo.Title}
          </h2>
        )}
        <nav className="cv-contact" aria-label="Contact">
          {personalInfo.email && (
            <a href={`mailto:${personalInfo.email}`} className="cv-contact-item">
              {Icons.email}<span contentEditable  suppressContentEditableWarning>{personalInfo.email}</span>
            </a>
          )}
          {personalInfo.phone && (
            <a href={`tel:${personalInfo.phone.replace(/\s/g, "")}`} className="cv-contact-item">
              {Icons.phone}<span contentEditable  suppressContentEditableWarning>{personalInfo.phone}</span>
            </a>
          )}
          {personalInfo.location && (
            <span className="cv-contact-item">
              {Icons.location}<span contentEditable  suppressContentEditableWarning>{personalInfo.location}</span>
            </span>
          )}
          {personalInfo.linkedin && (
            <a href={toHref(personalInfo.linkedin)} target="_blank" rel="noreferrer" className="cv-contact-item">
              {Icons.linkedin}<span contentEditable  suppressContentEditableWarning>{personalInfo.linkedin}</span>
            </a>
          )}
          {personalInfo.IndustryPortfolio && (
            <a href={toHref(personalInfo.IndustryPortfolio)} target="_blank" rel="noreferrer" className="cv-contact-item">
              {Icons.web}<span contentEditable  suppressContentEditableWarning>{'arasuru.github.io'}</span>
            </a>
          )}
        </nav>
      </header>

      <div className="cv-content">
        {cvData.summary && (
          <section className="cv-section">
            <h2 className="cv-section-title">Profile</h2>
            <p className="cv-profile" contentEditable suppressContentEditableWarning>{cvData.summary}</p>
          </section>
        )}

        {cvData.experience?.length > 0 && (
          <section className="cv-section">
            <h2 className="cv-section-title">Professional Experience</h2>
            {cvData.experience.map((job: any, i: number) => (
              <div key={i} className="cv-entry">
                <div className="cv-entry-date">
                  <span className="cv-date-range" contentEditable  suppressContentEditableWarning>{job.date}</span>
                </div>
                <div className="cv-entry-body">
                  <p className="cv-role" contentEditable  suppressContentEditableWarning>{job.role}</p>
                  <p className="cv-company">
                    <strong contentEditable  suppressContentEditableWarning>{job.company}</strong>
                    {job.location && <span contentEditable  suppressContentEditableWarning> · {job.location}</span>}
                  </p>
                  {job.achievements?.length > 0 && (
                    <ul className="cv-bullets">
                      {job.achievements.map((a: string, j: number) => (
                        <li key={j} contentEditable  suppressContentEditableWarning>{a}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {cvData.education?.length > 0 && (
          <section className="cv-section">
            <h2 className="cv-section-title">Education</h2>
            {cvData.education.map((edu: any, i: number) => (
              <div key={i} className="cv-entry">
                <div className="cv-entry-date">
                  <span className="cv-date-range" contentEditable  suppressContentEditableWarning>{edu.date}</span>
                </div>
                <div className="cv-entry-body">
                  <p className="cv-role" contentEditable  suppressContentEditableWarning>{edu.degree}</p>
                  <p className="cv-company">
                    <strong contentEditable  suppressContentEditableWarning>{edu.institution}</strong>
                    {edu.location && <span contentEditable  suppressContentEditableWarning> · {edu.location}</span>}
                  </p>
                  {edu.Focus && <p className="cv-meta" contentEditable  suppressContentEditableWarning><strong>Focus:</strong> {edu.Focus}</p>}
                  {edu.Grade && <p className="cv-meta" contentEditable  suppressContentEditableWarning><strong>Grade:</strong> {edu.Grade}</p>}
                </div>
              </div>
            ))}
          </section>
        )}

        {cvData.projects?.length > 0 && (
          <section className="cv-section">
            <h2 className="cv-section-title">Key Projects</h2>
            {cvData.projects.map((project: any, i: number) => (
              <div key={i} className="cv-project">
                <p className="cv-project-name" contentEditable  suppressContentEditableWarning>{project.name}</p>
                {project.publication && (
                  <p className="cv-project-pub" contentEditable  suppressContentEditableWarning><strong>Publication:</strong> {project.publication}</p>
                )}
                
                {/* NEW: Project Description rendered here */}
                {project.description && (
                  <p className="cv-project-desc" contentEditable  suppressContentEditableWarning>{project.description}</p>
                )}

                {project.achievements?.length > 0 && (
                  <ul className="cv-bullets cv-project-bullets">
                    {project.achievements.map((desc: string, j: number) => (
                      <li key={j} contentEditable  suppressContentEditableWarning>{desc}</li>
                    ))}
                  </ul>
                )}
                {project.keywords?.length > 0 && (
                  <p className="cv-tech" contentEditable  suppressContentEditableWarning><span style={{ fontWeight: 'bold', fontFamily:'DM Sans' }}>Technologies Used: </span>{project.keywords.join(", ")}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {cvData.skills?.length > 0 && (
          <section className="cv-section">
            <h2 className="cv-section-title">Technical Skills</h2>
            <div className="cv-skills-list">
              {cvData.skills.map((group: any, i: number) => (
                <p key={i} className="cv-skill-line">
                  <strong contentEditable  suppressContentEditableWarning>{group.category}:</strong> <span contentEditable  suppressContentEditableWarning>{group.items.join(", ")}</span>
                </p>
              ))}
            </div>
          </section>
        )}

        {cvData.Languages?.length > 0 && (
          <section className="cv-section">
            <h2 className="cv-section-title">Languages</h2>
            <div className="cv-skills-list">
              <p className="cv-skill-line">
                {cvData.Languages.map((lang: any, i: number) => (
                  <span key={i} contentEditable  suppressContentEditableWarning>
                    {lang.language} {lang.proficiency ? `(${lang.proficiency})` : ""}
                    {i < cvData.Languages.length - 1 ? " | " : ""}
                  </span>
                ))}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
});

GermanJobCvTemplate.displayName = "GermanJobCvTemplate";
export default GermanJobCvTemplate;