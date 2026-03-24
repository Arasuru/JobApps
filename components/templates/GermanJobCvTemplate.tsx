// components/templates/GermanJobCvTemplate.tsx
"use client";

/**
 * German Lebenslauf — "Bauhaus" Edition
 *
 * ─────────────────────────────────────────────────────────────────
 * HOW TO FIX "localhost:3000" FOOTER & DATE/TIME HEADER IN EXPORTS:
 * ─────────────────────────────────────────────────────────────────
 * Those come from the browser's built-in print UI and cannot be
 * suppressed by CSS alone. Use this pattern in your export button:
 *
 *   const handleExport = () => {
 *     const prev = document.title;
 *     document.title = " ";      // ← clears the header title line
 *     window.print();
 *     setTimeout(() => { document.title = prev; }, 500);
 *   };
 *
 * Also instruct users: in the browser print dialog, set
 *   Headers and Footers → OFF  (Chrome/Edge: "More settings")
 *
 * ─────────────────────────────────────────────────────────────────
 * MULTI-PAGE FIX:
 * ─────────────────────────────────────────────────────────────────
 * The previous template only printed one page because the wrapper
 * had `overflow: hidden` / a fixed height via Tailwind's `.a4-document`.
 * This template uses `height: auto; overflow: visible` everywhere and
 * `@page { margin: 0 }` with inner padding so the browser can flow
 * content freely across as many pages as needed.
 */

