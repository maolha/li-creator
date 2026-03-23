import { contrastText } from "./themes";

export function labelStyle(T) {
  return { display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.muted, marginBottom: 6 };
}

export function inputStyle(T) {
  return { background: T.card, color: T.text, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 13px", fontFamily: "'Inter', sans-serif", fontSize: 14, width: "100%", transition: "border-color 0.2s" };
}

export function selectStyle(T) {
  return { ...inputStyle(T), cursor: "pointer", appearance: "auto" };
}

export function navBtnStyle(T, side) {
  return {
    position: "absolute", top: "50%", transform: "translateY(-50%)", [side]: 8,
    width: 40, height: 40, borderRadius: 12, background: `${T.card}DD`, backdropFilter: "blur(8px)",
    border: `1px solid ${T.border}`, color: T.text, display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", zIndex: 10, transition: "all 0.2s",
  };
}

export function exportBtnStyle(T) {
  return {
    width: "100%", background: "transparent", color: T.text, border: `1px solid ${T.border}`, borderRadius: 12,
    padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s",
  };
}

export function postLabelStyle(T) {
  return { fontSize: 10, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 };
}

export function postEditStyle(T, bold = false) {
  return {
    width: "100%", background: "transparent", color: T.text, border: "none", borderRadius: 0,
    padding: 0, fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.7, resize: "vertical",
    fontWeight: bold ? 600 : 400,
  };
}
