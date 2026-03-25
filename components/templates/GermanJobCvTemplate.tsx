"use client";

import React, { forwardRef } from "react";
import "./german-cv.css";

interface Props {
  cvData: any;
  personalInfo: any;
}

const GermanJobCvTemplate = forwardRef<HTMLDivElement, Props>(
({ cvData, personalInfo }, ref) => {

if (!cvData) return null;

return (
<div ref={ref} className="cv-page">

<header className="cv-header">

<h1 className="cv-name">
{personalInfo.Firstname} {personalInfo.Lastname}
</h1>

<div className="cv-contact">
{personalInfo.email && <span>{personalInfo.email}</span>}
{personalInfo.phone && <span>{personalInfo.phone}</span>}
{personalInfo.location && <span>{personalInfo.location}</span>}
{personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
{personalInfo.IndustryPortfolio && <span>{personalInfo.IndustryPortfolio}</span>}
</div>

</header>

<div className="cv-layout">

{/* SIDEBAR */}

<aside className="cv-sidebar">

{cvData.summary && (
<section className="cv-section">
<h2 className="cv-title">Profil</h2>
<p className="cv-profile">{cvData.summary}</p>
</section>
)}

{cvData.skills?.length > 0 && (
<section className="cv-section">
<h2 className="cv-title">Kenntnisse</h2>

{cvData.skills.map((group: any, i: number) => (
<div key={i} className="cv-skill-group">
<span className="cv-skill-category">
{group.category}
</span>

<div className="cv-skill-tags">
{group.items.map((item: string, j: number) => (
<span key={j} className="cv-tag">
{item}
</span>
))}
</div>
</div>
))}

</section>
)}

{cvData.Languages?.length > 0 && (
<section className="cv-section">
<h2 className="cv-title">Sprachen</h2>

{cvData.Languages.map((lang: any, i: number) => (
<div key={i} className="cv-language">
<span>{lang.language}</span>
<span className="cv-lang-level">
{lang.proficiency}
</span>
</div>
))}

</section>
)}

</aside>

{/* MAIN */}

<main className="cv-main">

{cvData.experience?.length > 0 && (
<section className="cv-section">
<h2 className="cv-title">Berufserfahrung</h2>

{cvData.experience.map((job: any, i: number) => (
<div key={i} className="cv-entry">

<div className="cv-date">
{job.date}
</div>

<div>

<p className="cv-role">
{job.role}
</p>

<p className="cv-company">
{job.company}
{job.location && ` · ${job.location}`}
</p>

{job.achievements?.length > 0 && (
<ul className="cv-bullets">
{job.achievements.map((a: string, j: number) => (
<li key={j}>{a}</li>
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

<h2 className="cv-title">Bildungsweg</h2>

{cvData.education.map((edu: any, i: number) => (
<div key={i} className="cv-entry">

<div className="cv-date">
{edu.date}
</div>

<div>

<p className="cv-role">
{edu.degree}
</p>

<p className="cv-company">
{edu.institution}
{edu.location && ` · ${edu.location}`}
</p>

{edu.Focus && (
<p className="cv-meta">
<strong>Schwerpunkt:</strong> {edu.Focus}
</p>
)}

{edu.Grade && (
<p className="cv-meta">
<strong>Abschlussnote:</strong> {edu.Grade}
</p>
)}

</div>

</div>
))}

</section>
)}

{cvData.projects?.length > 0 && (
<section className="cv-section">

<h2 className="cv-title">Projekte</h2>

{cvData.projects.map((project: any, i: number) => (
<div key={i} className="cv-project">

<p className="cv-project-name">
{project.name}
</p>

<p className="cv-project-desc">
{project.description}
</p>

{project.keywords?.length > 0 && (
<p className="cv-tech">
{project.keywords.join(" · ")}
</p>
)}

</div>
))}

</section>
)}

{cvData.publications?.length > 0 && (
<section className="cv-section">

<h2 className="cv-title">Publikationen</h2>

{cvData.publications.map((pub: any, i: number) => (
<p key={i} className="cv-publication">

<strong>{pub.title}</strong>.  
<em>{pub.journal}</em>, {pub.date}

{pub.link && (
<span className="cv-link">
{pub.link}
</span>
)}

</p>
))}

</section>
)}

</main>

</div>

</div>
);
});

GermanJobCvTemplate.displayName = "GermanCvTemplate";

export default GermanJobCvTemplate;