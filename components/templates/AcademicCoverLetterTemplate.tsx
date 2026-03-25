"use client";

import React, { forwardRef } from "react";
import "../css/academic-cover-letter.css";

interface Props {
  clData: any;
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

const AcademicCoverLetterTemplate = forwardRef<HTMLDivElement, Props>(({ clData, personalInfo }, ref) => {
  if (!clData) return null;

  return (
    <div ref={ref} className="acad-page acad-cl-wrapper">
      
      {/* IDENTICAL ACADEMIC HEADER */}
      <header className="acad-header print-avoid-break">
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

      {/* LETTER METADATA */}
      <div className="acad-cl-meta print-avoid-break">
        <div className="acad-cl-recipient">
          <strong contentEditable suppressContentEditableWarning className="block">
            {clData.recipientName}
          </strong>
          <div contentEditable suppressContentEditableWarning>
            {clData.recipientTitle}
          </div>
          <div contentEditable suppressContentEditableWarning>
            {clData.companyName}
          </div>
        </div>
        <div className="acad-cl-date" contentEditable suppressContentEditableWarning>
          {clData.date}
        </div>
      </div>

      {/* GREETING */}
      <div className="acad-cl-greeting" contentEditable suppressContentEditableWarning>
        {clData.greeting}
      </div>

      {/* BODY PARAGRAPHS */}
      <div className="acad-cl-body">
        {clData.paragraphs && clData.paragraphs.map((para: string, i: number) => (
          <p key={i} className="acad-cl-paragraph" contentEditable suppressContentEditableWarning>
            {para}
          </p>
        ))}
      </div>

      {/* SIGN-OFF */}
      <div className="acad-cl-signoff-box print-avoid-break">
        <div className="acad-cl-signoff" contentEditable suppressContentEditableWarning>
          {clData.signOff}
        </div>
        <div className="acad-cl-signature" contentEditable suppressContentEditableWarning>
          {personalInfo.Firstname} {personalInfo.Lastname}
        </div>
      </div>

    </div>
  );
});

AcademicCoverLetterTemplate.displayName = "AcademicCoverLetterTemplate";
export default AcademicCoverLetterTemplate;