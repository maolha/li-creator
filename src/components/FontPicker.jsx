import { useState, useEffect } from "react";

const HEADING_FONTS = [
  "DM Serif Display",
  "Playfair Display",
  "Lora",
  "Merriweather",
  "Libre Baskerville",
  "Crimson Text",
  "Cormorant Garamond",
  "Plus Jakarta Sans",
  "Space Grotesk",
  "Sora",
  "Manrope",
  "Outfit",
];

const BODY_FONTS = [
  "Inter",
  "DM Sans",
  "Source Sans 3",
  "Nunito Sans",
  "Work Sans",
  "Outfit",
  "Manrope",
  "Rubik",
  "Plus Jakarta Sans",
  "Space Grotesk",
  "Lato",
  "Open Sans",
];

// Load a Google Font dynamically
function loadFont(fontName) {
  if (!fontName) return;
  const id = `gf-${fontName.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

export default function FontPicker({ value, onChange, type, T }) {
  const [custom, setCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [fontLoaded, setFontLoaded] = useState(true);

  const fonts = type === "heading" ? HEADING_FONTS : BODY_FONTS;
  const isCustom = value && !fonts.includes(value);

  useEffect(() => {
    if (value) loadFont(value);
  }, [value]);

  // Try loading a custom font and verify it
  function applyCustomFont() {
    if (!customValue.trim()) return;
    loadFont(customValue.trim());
    setFontLoaded(true);
    onChange(customValue.trim());
    setCustom(false);
    setCustomValue("");
  }

  if (custom || isCustom) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", gap: 4 }}>
          <input
            type="text"
            value={isCustom && !custom ? value : customValue}
            onChange={(e) => {
              if (isCustom && !custom) {
                onChange(e.target.value);
              } else {
                setCustomValue(e.target.value);
              }
            }}
            placeholder="Google Font name..."
            style={{ ...inp(T), flex: 1, fontSize: 12 }}
            onKeyDown={(e) => { if (e.key === "Enter") applyCustomFont(); }}
          />
          {custom && (
            <button
              onClick={applyCustomFont}
              style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 6, padding: "0 10px", fontSize: 10, fontWeight: 600, cursor: "pointer" }}
            >
              Load
            </button>
          )}
          <button
            onClick={() => { setCustom(false); setCustomValue(""); if (isCustom) onChange(""); }}
            style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "0 8px", fontSize: 10, color: T.muted, cursor: "pointer" }}
          >
            List
          </button>
        </div>
        {value && (
          <div style={{ fontSize: 12, fontFamily: `'${value}', serif`, color: T.text, padding: "4px 0" }}>
            The quick brown fox — {value}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", gap: 4 }}>
        <select
          value={value || ""}
          onChange={(e) => {
            if (e.target.value === "__custom__") {
              setCustom(true);
              return;
            }
            onChange(e.target.value);
          }}
          style={{ ...inp(T), flex: 1, fontSize: 12, cursor: "pointer" }}
        >
          <option value="">Default ({type === "heading" ? "DM Serif Display" : "Inter"})</option>
          {fonts.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
          <option value="__custom__">Custom font...</option>
        </select>
      </div>
      {value && (
        <div style={{ fontSize: 12, fontFamily: `'${value}', ${type === "heading" ? "serif" : "sans-serif"}`, color: T.text, padding: "2px 0", opacity: 0.7 }}>
          The quick brown fox — {value}
        </div>
      )}
    </div>
  );
}

function inp(T) {
  return { background: T.card, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", fontFamily: "'Inter', sans-serif", fontSize: 13, width: "100%" };
}
