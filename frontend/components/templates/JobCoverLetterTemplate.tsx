"use client";

import React, { forwardRef } from "react";
import "../css/job-cover-letter.css";

interface Props {
  clData: any;
  personalInfo: any;
}

const Icons = {
  email: <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>,
  phone: <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>,
  location: <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>,
  linkedin: <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.389 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.779 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd"/></svg>,
  link: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
};

function toHref(raw: string): string {
  if (!raw) return "#";
  if (/^https?:\/\//i.test(raw) || /^mailto:/i.test(raw) || /^tel:/i.test(raw)) return raw;
  return `https://${raw}`;
}

const JobCoverLetterTemplate = forwardRef<HTMLDivElement, Props>(({ clData, personalInfo }, ref) => {
  if (!clData) return null;

  return (
    <div ref={ref} className="cv-page cl-wrapper">
      
      {/* PROFESSIONAL LETTERHEAD */}
      <header className="cl-header-split print-avoid-break">
        <div className="cl-sender-brand">
          <h1 className="cl-sender-name" contentEditable suppressContentEditableWarning>
            {personalInfo.Firstname} {personalInfo.Lastname}
          </h1>
          {personalInfo.Title && (
            <h2 className="cl-sender-title" contentEditable suppressContentEditableWarning>
              {personalInfo.Title}
            </h2>
          )}
        </div>

        <div className="cl-contact-list">
          {personalInfo.location && (
            <span className="cl-contact-item">
              <span contentEditable suppressContentEditableWarning>{personalInfo.location}</span>{Icons.location}
            </span>
          )}
          {personalInfo.phone && (
            <a href={`tel:${personalInfo.phone.replace(/\s/g, "")}`} className="cl-contact-item">
              <span contentEditable suppressContentEditableWarning>{personalInfo.phone}</span>{Icons.phone}
            </a>
          )}
          {personalInfo.email && (
            <a href={`mailto:${personalInfo.email}`} className="cl-contact-item">
              <span contentEditable suppressContentEditableWarning>{personalInfo.email}</span>{Icons.email}
            </a>
          )}
          {personalInfo.linkedin && (
            <a href={toHref(personalInfo.linkedin)} target="_blank" rel="noreferrer" className="cl-contact-item">
              <span contentEditable suppressContentEditableWarning>{personalInfo.linkedin}</span>{Icons.linkedin}
            </a>
          )}
          {personalInfo.IndustryPortfolio && (
            <a href={toHref(personalInfo.IndustryPortfolio)} target="_blank" rel="noreferrer" className="cl-contact-item">
              <span contentEditable suppressContentEditableWarning>{personalInfo.IndustryPortfolio}</span>{Icons.link}
            </a>
          )}
        </div>
      </header>

      {/* RECIPIENT & DATE BLOCK */}
      <div className="cl-meta-row print-avoid-break">
        <div className="cl-recipient-box">
          <strong contentEditable suppressContentEditableWarning className="block">
            {clData.companyName}
          </strong>
          <div contentEditable suppressContentEditableWarning>
            {clData.recipientName}
          </div>
          <div contentEditable suppressContentEditableWarning>
            {clData.recipientTitle}
          </div>
        </div>
      </div>

      {/* LETTER BODY */}
      <div className="cl-greeting" contentEditable suppressContentEditableWarning>
        {clData.greeting}
      </div>

      <div className="cl-body-text">
        {clData.paragraphs && clData.paragraphs.map((para: string, i: number) => (
          <p key={i} contentEditable suppressContentEditableWarning>
            {para}
          </p>
        ))}
      </div>

      {/* SIGN-OFF */}
      <div className="cl-signoff-box print-avoid-break">
        <div className="cl-signoff-text" contentEditable suppressContentEditableWarning>
          {clData.signOff}
        </div>
        <div className="cl-signature" contentEditable suppressContentEditableWarning>
          {personalInfo.Firstname} {personalInfo.Lastname}
        </div>
      </div>

    </div>
  );
});

JobCoverLetterTemplate.displayName = "JobCoverLetterTemplate";
export default JobCoverLetterTemplate;