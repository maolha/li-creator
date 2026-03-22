import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, RotateCcw, Loader2, Calendar, Layers, Quote, BarChart3, AlignLeft, UserCircle } from "lucide-react";

const TYPE_ICONS = {
  carousel: Layers,
  "quote-card": Quote,
  "stat-card": BarChart3,
  "text-post": AlignLeft,
  speaker: UserCircle,
};

export default function HistoryPanel({ T, creations, onLoad, onDelete, loading }) {
  const [deleting, setDeleting] = useState(null);

  async function handleDelete(id) {
    setDeleting(id);
    await onDelete(id);
    setDeleting(null);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40, color: T.muted }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!creations.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ textAlign: "center", padding: "40px 20px", color: T.muted }}
      >
        <Layers size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
        <p style={{ fontSize: 14 }}>No saved creations yet.</p>
        <p style={{ fontSize: 12, opacity: 0.6 }}>Generated content will appear here automatically.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 640, margin: "0 auto", width: "100%" }}
    >
      <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
        Content Library
      </h2>
      <p style={{ fontSize: 13, color: T.muted, marginBottom: 8 }}>
        {creations.length} creation{creations.length !== 1 ? "s" : ""} saved
      </p>

      <AnimatePresence>
        {creations.map((c) => {
          const Icon = TYPE_ICONS[c.contentType] || Layers;
          const date = c.createdAt?.toDate
            ? c.createdAt.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            : "";
          const slideCount = c.slides?.length || 0;

          return (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onClick={() => onLoad(c)}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.accent)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}
            >
              {/* Icon */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: T.soft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} style={{ color: T.accent }} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: T.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.title || "Untitled"}
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: T.muted, marginTop: 2 }}>
                  {date && (
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Calendar size={10} />
                      {date}
                    </span>
                  )}
                  <span style={{ textTransform: "capitalize" }}>{c.contentType || "carousel"}</span>
                  {slideCount > 0 && <span>{slideCount} slides</span>}
                  {c.contentType === "speaker" && c.speakerData?.speakers && (
                    <span>{c.speakerData.speakers.filter((s) => s?.name).length} speaker{c.speakerData.speakers.filter((s) => s?.name).length !== 1 ? "s" : ""}</span>
                  )}
                </div>
                {(c.post?.hook || (c.contentType === "speaker" && c.speakerData?.eventTitle)) && (
                  <div
                    style={{
                      fontSize: 11,
                      color: T.muted,
                      marginTop: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      opacity: 0.7,
                    }}
                  >
                    {c.post?.hook?.replace(/\*\*/g, "") || c.speakerData?.eventTitle || ""}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onLoad(c); }}
                  title="Load this creation"
                  style={actionBtn(T)}
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                  title="Delete"
                  disabled={deleting === c.id}
                  style={{ ...actionBtn(T), color: "#E85A3A" }}
                >
                  {deleting === c.id ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}

function actionBtn(T) {
  return {
    background: T.soft,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: 6,
    cursor: "pointer",
    color: T.muted,
    display: "flex",
    alignItems: "center",
  };
}
