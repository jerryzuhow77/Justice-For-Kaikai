export type Locale = "zh-Hant" | "zh-Hans" | "en" | "ja";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const inline = (value: string) => {
  let text = escapeHtml(value.replace(/<span\s+id="[^"]+"><\/span>/g, ""));
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|#[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
  );
  text = text.replace(
    /(^|\s)(https?:\/\/[^\s<]+)/g,
    '$1<a href="$2" target="_blank" rel="noreferrer">$2</a>',
  );
  return text;
};

const headingId = (value: string, index: number) => {
  const chapter = value.match(/\b(0[1-8])\b/);
  if (chapter) return `copy-${chapter[1]}`;
  return `copy-heading-${index}`;
};

export function renderMarkdown(markdown: string) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const html: string[] = [];
  let i = 0;
  let headingIndex = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();
    if (!line.trim()) {
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.min(6, Math.max(2, heading[1].length));
      html.push(
        `<h${level} id="${headingId(heading[2], headingIndex++)}">${inline(heading[2])}</h${level}>`,
      );
      i += 1;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      html.push("<hr />");
      i += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith(">")) {
        quote.push(lines[i].trimStart().replace(/^>\s?/, ""));
        i += 1;
      }
      html.push(`<blockquote>${quote.map((item) => inline(item)).join("<br />")}</blockquote>`);
      continue;
    }

    if (/^\|.+\|$/.test(line) && i + 1 < lines.length && /^\|?[\s|:-]+\|?$/.test(lines[i + 1])) {
      const rows: string[][] = [];
      rows.push(line.split("|").slice(1, -1).map((cell) => cell.trim()));
      i += 2;
      while (i < lines.length && /^\|.+\|$/.test(lines[i])) {
        rows.push(lines[i].split("|").slice(1, -1).map((cell) => cell.trim()));
        i += 1;
      }
      const [head, ...body] = rows;
      html.push(
        `<div class="table-scroll"><table><thead><tr>${head.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead><tbody>${body
          .map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table></div>`,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i += 1;
      }
      html.push(`<ul>${items.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      html.push(`<ol>${items.map((item) => `<li>${inline(item)}</li>`).join("")}</ol>`);
      continue;
    }

    const paragraph = [line.trim()];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !lines[i].trimStart().startsWith(">") &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !/^\|.+\|$/.test(lines[i])
    ) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    html.push(`<p>${inline(paragraph.join(" "))}</p>`);
  }

  return html.join("\n");
}

export function splitChapters(markdown: string) {
  const marker = /(?=^#{2,4}\s+0[1-8]\s*[｜|])/gm;
  return markdown.split(marker).filter((part) => /^#{2,4}\s+0[1-8]\s*[｜|]/m.test(part));
}

export function extractDialogue(markdown: string, count = 2) {
  const lines = markdown
    .split("\n")
    .filter((line) => /^-\s+`S0[1-8]-L0[1-6]`/.test(line.trim()))
    .slice(0, count)
    .map((line) => line.replace(/^-\s+`[^`]+`\s*/, ""));
  return lines;
}

