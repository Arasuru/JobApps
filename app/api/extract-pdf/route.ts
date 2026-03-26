import { NextResponse } from "next/server";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import type { TextItem as PdfjsTextItem } from "pdfjs-dist/types/src/display/api";

// For server-side / Node.js: require the worker module directly.
// This is the correct fix for "No GlobalWorkerOptions.workerSrc specified".
// eslint-disable-next-line @typescript-eslint/no-require-imports
pdfjs.GlobalWorkerOptions.workerSrc = 
  new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).toString();

// ─── Types ────────────────────────────────────────────────────────────────────

// Use pdfjs's own TextItem type directly — avoids the TS2677 conflict where
// our local interface was missing the required `dir` property.
type TextItem = PdfjsTextItem;

interface Line {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontName: string;
  width: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Group raw TextItems into lines by their Y coordinate (with a small tolerance).
 */
function groupIntoLines(items: TextItem[], yTolerance = 3): Line[] {
  if (items.length === 0) return [];

  // Sort top-to-bottom (PDF y increases upward, so higher y = higher on page)
  const sorted = [...items].sort((a, b) => {
    const ay = a.transform[5];
    const by = b.transform[5];
    return by - ay; // descending: top of page first
  });

  const lines: Line[] = [];
  let currentGroup: TextItem[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const item = sorted[i];
    const prevY = currentGroup[0].transform[5];
    const currY = item.transform[5];

    if (Math.abs(currY - prevY) <= yTolerance) {
      currentGroup.push(item);
    } else {
      lines.push(buildLine(currentGroup));
      currentGroup = [item];
    }
  }
  lines.push(buildLine(currentGroup));

  return lines;
}

function buildLine(items: TextItem[]): Line {
  // Sort left-to-right within a line
  const sorted = [...items].sort((a, b) => a.transform[4] - b.transform[4]);

  let text = "";
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    if (i > 0) {
      const prevItem = sorted[i - 1];
      const prevEnd = prevItem.transform[4] + prevItem.width;
      const currStart = item.transform[4];
      const gap = currStart - prevEnd;
      const avgCharWidth = prevItem.width / (prevItem.str.length || 1);
      if (gap > avgCharWidth * 0.5) {
        text += " ";
      }
    }
    text += item.str;
  }

  const firstItem = sorted[0];
  const fontSize = Math.abs(firstItem.transform[0]) || Math.abs(firstItem.transform[3]);

  return {
    text: text.trim(),
    x: firstItem.transform[4],
    y: firstItem.transform[5],
    fontSize,
    fontName: firstItem.fontName,
    width: sorted.reduce((acc, it) => acc + it.width, 0),
  };
}

function estimateBodyFontSize(lines: Line[]): number {
  const counts: Record<number, number> = {};
  for (const line of lines) {
    const rounded = Math.round(line.fontSize);
    counts[rounded] = (counts[rounded] || 0) + 1;
  }
  let maxCount = 0;
  let bodySize = 12;
  for (const [size, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      bodySize = Number(size);
    }
  }
  return bodySize;
}

function detectTable(lines: Line[]): string | null {
  const candidateRows = lines.filter((l) => l.text.split(/\s{2,}/).length >= 3);
  if (candidateRows.length < 2) return null;

  const rows = candidateRows.map((l) => l.text.split(/\s{2,}/).map((c) => c.trim()));
  const colCount = Math.max(...rows.map((r) => r.length));
  const paddedRows = rows.map((r) => {
    while (r.length < colCount) r.push("");
    return r;
  });

  const toRow = (cells: string[]) => `| ${cells.join(" | ")} |`;
  const header = paddedRows[0];
  const separator = header.map(() => "---");
  return [toRow(header), toRow(separator), ...paddedRows.slice(1).map(toRow)].join("\n");
}

function headingLevel(fontSize: number, bodySize: number): number | null {
  const ratio = fontSize / bodySize;
  if (ratio >= 2.0) return 1;
  if (ratio >= 1.6) return 2;
  if (ratio >= 1.3) return 3;
  if (ratio >= 1.15) return 4;
  return null;
}

