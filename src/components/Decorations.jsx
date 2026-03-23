// Data-driven decorative overlay renderer
export default function Decorations({ items }) {
  if (!items?.length) return null;
  return items.map((d, i) => {
    if (d.type === "circle") {
      return (
        <div key={i} style={{
          position: "absolute", top: d.top, right: d.right, bottom: d.bottom, left: d.left,
          width: d.size, height: d.size, borderRadius: "50%",
          background: d.fill || "transparent",
          border: d.border || "none",
          opacity: d.opacity || 0.1,
          pointerEvents: "none",
        }} />
      );
    }
    if (d.type === "diagonal") {
      return (
        <div key={i} style={{
          position: "absolute", top: "50%", left: "-25%",
          width: d.width || "150%", height: d.height || 100,
          background: d.color, opacity: d.opacity || 0.1,
          transform: `rotate(${d.angle || -12}deg)`,
          transformOrigin: "center",
          pointerEvents: "none",
        }} />
      );
    }
    if (d.type === "ghostText") {
      return (
        <div key={i} style={{
          position: "absolute", bottom: d.bottom ?? -20, right: d.right ?? -10,
          top: d.top, left: d.left,
          fontFamily: "'DM Serif Display',serif",
          fontSize: d.fontSize || 250,
          fontWeight: 400, lineHeight: 1,
          color: d.color, opacity: d.opacity || 0.04,
          userSelect: "none", pointerEvents: "none",
          letterSpacing: d.letterSpacing || "-0.04em",
          transform: d.rotate ? `rotate(${d.rotate}deg)` : undefined,
          whiteSpace: "nowrap",
        }}>
          {d.text}
        </div>
      );
    }
    if (d.type === "stripe") {
      return (
        <div key={i} style={{
          position: "absolute", top: d.top ?? 0, left: 0,
          width: "100%", height: d.height || 6,
          background: d.color || d.gradient,
          opacity: d.opacity ?? 1,
          pointerEvents: "none",
        }} />
      );
    }
    if (d.type === "insetBorder") {
      return (
        <div key={i} style={{
          position: "absolute", top: d.offset || 16, left: d.offset || 16,
          right: d.offset || 16, bottom: d.offset || 16,
          border: `${d.width || 2}px solid ${d.color || "rgba(255,255,255,0.15)"}`,
          borderRadius: d.radius || 0,
          pointerEvents: "none",
        }} />
      );
    }
    if (d.type === "gradientOverlay") {
      return (
        <div key={i} style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: d.gradient,
          opacity: d.opacity ?? 1,
          pointerEvents: "none",
        }} />
      );
    }
    if (d.type === "accentBar") {
      return (
        <div key={i} style={{
          position: "absolute", top: d.top ?? 0, left: d.left ?? 0,
          width: d.width, height: d.height,
          background: d.color || d.gradient,
          opacity: d.opacity ?? 1,
          pointerEvents: "none",
        }} />
      );
    }
    if (d.type === "texture") {
      return (
        <div key={i} style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)",
          opacity: d.opacity ?? 1,
          pointerEvents: "none",
        }} />
      );
    }
    return null;
  });
}
