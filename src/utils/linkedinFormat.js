// Convert **bold** markers to Unicode bold characters for LinkedIn
// LinkedIn doesn't render markdown — Unicode Mathematical Bold is the standard workaround

const BOLD_MAP = {};

// A-Z
for (let i = 0; i < 26; i++) {
  BOLD_MAP[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1d5d4 + i); // 𝗔-𝗭
  BOLD_MAP[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1d5ee + i); // 𝗮-𝘇
}
// 0-9
for (let i = 0; i < 10; i++) {
  BOLD_MAP[String.fromCharCode(48 + i)] = String.fromCodePoint(0x1d7ec + i); // 𝟬-𝟵
}

function toBoldUnicode(str) {
  return str
    .split("")
    .map((c) => BOLD_MAP[c] || c)
    .join("");
}

// Convert **text** patterns to Unicode bold
export function formatForLinkedIn(text) {
  return text.replace(/\*\*(.+?)\*\*/g, (_, match) => toBoldUnicode(match));
}

// Render bold markers as <strong> for the in-app preview
export function renderBoldPreview(text) {
  const parts = [];
  let lastIndex = 0;
  const regex = /\*\*(.+?)\*\*/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push({ bold: true, text: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
