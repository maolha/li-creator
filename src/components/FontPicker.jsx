import { useState, useEffect, useRef } from "react";

const HEADING_FONTS = [
  // Bold / Impact
  "Poppins", "Inter", "Montserrat", "Raleway", "Bebas Neue",
  "Oswald", "Anton", "Barlow Condensed",
  // Modern Sans
  "Plus Jakarta Sans", "Space Grotesk", "Sora", "Manrope", "Outfit",
  // Serif / Editorial
  "DM Serif Display", "Playfair Display", "Lora", "Merriweather",
  "Libre Baskerville", "Crimson Text", "Cormorant Garamond",
];

const BODY_FONTS = [
  "Inter", "DM Sans", "Source Sans 3", "Nunito Sans", "Work Sans",
  "Outfit", "Manrope", "Rubik", "Plus Jakarta Sans", "Space Grotesk",
  "Lato", "Open Sans",
];

const loadedFonts = new Set();
function loadFont(fontName) {
  if (!fontName || loadedFonts.has(fontName)) return;
  loadedFonts.add(fontName);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;700;800;900&display=swap`;
  document.head.appendChild(link);
}

export default function FontPicker({ value, onChange, type, T }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const ref = useRef();

  const fonts = type === "heading" ? HEADING_FONTS : BODY_FONTS;
  const fallback = type === "heading" ? "DM Serif Display" : "Inter";
  const fallbackStack = type === "heading" ? "serif" : "sans-serif";

  // Preload all curated fonts
  useEffect(() => { fonts.forEach(loadFont); }, []);
  useEffect(() => { if (value) loadFont(value); }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const [fontError, setFontError] = useState("");

  async function applyCustomFont() {
    if (!customValue.trim()) return;
    setFontError("");
    const name = customValue.trim();
    loadFont(name);
    // Wait for font to load and verify
    try {
      await Promise.race([
        document.fonts.load(`16px '${name}'`),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000)),
      ]);
      const loaded = document.fonts.check(`16px '${name}'`);
      if (!loaded) {
        setFontError(`"${name}" could not be loaded. Check the spelling — it must match the Google Fonts name exactly.`);
        return;
      }
      onChange(name);
      setCustom(false);
      setCustomValue("");
      setOpen(false);
    } catch {
      setFontError(`"${name}" could not be loaded. Check the spelling — it must match the Google Fonts name exactly.`);
    }
  }

  if (custom) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", gap: 4 }}>
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Google Font name..."
            autoFocus
            style={{ ...inp(T), flex: 1, fontSize: 12 }}
            onKeyDown={(e) => { if (e.key === "Enter") applyCustomFont(); if (e.key === "Escape") setCustom(false); }}
          />
          <button onClick={applyCustomFont} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 6, padding: "0 10px", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
            Load
          </button>
          <button onClick={() => { setCustom(false); setFontError(""); }} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "0 8px", fontSize: 10, color: T.muted, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
        {fontError && (
          <div style={{ fontSize: 10, color: "#E85A3A", marginTop: 4, lineHeight: 1.4 }}>{fontError}</div>
        )}
        {customValue && !fontError && (
          <div style={{ fontSize: 13, fontFamily: `'${customValue}', ${fallbackStack}`, color: T.text, padding: "4px 0", opacity: 0.7 }}>
            Preview: {customValue}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          ...inp(T), cursor: "pointer", display: "flex", justifyContent: "space-between",
          alignItems: "center", fontFamily: value ? `'${value}', ${fallbackStack}` : undefined,
          fontSize: 13,
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || `Default (${fallback})`}
        </span>
        <span style={{ fontSize: 9, color: T.muted, flexShrink: 0, marginLeft: 6 }}>▼</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)", maxHeight: 260, overflowY: "auto",
          marginTop: 4,
        }}>
          {/* Default */}
          <FontOption
            label={`Default (${fallback})`}
            fontFamily={`'${fallback}', ${fallbackStack}`}
            selected={!value}
            onClick={() => { onChange(""); setOpen(false); }}
            T={T}
          />

          {/* Curated fonts */}
          {fonts.map((f) => (
            <FontOption
              key={f}
              label={f}
              fontFamily={`'${f}', ${fallbackStack}`}
              selected={value === f}
              onClick={() => { onChange(f); setOpen(false); }}
              T={T}
            />
          ))}

          {/* Custom option */}
          <div
            onClick={() => { setCustom(true); setOpen(false); }}
            style={{
              padding: "8px 12px", cursor: "pointer", fontSize: 11, color: T.accent,
              fontWeight: 600, borderTop: `1px solid ${T.border}`,
            }}
          >
            + Custom font...
          </div>
        </div>
      )}
    </div>
  );
}

function FontOption({ label, fontFamily, selected, onClick, T }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "8px 12px", cursor: "pointer", fontSize: 14,
        fontFamily, color: T.text,
        background: selected ? T.soft : "transparent",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = `${T.soft}`; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
    >
      {label}
      {selected && <span style={{ float: "right", fontSize: 11, color: T.accent }}>✓</span>}
    </div>
  );
}

function inp(T) {
  return { background: T.card, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", fontFamily: "'Inter', sans-serif", fontSize: 13, width: "100%" };
}
