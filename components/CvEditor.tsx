"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

export default function CvEditor({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    content: content,
    editorProps: {
      attributes: {
        // The editor div itself is one continuous A4-width document.
        // Page breaks are rendered visually via CSS (see .a4-page-viewer).
        class: 'a4-editor-content focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  return (
    <>
      <style>{`
        /* ── A4 page viewer ────────────────────────────────────────
           The outer .a4-page-viewer provides the dark tray background.
           The inner content is rendered as a continuous editable area
           but visually broken into A4 "sheets" using a repeating
           background-image that draws a horizontal rule every 297mm,
           simulating page dividers with a shadow gap between pages.
        ─────────────────────────────────────────────────────────── */

        .a4-page-viewer {
          /* Dark document-tray background */
          background: #e4dbd1;
          width: 100%;
          min-height: 100%;
          padding: 40px 0 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .a4-editor-content {
          /* Exact A4 width */
          width: 210mm;
          min-height: 297mm;

          /* White paper */
          background-color: #ffffff;

          /* Tiptap prose styles */
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #1a1a1a;

          /* Inner padding = document margins */
          padding: 20mm 18mm 20mm 18mm;

          /* Paper shadow */
          box-shadow:
            0 4px 6px rgba(0,0,0,0.08),
            0 12px 40px rgba(0,0,0,0.22),
            0 1px 2px rgba(0,0,0,0.12);

          /* 
            THE PAGE-BREAK TRICK:
            Every 297mm, we draw a horizontal "gap" using a repeating
            linear-gradient. This simulates the gap between A4 pages.
            The gradient draws:
              - a dark shadow line at the bottom of a page  
              - a 12px dark gap (the tray showing through)
              - a shadow line at the top of the next page
          */
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0mm,
            transparent calc(297mm - 3px),
            rgba(0,0,0,0.08) calc(297mm - 3px),
            rgba(0,0,0,0.08) 297mm,
            #3a3a3a 297mm,
            #3a3a3a calc(297mm + 12px),
            rgba(0,0,0,0.06) calc(297mm + 12px),
            rgba(0,0,0,0.06) calc(297mm + 15px),
            transparent calc(297mm + 15px)
          );
          background-attachment: local;

          /* Outline when focused */
          outline: none;
        }

        /* Prevent the tray background from showing through on the very
           first "page top" — the first page has no preceding gap */
        .a4-editor-content::before {
          display: none;
        }

        /* ── Prose styles for editor content ── */
        .a4-editor-content h1 {
          font-size: 20pt;
          font-weight: 700;
          margin-bottom: 4pt;
          color: #111;
          line-height: 1.2;
        }
        .a4-editor-content h2 {
          font-size: 13pt;
          font-weight: 700;
          margin-top: 14pt;
          margin-bottom: 4pt;
          color: #222;
          border-bottom: 1px solid #ddd;
          padding-bottom: 3pt;
        }
        .a4-editor-content h3 {
          font-size: 11pt;
          font-weight: 700;
          margin-top: 10pt;
          margin-bottom: 2pt;
          color: #333;
        }
        .a4-editor-content p {
          margin-bottom: 6pt;
        }
        .a4-editor-content ul,
        .a4-editor-content ol {
          padding-left: 18pt;
          margin-bottom: 6pt;
        }
        .a4-editor-content li {
          margin-bottom: 2pt;
        }
        .a4-editor-content strong { font-weight: 700; }
        .a4-editor-content em { font-style: italic; }
        .a4-editor-content a { color: #2563eb; text-decoration: underline; }

        /* ── Print: strip the fake page breaks, let the browser paginate ── */
        @media print {
          .a4-page-viewer {
            background: none;
            padding: 0;
          }
          .a4-editor-content {
            background-image: none;
            box-shadow: none;
            padding: 0;
            width: 100%;
            min-height: auto;
          }
        }
      `}</style>

      <div className="a4-page-viewer">
        <EditorContent editor={editor} />
      </div>
    </>
  )
}