export default function GermanJobCvTemplate({
  cvData,
  personalInfo,
}: {
  cvData: any;
  personalInfo: any;
}) {
  if (!cvData) return null;

  return (
    <>
      {/* ─────────────────────────── STYLES ─────────────────────────── */}
      <style>{`
        /* ══════════════════════════════════════════════════════════
           PAGE — zero browser margins so it can't inject URL/date
           ══════════════════════════════════════════════════════════ */
        @page {
          size: A4 portrait;
          margin: 0;
        }

        /* ══════════════════════════════════════════════════════════
           PRINT OVERRIDES
           ══════════════════════════════════════════════════════════ */
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
            background: #fff !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide every sibling of the CV on the page */
          body > *:not(#cv-print-root),
          body > * > *:not(#cv-print-root) {
            display: none !important;
          }

          #cv-print-root,
          #cv-print-root .cv-root {
            display: block !important;
            visibility: visible !important;
          }

          .cv-root {
            width: 100% !important;
            max-width: 100% !important;
            /* Compensate for @page margin:0 — all whitespace lives here */
            padding: 13mm 15mm 13mm 15mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            height: auto !important;
            overflow: visible !important;
            border-radius: 0 !important;
          }

          /* SIDEBAR must not clip — it must scroll/flow with content */
          .cv-sidebar {
            height: auto !important;
            overflow: visible !important;
          }

          .cv-layout {
            height: auto !important;
            overflow: visible !important;
          }

          /* ── Page-break discipline ── */
          .cv-keep          { break-inside: avoid; page-break-inside: avoid; }
          .cv-keep-heading  { break-after: avoid;  page-break-after: avoid;  }
          .cv-bullets li    { break-inside: avoid; page-break-inside: avoid; }
        }

        /* ══════════════════════════════════════════════════════════
           SCREEN PREVIEW
           ══════════════════════════════════════════════════════════ */
        @media screen {
          .cv-root {
            max-width: 795px;
            margin: 36px auto;
            padding: 46px 52px;
            box-shadow: 0 4px 48px rgba(0,0,0,0.12);
            border-radius: 3px;
          }
        }

        /* ══════════════════════════════════════════════════════════
           BASE
           ══════════════════════════════════════════════════════════ */
        .cv-root {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 9.5pt;
          line-height: 1.6;
          color: #1c1c1e;
          background: #ffffff;
        }

        /* ══════════════════════════════════════════════════════════
           HEADER — full-width strip above the two-column layout
           ══════════════════════════════════════════════════════════ */
        .cv-header {
          padding-bottom: 18px;
          margin-bottom: 26px;
          border-bottom: 3px solid #1a2d5a;
          position: relative;
        }
        /* Gold accent bar under header border */
        .cv-header::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          width: 52px;
          height: 3px;
          background: #c09930;
        }

        .cv-name {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 27pt;
          font-weight: 700;
          color: #1a2d5a;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin: 0 0 8px 0;
          line-height: 1.05;
        }

        .cv-contact-bar {
          display: flex;
          flex-wrap: wrap;
          column-gap: 18px;
          row-gap: 3px;
        }

        .cv-contact-item {
          font-size: 8pt;
          color: #3d4d6a;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        /* ══════════════════════════════════════════════════════════
           TWO-COLUMN LAYOUT
           ══════════════════════════════════════════════════════════ */
        .cv-layout {
          display: grid;
          grid-template-columns: 192px 1fr;
          gap: 0 0;
          align-items: start;
        }

        /* ── SIDEBAR ── */
        .cv-sidebar {
          padding-right: 22px;
          border-right: 1px solid #dce2ee;
        }

        /* ── MAIN ── */
        .cv-main {
          padding-left: 26px;
        }

        /* ══════════════════════════════════════════════════════════
           SECTION HEADINGS
           ══════════════════════════════════════════════════════════ */
        .cv-section { margin-bottom: 20px; }

        .cv-section-title {
          font-size: 7pt;
          font-weight: 800;
          letter-spacing: 2.2px;
          text-transform: uppercase;
          color: #1a2d5a;
          border-bottom: 1.5px solid #c09930;
          padding-bottom: 3px;
          margin: 0 0 10px 0;
          break-after: avoid;
          page-break-after: avoid;
        }

        /* ══════════════════════════════════════════════════════════
           SIDEBAR — PROFILE TEXT
           ══════════════════════════════════════════════════════════ */
        .cv-profile-text {
          font-size: 8.5pt;
          color: #374151;
          line-height: 1.65;
          margin: 0;
        }

        /* ══════════════════════════════════════════════════════════
           SIDEBAR — SKILLS
           ══════════════════════════════════════════════════════════ */
        .cv-skill-group { margin-bottom: 10px; }

        .cv-skill-cat {
          display: block;
          font-size: 7.5pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #1a2d5a;
          margin-bottom: 4px;
        }

        .cv-skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 3px;
        }

        .cv-skill-tag {
          background: #edf0f8;
          color: #1a2d5a;
          border-radius: 2px;
          font-size: 7.5pt;
          padding: 2px 7px;
          font-weight: 500;
          line-height: 1.4;
        }

        /* ══════════════════════════════════════════════════════════
           SIDEBAR — LANGUAGES
           ══════════════════════════════════════════════════════════ */
        .cv-lang-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 4px 0;
          border-bottom: 1px solid #edf0f8;
          font-size: 8.5pt;
        }
        .cv-lang-row:last-child { border-bottom: none; }
        .cv-lang-name  { font-weight: 600; color: #1a2d5a; }
        .cv-lang-level { font-size: 7.5pt; color: #6b7280; }

        /* ══════════════════════════════════════════════════════════
           MAIN — TIMELINE ENTRIES (experience / education)
           ══════════════════════════════════════════════════════════ */
        .cv-entry {
          display: grid;
          grid-template-columns: 88px 1fr;
          gap: 0 12px;
          margin-bottom: 14px;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /* Date column with timeline stripe */
        .cv-entry-date {
          font-size: 7.5pt;
          color: #6b7280;
          font-weight: 600;
          line-height: 1.45;
          padding-top: 2px;
          text-align: right;
          padding-right: 12px;
          border-right: 2px solid #dce2ee;
          position: relative;
        }
        /* Gold timeline dot */
        .cv-entry-date::after {
          content: '';
          position: absolute;
          right: -5px;
          top: 5px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #c09930;
          box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px #c09930;
        }

        .cv-entry-role {
          font-size: 10pt;
          font-weight: 700;
          color: #1a2d5a;
          margin: 0 0 1px 0;
          line-height: 1.25;
        }

        .cv-entry-company {
          font-size: 8.5pt;
          color: #4b5563;
          font-weight: 500;
          margin: 0 0 5px 0;
        }

        /* ── Bullets ── */
        .cv-bullets {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .cv-bullets li {
          font-size: 8.5pt;
          color: #374151;
          padding-left: 13px;
          position: relative;
          margin-bottom: 2px;
          line-height: 1.5;
        }

        .cv-bullets li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          width: 5px;
          height: 1.5px;
          background: #c09930;
        }

        /* ══════════════════════════════════════════════════════════
           MAIN — PROJECTS
           ══════════════════════════════════════════════════════════ */
        .cv-project {
          margin-bottom: 11px;
          padding-left: 12px;
          border-left: 2px solid #edf0f8;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .cv-project-name {
          font-size: 9.5pt;
          font-weight: 700;
          color: #1a2d5a;
          margin: 0 0 2px 0;
        }

        .cv-project-desc {
          font-size: 8.5pt;
          color: #374151;
          margin: 0 0 3px 0;
          line-height: 1.55;
          text-align: justify;
        }

        .cv-project-tech {
          font-size: 7.5pt;
          color: #6b7280;
          font-family: 'Courier New', monospace;
          margin: 0;
        }

        /* ══════════════════════════════════════════════════════════
           MAIN — PUBLICATIONS
           ══════════════════════════════════════════════════════════ */
        .cv-pub {
          font-size: 8.5pt;
          color: #374151;
          margin-bottom: 7px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .cv-pub-title   { font-weight: 700; color: #1a2d5a; }
        .cv-pub-journal { font-style: italic; }
        .cv-pub-link    { color: #1d4ed8; font-size: 7.5pt; display: block; margin-top: 1px; }

        /* ══════════════════════════════════════════════════════════
           EDITABLE HIGHLIGHT (screen only)
           ══════════════════════════════════════════════════════════ */
        @media screen {
          [contenteditable]:hover {
            background: rgba(192, 153, 48, 0.06);
            border-radius: 2px;
          }
          [contenteditable]:focus {
            outline: 1.5px dashed #c09930;
            outline-offset: 2px;
            border-radius: 2px;
            background: rgba(192, 153, 48, 0.08);
          }
        }
      `}</style>

      {/* ─────────────────────── DOCUMENT ──────────────────────────── */}
      {/*
        Wrap in a div with id="cv-print-root" so the @media print rule
        can hide all other elements on the page during export.
        Put this id on the nearest full-page wrapper in your app.
      */}
      <div id="cv-print-root">
        <div className="cv-root">

          {/* ══ HEADER ══════════════════════════════════════════════ */}
          <header className="cv-header cv-keep">
            <h1 className="cv-name" contentEditable suppressContentEditableWarning>
              {personalInfo.Firstname} {personalInfo.Lastname}
            </h1>

            <div className="cv-contact-bar">
              {personalInfo.email && (
                <span className="cv-contact-item" contentEditable suppressContentEditableWarning>
                  ✉&thinsp;{personalInfo.email}
                </span>
              )}
              {personalInfo.phone && (
                <span className="cv-contact-item" contentEditable suppressContentEditableWarning>
                  ✆&thinsp;{personalInfo.phone}
                </span>
              )}
              {personalInfo.location && (
                <span className="cv-contact-item" contentEditable suppressContentEditableWarning>
                  ⌖&thinsp;{personalInfo.location}
                </span>
              )}
              {personalInfo.linkedin && (
                <span className="cv-contact-item" contentEditable suppressContentEditableWarning>
                  in&thinsp;{personalInfo.linkedin}
                </span>
              )}
              {personalInfo.IndustryPortfolio && (
                <span className="cv-contact-item" contentEditable suppressContentEditableWarning>
                  ↗&thinsp;{personalInfo.IndustryPortfolio}
                </span>
              )}
            </div>
          </header>

          {/* ══ TWO-COLUMN LAYOUT ═══════════════════════════════════ */}
          <div className="cv-layout">

            {/* ────────── LEFT SIDEBAR ────────── */}
            <aside className="cv-sidebar">

              {/* PROFIL */}
              {cvData.summary && (
                <div className="cv-section">
                  <h2 className="cv-section-title cv-keep-heading">Profil</h2>
                  <p className="cv-profile-text" contentEditable suppressContentEditableWarning>
                    {cvData.summary}
                  </p>
                </div>
              )}

              {/* KENNTNISSE */}
              {cvData.skills && cvData.skills.length > 0 && (
                <div className="cv-section">
                  <h2 className="cv-section-title cv-keep-heading">Kenntnisse</h2>
                  {cvData.skills.map((group: any, i: number) => (
                    <div key={i} className="cv-skill-group cv-keep">
                      <span className="cv-skill-cat" contentEditable suppressContentEditableWarning>
                        {group.category}
                      </span>
                      <div className="cv-skill-tags">
                        {group.items.map((item: string, j: number) => (
                          <span key={j} className="cv-skill-tag" contentEditable suppressContentEditableWarning>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SPRACHEN */}
              {cvData.Languages && cvData.Languages.length > 0 && (
                <div className="cv-section cv-keep">
                  <h2 className="cv-section-title cv-keep-heading">Sprachen</h2>
                  {cvData.Languages.map((lang: any, i: number) => (
                    <div key={i} className="cv-lang-row">
                      <span className="cv-lang-name" contentEditable suppressContentEditableWarning>
                        {lang.language}
                      </span>
                      <span className="cv-lang-level" contentEditable suppressContentEditableWarning>
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </aside>

            {/* ────────── RIGHT MAIN ────────── */}
            <main className="cv-main">

              {/* BERUFSERFAHRUNG */}
              {cvData.experience && cvData.experience.length > 0 && (
                <div className="cv-section">
                  <h2 className="cv-section-title cv-keep-heading">Berufserfahrung</h2>
                  {cvData.experience.map((job: any, i: number) => (
                    <div key={i} className="cv-entry cv-keep">
                      <div className="cv-entry-date" contentEditable suppressContentEditableWarning>
                        {job.date}
                      </div>
                      <div>
                        <p className="cv-entry-role" contentEditable suppressContentEditableWarning>
                          {job.role}
                        </p>
                        <p className="cv-entry-company" contentEditable suppressContentEditableWarning>
                          {job.company}{job.location ? ` · ${job.location}` : ""}
                        </p>
                        {job.achievements?.length > 0 && (
                          <ul className="cv-bullets">
                            {job.achievements.map((a: string, j: number) => (
                              <li key={j} contentEditable suppressContentEditableWarning>{a}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* BILDUNGSWEG */}
              {cvData.education && cvData.education.length > 0 && (
                <div className="cv-section">
                  <h2 className="cv-section-title cv-keep-heading">Bildungsweg</h2>
                  {cvData.education.map((edu: any, i: number) => (
                    <div key={i} className="cv-entry cv-keep">
                      <div className="cv-entry-date" contentEditable suppressContentEditableWarning>
                        {edu.date}
                      </div>
                      <div>
                        <p className="cv-entry-role" contentEditable suppressContentEditableWarning>
                          {edu.degree}
                        </p>
                        <p className="cv-entry-company" contentEditable suppressContentEditableWarning>
                          {edu.institution}{edu.location ? ` · ${edu.location}` : ""}
                        </p>
                        {edu.Focus && (
                          <p style={{fontSize:"8.5pt",color:"#374151",margin:"1px 0 0 0"}}
                             contentEditable suppressContentEditableWarning>
                            <strong>Schwerpunkt:</strong> {edu.Focus}
                          </p>
                        )}
                        {edu.Grade && (
                          <p style={{fontSize:"8.5pt",color:"#374151",margin:"1px 0 0 0"}}
                             contentEditable suppressContentEditableWarning>
                            <strong>Abschlussnote:</strong> {edu.Grade}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PROJEKTE */}
              {cvData.projects && cvData.projects.length > 0 && (
                <div className="cv-section">
                  <h2 className="cv-section-title cv-keep-heading">Projekte</h2>
                  {cvData.projects.map((project: any, i: number) => (
                    <div key={i} className="cv-project">
                      <p className="cv-project-name" contentEditable suppressContentEditableWarning>
                        {project.name}
                      </p>
                      <p className="cv-project-desc" contentEditable suppressContentEditableWarning>
                        {project.description}
                      </p>
                      {project.keywords?.length > 0 && (
                        <p className="cv-project-tech" contentEditable suppressContentEditableWarning>
                          {project.keywords.join(" · ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* PUBLIKATIONEN */}
              {cvData.publications && cvData.publications.length > 0 && (
                <div className="cv-section">
                  <h2 className="cv-section-title cv-keep-heading">Publikationen</h2>
                  {cvData.publications.map((pub: any, i: number) => (
                    <div key={i} className="cv-pub">
                      <span className="cv-pub-title" contentEditable suppressContentEditableWarning>
                        {pub.title}
                      </span>.{" "}
                      <span className="cv-pub-journal" contentEditable suppressContentEditableWarning>
                        {pub.journal}
                      </span>,{" "}
                      <span contentEditable suppressContentEditableWarning>{pub.date}</span>.
                      {pub.link && (
                        <span className="cv-pub-link" contentEditable suppressContentEditableWarning>
                          {pub.link}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </main>
          </div>{/* end cv-layout */}

        </div>{/* end cv-root */}
      </div>{/* end cv-print-root */}
    </>
  );
}