function detectListItem(text: string): { ordered: boolean; content: string } | null {
  const bulletMatch = text.match(/^[\u2022\u2023\u25E6\u2043\u2219\-\*\u25AA\u25B8\u2192]\s+(.+)/);
  if (bulletMatch) return { ordered: false, content: bulletMatch[1] };
  const orderedMatch = text.match(/^(?:\(?\d+[\.\)]\)?\s+)(.+)/);
  if (orderedMatch) return { ordered: true, content: orderedMatch[1] };
  return null;
}

function isHorizontalRule(text: string): boolean {
  return /^[─━═\-_*]{4,}$/.test(text.trim());
}

function isCodeLike(line: Line, bodyX: number): boolean {
  const isMonospace = /Mono|Courier|Code|Consolas|Inconsolata|Source Code/i.test(line.fontName);
  const isIndented = line.x > bodyX + 20;
  return isMonospace || isIndented;
}

// ─── Main Conversion ──────────────────────────────────────────────────────────

async function pdfToMarkdown(buffer: ArrayBuffer): Promise<string> {
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableRange: true,
    disableStream: true,
  });

  const pdf = await loadingTask.promise;
  const markdownPages: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Filter out TextMarkedContent items (which lack `str`) using pdfjs's own type guard
    const items = textContent.items.filter(
      (item): item is PdfjsTextItem => "str" in item && (item as PdfjsTextItem).str.trim() !== ""
    );

    if (items.length === 0) continue;

    const lines = groupIntoLines(items);
    const bodySize = estimateBodyFontSize(lines);

    const xCounts: Record<number, number> = {};
    for (const line of lines) {
      const rounded = Math.round(line.x / 5) * 5;
      xCounts[rounded] = (xCounts[rounded] || 0) + 1;
    }
    const bodyX = Number(
      Object.entries(xCounts).sort((a, b) => b[1] - a[1])[0][0]
    );

    const mdLines: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const text = line.text;

      if (!text) { i++; continue; }

      if (isHorizontalRule(text)) {
        mdLines.push("\n---\n");
        i++;
        continue;
      }

      const hLevel = headingLevel(line.fontSize, bodySize);
      if (hLevel) {
        mdLines.push(`\n${"#".repeat(hLevel)} ${text}\n`);
        i++;
        continue;
      }

      if (isCodeLike(line, bodyX)) {
        const codeLines: string[] = [text];
        i++;
        while (i < lines.length && isCodeLike(lines[i], bodyX)) {
          codeLines.push(lines[i].text);
          i++;
        }
        mdLines.push("\n```\n" + codeLines.join("\n") + "\n```\n");
        continue;
      }

      const tableWindow = lines.slice(i, i + 20);
      const tableMarkdown = detectTable(tableWindow);
      if (tableMarkdown) {
        const tableLines = tableWindow.filter((l) => l.text.split(/\s{2,}/).length >= 3);
        mdLines.push("\n" + tableMarkdown + "\n");
        i += tableLines.length;
        continue;
      }

      const listItem = detectListItem(text);
      if (listItem) {
        const prefix = listItem.ordered ? "1." : "-";
        mdLines.push(`${prefix} ${listItem.content}`);
        i++;
        continue;
      }

      const paragraphLines: string[] = [text];
      i++;
      while (i < lines.length) {
        const next = lines[i];
        if (
          !next.text ||
          headingLevel(next.fontSize, bodySize) ||
          detectListItem(next.text) ||
          isHorizontalRule(next.text) ||
          isCodeLike(next, bodyX)
        ) break;
        paragraphLines.push(next.text);
        i++;
      }
      mdLines.push("\n" + paragraphLines.join(" ") + "\n");
    }

    if (mdLines.length > 0) {
      const pageContent = mdLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
      if (pageContent) markdownPages.push(pageContent);
    }
  }

  return markdownPages.join("\n\n---\n\n");
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const markdown = await pdfToMarkdown(arrayBuffer);

    return NextResponse.json({ markdown });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: `Conversion failed: ${error.message}` },
      { status: 500 }
    );
  }
}