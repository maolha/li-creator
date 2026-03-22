import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  Palette,
  Type,
  Hash,
  MessageSquare,
  Zap,
  ArrowRight,
  Eye,
  PenLine,
  LayoutGrid,
} from "lucide-react";

import { THEMES, contrastText } from "./utils/themes";
import {
  SYSTEM_PROMPT,
  ACCEPTED_FILE_TYPES,
  FILE_ICONS,
  toBase64,
} from "./utils/constants";
import { ScaledSlide } from "./components/SlideRenderer";
import { buildPdf } from "./utils/buildPdf";

const SS = 540;

export default function App() {
  const [input, setInput] = useState("");
  const [source, setSource] = useState("");
  const [files, setFiles] = useState([]);
  const [drag, setDrag] = useState(false);
  const [sc, setSc] = useState(7);
  const [theme, setTheme] = useState("Midnight Pro");
  const [brand, setBrand] = useState("PAIA");
  const [slides, setSlides] = useState(null);
  const [title, setTitle] = useState("");
  const [post, setPost] = useState(null);
  const [cur, setCur] = useState(0);
  const [loading, setLoad] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [cardPx, setCardPx] = useState(480);
  const [activeTab, setActiveTab] = useState("slides");
  const [editingSlide, setEditingSlide] = useState(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("cf_api_key") || "");
  const [showApiInput, setShowApiInput] = useState(false);

  const fileRef = useRef();
  const rightRef = useRef();
  const slideContainerRef = useRef();
  const T = THEMES[theme];
  const ct = contrastText(T.accent);

  // Persist API key
  useEffect(() => {
    if (apiKey) localStorage.setItem("cf_api_key", apiKey);
  }, [apiKey]);

  // Responsive card size
  useEffect(() => {
    if (!rightRef.current) return;
    const obs = new ResizeObserver(([e]) => {
      const w = Math.floor(e.contentRect.width);
      setCardPx(Math.min(w, 540));
    });
    obs.observe(rightRef.current);
    return () => obs.disconnect();
  }, [slides]);

  // Keyboard navigation
  useEffect(() => {
    if (!slides) return;
    const handler = (e) => {
      if (e.key === "ArrowLeft") setCur((c) => Math.max(0, c - 1));
      if (e.key === "ArrowRight") setCur((c) => Math.min(slides.length - 1, c + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [slides]);

  // Touch swipe
  useEffect(() => {
    if (!slideContainerRef.current || !slides) return;
    let startX = 0;
    const el = slideContainerRef.current;
    const onStart = (e) => { startX = e.touches[0].clientX; };
    const onEnd = (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) setCur((c) => Math.min(slides.length - 1, c + 1));
        else setCur((c) => Math.max(0, c - 1));
      }
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [slides]);

  async function addFiles(list) {
    const v = [...list].filter((f) => ACCEPTED_FILE_TYPES[f.type]).slice(0, 4 - files.length);
    const p = await Promise.all(
      v.map(async (f) => ({ name: f.name, type: f.type, b64: await toBase64(f) }))
    );
    setFiles((prev) => [...prev, ...p].slice(0, 4));
  }

  async function generate() {
    if (!input.trim() && !files.length) return;
    if (!apiKey) {
      setShowApiInput(true);
      setError("Please add your Anthropic API key to generate content.");
      return;
    }
    setLoad(true);
    setError("");
    setSlides(null);
    setPost(null);
    setCur(0);
    try {
      const parts = [
        ...files.map((f) =>
          f.type === "application/pdf"
            ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: f.b64 } }
            : { type: "image", source: { type: "base64", media_type: f.type, data: f.b64 } }
        ),
        {
          type: "text",
          text: `Generate exactly ${sc} carousel slides${files.length ? " from attached file(s)" : ""}${files.length && input.trim() ? " and" : ""}${input.trim() ? " from:\n\n" + input : ""}`,
        },
      ];
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: parts }],
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error?.message || `API error ${res.status}`);
      }
      const data = await res.json();
      const raw = data.content?.find((b) => b.type === "text")?.text || "";
      const p = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setSlides(p.slides);
      setTitle(p.title);
      setPost(p.post || null);
    } catch (e) {
      setError(e.message || "Generation failed. Please try again.");
    }
    setLoad(false);
  }

  function postText() {
    if (!post) return "";
    let t = post.hook + "\n\n" + post.body + "\n\n" + post.cta;
    t += "\n\n" + post.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ");
    if (source.trim()) t += `\n\n💬 Source: ${source.trim()}`;
    return t;
  }

  function copyPost() {
    navigator.clipboard.writeText(postText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function downloadPDF() {
    if (!slides) return;
    const html = buildPdf(slides, brand, T);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) {
      setError("Pop-up blocked. Allow pop-ups and try again.");
      return;
    }
    setTimeout(() => URL.revokeObjectURL(url), 90000);
  }

  function updateSlideField(index, field, value) {
    setSlides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  const slide = slides?.[cur];
  const hasContent = input.trim() || files.length > 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.text,
        fontFamily: "'DM Sans', sans-serif",
        transition: "background 0.4s, color 0.4s",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          borderBottom: `1px solid ${T.border}`,
          background: `${T.card}CC`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 20px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: T.gradient || T.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: ct,
                fontWeight: 700,
              }}
            >
              &#10022;
            </div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                ContentForge
              </div>
              <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.2 }}>
                LinkedIn Content Studio
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setShowApiInput(!showApiInput)}
              style={{
                background: apiKey ? T.soft : `${T.accent}22`,
                border: `1px solid ${apiKey ? T.border : T.accent}`,
                borderRadius: 8,
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 600,
                color: apiKey ? T.muted : T.accent,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Zap size={13} />
              {apiKey ? "API Key Set" : "Add API Key"}
            </button>
          </div>
        </div>
      </header>

      {/* API Key Input */}
      <AnimatePresence>
        {showApiInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              overflow: "hidden",
              borderBottom: `1px solid ${T.border}`,
              background: T.card,
            }}
          >
            <div
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Zap size={16} style={{ color: T.accent, flexShrink: 0 }} />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-... (stored locally only)"
                style={{
                  flex: 1,
                  background: T.bg,
                  color: T.text,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
              <button
                onClick={() => setShowApiInput(false)}
                style={{
                  background: T.accent,
                  color: ct,
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: slides ? "minmax(0,420px) minmax(0,1fr)" : "minmax(0,600px)",
            gap: 32,
            alignItems: "start",
            justifyContent: "center",
          }}
        >
          {/* LEFT PANEL */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Hero text when no slides */}
            {!slides && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 8 }}
              >
                <h1
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "clamp(28px, 5vw, 38px)",
                    fontWeight: 400,
                    lineHeight: 1.15,
                    marginBottom: 8,
                    fontStyle: "italic",
                  }}
                >
                  Create content that
                  <span style={{ color: T.accent }}> stops the scroll</span>
                </h1>
                <p
                  style={{
                    color: T.muted,
                    fontSize: 15,
                    lineHeight: 1.6,
                    maxWidth: 480,
                  }}
                >
                  Transform any text, article, or document into stunning LinkedIn
                  carousels with AI-crafted post copy. Ready to publish in seconds.
                </p>
              </motion.div>
            )}

            {/* Settings row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 72px",
                gap: 10,
              }}
            >
              <div>
                <label style={labelStyle(T)}>
                  <Palette size={12} /> Theme
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    style={selectStyle(T)}
                  >
                    {Object.keys(THEMES).map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle(T)}>
                  <Type size={12} /> Brand
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="PAIA"
                  style={inputStyle(T)}
                />
              </div>
              <div>
                <label style={labelStyle(T)}>
                  <LayoutGrid size={12} /> Slides
                </label>
                <select
                  value={sc}
                  onChange={(e) => setSc(Number(e.target.value))}
                  style={selectStyle(T)}
                >
                  {[5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Theme preview strip */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(THEMES).map(([name, t]) => (
                <button
                  key={name}
                  onClick={() => setTheme(name)}
                  title={name}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    border: `2px solid ${name === theme ? t.accent : "transparent"}`,
                    background: t.card,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.2s",
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "40%",
                      background: t.accent,
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Source */}
            <div>
              <label style={labelStyle(T)}>
                <MessageSquare size={12} /> Source (first comment)
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. CIO.com — 6 Innovation Curves"
                style={inputStyle(T)}
              />
            </div>

            {/* File Upload */}
            <div>
              <label style={labelStyle(T)}>
                <Upload size={12} /> Upload Files
                <span style={{ opacity: 0.5, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                  {" "}(max 4)
                </span>
              </label>
              <div
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
                style={{
                  border: `1.5px dashed ${drag ? T.accent : T.border}`,
                  borderRadius: 12,
                  padding: "20px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: drag ? T.soft : "transparent",
                  textAlign: "center",
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => addFiles(e.target.files)}
                />
                <Upload size={20} style={{ color: T.muted, opacity: 0.6 }} />
                <span style={{ fontSize: 13, color: T.muted }}>
                  Drop files or tap to browse
                </span>
                <span style={{ fontSize: 11, color: T.muted, opacity: 0.5 }}>
                  PDF, JPG, PNG, WEBP
                </span>
              </div>
              {files.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {files.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: T.soft,
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontSize: 12,
                        color: T.text,
                      }}
                    >
                      {f.type === "application/pdf" ? (
                        <FileText size={13} style={{ color: T.accent }} />
                      ) : (
                        <ImageIcon size={13} style={{ color: T.accent }} />
                      )}
                      <span
                        style={{
                          maxWidth: 100,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {f.name}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFiles((p) => p.filter((_, j) => j !== i)); }}
                        style={{
                          background: "none",
                          border: "none",
                          color: T.muted,
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Text Input */}
            <div>
              <label style={labelStyle(T)}>
                <PenLine size={12} /> Source Text
                {files.length > 0 && (
                  <span style={{ opacity: 0.5, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                    {" "}(optional with files)
                  </span>
                )}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your report, transcript, article, or notes..."
                rows={slides ? 5 : 8}
                style={{
                  width: "100%",
                  background: T.card,
                  color: T.text,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  lineHeight: 1.65,
                  resize: "vertical",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = T.accent)}
                onBlur={(e) => (e.target.style.borderColor = T.border)}
              />
              {input.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 4,
                  }}
                >
                  <span style={{ fontSize: 11, color: T.muted, opacity: 0.6 }}>
                    {input.length.toLocaleString()} characters
                  </span>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={generate}
              disabled={loading || !hasContent}
              style={{
                background: loading
                  ? T.card
                  : T.gradient || T.accent,
                color: loading ? T.muted : ct,
                border: loading ? `1px solid ${T.border}` : "none",
                borderRadius: 14,
                padding: "16px 24px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading || !hasContent ? "not-allowed" : "pointer",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                opacity: !hasContent ? 0.4 : 1,
                transition: "all 0.3s",
                letterSpacing: "-0.01em",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  Crafting your content...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Carousel
                  <ArrowRight size={16} style={{ opacity: 0.6 }} />
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    color: "#E85A3A",
                    fontSize: 13,
                    padding: "10px 14px",
                    background: "rgba(232,90,58,0.08)",
                    borderRadius: 10,
                    border: "1px solid rgba(232,90,58,0.2)",
                  }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT PANEL */}
          {slides && slide && (
            <motion.div
              ref={rightRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Tab bar */}
              <div
                style={{
                  display: "flex",
                  background: T.card,
                  borderRadius: 12,
                  padding: 4,
                  border: `1px solid ${T.border}`,
                }}
              >
                {[
                  { id: "slides", icon: Eye, label: "Preview" },
                  { id: "edit", icon: PenLine, label: "Edit" },
                  { id: "post", icon: MessageSquare, label: "Post Copy" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 9,
                      border: "none",
                      background: activeTab === tab.id ? T.soft : "transparent",
                      color: activeTab === tab.id ? T.accent : T.muted,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "all 0.2s",
                    }}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: T.muted,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "70%",
                  }}
                >
                  {title}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: T.accent,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {cur + 1} / {slides.length}
                </span>
              </div>

              {/* SLIDES TAB */}
              {activeTab === "slides" && (
                <>
                  <div ref={slideContainerRef} style={{ position: "relative" }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={cur}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ScaledSlide
                          s={slide}
                          brand={brand}
                          i={cur}
                          n={slides.length}
                          T={T}
                          size={cardPx}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Nav arrows overlay */}
                    {cur > 0 && (
                      <button
                        onClick={() => setCur((c) => c - 1)}
                        style={navBtnStyle(T, "left")}
                      >
                        <ChevronLeft size={20} />
                      </button>
                    )}
                    {cur < slides.length - 1 && (
                      <button
                        onClick={() => setCur((c) => c + 1)}
                        style={navBtnStyle(T, "right")}
                      >
                        <ChevronRight size={20} />
                      </button>
                    )}
                  </div>

                  {/* Dot indicators */}
                  <div
                    style={{
                      display: "flex",
                      gap: 5,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCur(i)}
                        style={{
                          width: i === cur ? 24 : 8,
                          height: 8,
                          borderRadius: 4,
                          background: i === cur ? T.accent : T.muted,
                          opacity: i === cur ? 1 : 0.25,
                          transition: "all 0.3s",
                          cursor: "pointer",
                          border: "none",
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>

                  {/* Slide thumbnails */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${Math.min(slides.length, 5)}, 1fr)`,
                      gap: 6,
                    }}
                  >
                    {slides.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setCur(i)}
                        style={{
                          background: T.card,
                          border: `1.5px solid ${i === cur ? T.accent : T.border}`,
                          borderRadius: 10,
                          padding: "8px 7px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          opacity: i === cur ? 1 : 0.5,
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: T.accent,
                            fontWeight: 700,
                            marginBottom: 3,
                            textTransform: "uppercase",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: T.text,
                            lineHeight: 1.35,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {s.headline}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Download button */}
                  <button
                    onClick={downloadPDF}
                    style={{
                      width: "100%",
                      background: "transparent",
                      color: T.text,
                      border: `1px solid ${T.border}`,
                      borderRadius: 12,
                      padding: "14px 20px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = T.soft;
                      e.target.style.borderColor = T.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                      e.target.style.borderColor = T.border;
                    }}
                  >
                    <Download size={16} />
                    Download PDF for LinkedIn
                  </button>
                  <p
                    style={{
                      fontSize: 11,
                      color: T.muted,
                      lineHeight: 1.5,
                      textAlign: "center",
                    }}
                  >
                    Opens print dialog. Select{" "}
                    <strong style={{ color: T.text }}>Save as PDF</strong>. Each
                    slide is a 190x190mm square page.
                  </p>
                </>
              )}

              {/* EDIT TAB */}
              {activeTab === "edit" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {/* Slide selector */}
                  <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCur(i)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          border: `1px solid ${i === cur ? T.accent : T.border}`,
                          background: i === cur ? T.soft : "transparent",
                          color: i === cur ? T.accent : T.muted,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Slide {i + 1}
                      </button>
                    ))}
                  </div>

                  {/* Live preview small */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <ScaledSlide
                      s={slide}
                      brand={brand}
                      i={cur}
                      n={slides.length}
                      T={T}
                      size={Math.min(cardPx, 320)}
                    />
                  </div>

                  {/* Edit fields */}
                  <div
                    style={{
                      background: T.card,
                      border: `1px solid ${T.border}`,
                      borderRadius: 14,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div>
                      <label style={{ ...labelStyle(T), marginBottom: 4 }}>Type</label>
                      <select
                        value={slide.type || "insight"}
                        onChange={(e) => updateSlideField(cur, "type", e.target.value)}
                        style={selectStyle(T)}
                      >
                        {["cover", "insight", "stat", "quote", "cta"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ ...labelStyle(T), marginBottom: 4 }}>Headline</label>
                      <input
                        type="text"
                        value={slide.headline || ""}
                        onChange={(e) => updateSlideField(cur, "headline", e.target.value)}
                        style={inputStyle(T)}
                      />
                    </div>
                    <div>
                      <label style={{ ...labelStyle(T), marginBottom: 4 }}>Body</label>
                      <textarea
                        value={slide.body || ""}
                        onChange={(e) => updateSlideField(cur, "body", e.target.value)}
                        rows={3}
                        style={{
                          ...inputStyle(T),
                          resize: "vertical",
                          lineHeight: 1.6,
                        }}
                      />
                    </div>
                    {(slide.type === "stat" || slide.type === undefined) && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div>
                          <label style={{ ...labelStyle(T), marginBottom: 4 }}>Stat</label>
                          <input
                            type="text"
                            value={slide.stat || ""}
                            onChange={(e) => updateSlideField(cur, "stat", e.target.value)}
                            placeholder="73%"
                            style={inputStyle(T)}
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyle(T), marginBottom: 4 }}>Stat Label</label>
                          <input
                            type="text"
                            value={slide.statLabel || ""}
                            onChange={(e) => updateSlideField(cur, "statLabel", e.target.value)}
                            placeholder="Adoption rate"
                            style={inputStyle(T)}
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label style={{ ...labelStyle(T), marginBottom: 4 }}>Tag</label>
                      <input
                        type="text"
                        value={slide.tag || ""}
                        onChange={(e) => updateSlideField(cur, "tag", e.target.value)}
                        style={inputStyle(T)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* POST TAB */}
              {activeTab === "post" && post && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>
                      LinkedIn Post Copy
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={copyPost}
                      style={{
                        background: copied ? T.accent : T.soft,
                        border: `1px solid ${copied ? T.accent : T.border}`,
                        color: copied ? ct : T.accent,
                        borderRadius: 8,
                        padding: "7px 14px",
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.2s",
                      }}
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? "Copied!" : "Copy All"}
                    </motion.button>
                  </div>

                  {/* Structured post preview */}
                  <div
                    style={{
                      background: T.card,
                      border: `1px solid ${T.border}`,
                      borderRadius: 14,
                      overflow: "hidden",
                    }}
                  >
                    {/* Hook */}
                    <div
                      style={{
                        padding: "16px 16px 12px",
                        borderBottom: `1px solid ${T.border}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: T.accent,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: 6,
                        }}
                      >
                        Hook
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: T.text,
                          lineHeight: 1.5,
                        }}
                      >
                        {post.hook}
                      </div>
                    </div>
                    {/* Body */}
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: `1px solid ${T.border}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: T.accent,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: 6,
                        }}
                      >
                        Body
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: T.text,
                          lineHeight: 1.8,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {post.body}
                      </div>
                    </div>
                    {/* CTA */}
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: `1px solid ${T.border}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: T.accent,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: 6,
                        }}
                      >
                        Call to Action
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: T.text,
                          lineHeight: 1.5,
                        }}
                      >
                        {post.cta}
                      </div>
                    </div>
                    {/* Hashtags */}
                    <div style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: T.accent,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: 8,
                        }}
                      >
                        Hashtags
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {post.hashtags.map((h, i) => (
                          <span
                            key={i}
                            style={{
                              background: T.soft,
                              border: `1px solid ${T.border}`,
                              borderRadius: 6,
                              padding: "4px 10px",
                              fontSize: 12,
                              color: T.accent,
                              fontWeight: 500,
                            }}
                          >
                            #{h.replace(/^#/, "")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Full text preview */}
                  <div
                    style={{
                      background: T.card,
                      border: `1px solid ${T.border}`,
                      borderRadius: 14,
                      padding: 16,
                      whiteSpace: "pre-wrap",
                      fontSize: 13,
                      lineHeight: 1.75,
                      color: T.text,
                      wordBreak: "break-word",
                    }}
                  >
                    {postText()}
                  </div>

                  {source.trim() && (
                    <p
                      style={{
                        fontSize: 11,
                        color: T.muted,
                        lineHeight: 1.5,
                        padding: "8px 12px",
                        background: T.soft,
                        borderRadius: 8,
                      }}
                    >
                      Tip: Paste the source line as your first comment after
                      publishing for better reach.
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: minmax(0,420px) minmax(0,1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// Shared styles
function labelStyle(T) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: T.muted,
    marginBottom: 6,
  };
}

function inputStyle(T) {
  return {
    background: T.card,
    color: T.text,
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    padding: "10px 13px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    width: "100%",
    transition: "border-color 0.2s",
  };
}

function selectStyle(T) {
  return {
    ...inputStyle(T),
    cursor: "pointer",
    appearance: "auto",
  };
}

function navBtnStyle(T, side) {
  return {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [side]: 8,
    width: 40,
    height: 40,
    borderRadius: 12,
    background: `${T.card}DD`,
    backdropFilter: "blur(8px)",
    border: `1px solid ${T.border}`,
    color: T.text,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    transition: "all 0.2s",
  };
}
