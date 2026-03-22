import { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
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
  MessageSquare,
  Zap,
  ArrowRight,
  Eye,
  PenLine,
  LayoutGrid,
  RefreshCw,
  ImageDown,
  Archive,
  Quote,
  BarChart3,
  AlignLeft,
  Layers,
  Globe,
  Sun,
  Moon,
} from "lucide-react";

import { getThemes, contrastText, makeCustomVariants } from "./utils/themes";
import { ACCEPTED_FILE_TYPES, toBase64 } from "./utils/constants";
import {
  CAROUSEL_PROMPT,
  SINGLE_SLIDE_PROMPT,
  QUOTE_CARD_PROMPT,
  STAT_CARD_PROMPT,
  TEXT_POST_PROMPT,
} from "./utils/prompts";
import { ScaledSlide, SlideInner } from "./components/SlideRenderer";
import { buildPdf } from "./utils/buildPdf";
import { downloadSinglePng, downloadAllPngs } from "./utils/exportPng";
import { themeFromAccent } from "./utils/colorExtractor";
import { saveApiKey, loadApiKey } from "./utils/secureStorage";

const SS = 540;

// Persist helpers
function loadState(key, fallback) {
  try {
    const v = localStorage.getItem(`cf_${key}`);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function saveState(key, value) {
  try { localStorage.setItem(`cf_${key}`, JSON.stringify(value)); } catch {}
}

const CONTENT_TYPES = [
  { id: "carousel", label: "Carousel", icon: Layers, desc: "Multi-slide deck" },
  { id: "quote-card", label: "Quote Card", icon: Quote, desc: "Single quote" },
  { id: "stat-card", label: "Stat Card", icon: BarChart3, desc: "Single stat" },
  { id: "text-post", label: "Text Post", icon: AlignLeft, desc: "Copy only" },
];

export default function App() {
  // Persisted state (survives F5)
  const [input, setInput] = useState(() => loadState("input", ""));
  const [source, setSource] = useState(() => loadState("source", ""));
  const [files, setFiles] = useState(() => loadState("files", []));
  const [sc, setSc] = useState(() => loadState("sc", 7));
  const [theme, setTheme] = useState(() => loadState("theme", "Midnight Pro"));
  const [brand, setBrand] = useState(() => loadState("brand", "PAIA"));
  const [slides, setSlides] = useState(() => loadState("slides", null));
  const [title, setTitle] = useState(() => loadState("title", ""));
  const [post, setPost] = useState(() => loadState("post", null));
  const [cur, setCur] = useState(() => loadState("cur", 0));
  const [contentType, setContentType] = useState(() => loadState("contentType", "carousel"));
  const [customThemes, setCustomThemes] = useState(() => loadState("custom_themes", {}));
  const [brandMode, setBrandMode] = useState(() => loadState("brandMode", "dark"));
  const [activeTab, setActiveTab] = useState(() => loadState("activeTab", "slides"));

  // Ephemeral state (reset on refresh is fine)
  const [drag, setDrag] = useState(false);
  const [loading, setLoad] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [cardPx, setCardPx] = useState(480);
  const [apiKey, setApiKey] = useState("");
  const [showApiInput, setShowApiInput] = useState(false);
  const [regeneratingSlide, setRegeneratingSlide] = useState(null);
  const [exportingPng, setExportingPng] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);
  const [extractingBrand, setExtractingBrand] = useState(false);
  const [brandUrl, setBrandUrl] = useState("");

  const fileRef = useRef();
  const rightRef = useRef();
  const slideContainerRef = useRef();
  const hiddenSlideRef = useRef();

  const builtInThemes = getThemes(brandMode);
  // customThemes stores { name: { dark: {...}, light: {...} } }
  const customResolved = {};
  for (const [name, val] of Object.entries(customThemes)) {
    customResolved[name] = val[brandMode] || val.dark || val;
  }
  const allThemes = { ...builtInThemes, ...customResolved };
  const T = allThemes[theme] || builtInThemes["Midnight Pro"];
  const ct = contrastText(T.accent);

  // Load encrypted API key on mount
  useEffect(() => { loadApiKey().then((k) => { if (k) setApiKey(k); }); }, []);

  // Persist all content state to localStorage
  useEffect(() => { saveState("input", input); }, [input]);
  useEffect(() => { saveState("source", source); }, [source]);
  useEffect(() => { saveState("files", files); }, [files]);
  useEffect(() => { saveState("sc", sc); }, [sc]);
  useEffect(() => { saveState("theme", theme); }, [theme]);
  useEffect(() => { saveState("brand", brand); }, [brand]);
  useEffect(() => { saveState("slides", slides); }, [slides]);
  useEffect(() => { saveState("title", title); }, [title]);
  useEffect(() => { saveState("post", post); }, [post]);
  useEffect(() => { saveState("cur", cur); }, [cur]);
  useEffect(() => { saveState("contentType", contentType); }, [contentType]);
  useEffect(() => { saveState("custom_themes", customThemes); }, [customThemes]);
  useEffect(() => { saveState("brandMode", brandMode); }, [brandMode]);
  useEffect(() => { saveState("activeTab", activeTab); }, [activeTab]);

  // Responsive card size
  useEffect(() => {
    if (!rightRef.current) return;
    const obs = new ResizeObserver(([e]) => setCardPx(Math.min(Math.floor(e.contentRect.width), 540)));
    obs.observe(rightRef.current);
    return () => obs.disconnect();
  }, [slides]);

  // Keyboard navigation
  useEffect(() => {
    if (!slides?.length) return;
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "ArrowLeft") setCur((c) => Math.max(0, c - 1));
      if (e.key === "ArrowRight") setCur((c) => Math.min(slides.length - 1, c + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [slides]);

  // Touch swipe
  useEffect(() => {
    if (!slideContainerRef.current || !slides?.length) return;
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
    return () => { el.removeEventListener("touchstart", onStart); el.removeEventListener("touchend", onEnd); };
  }, [slides]);

  async function addFiles(list) {
    const v = [...list].filter((f) => ACCEPTED_FILE_TYPES[f.type]).slice(0, 4 - files.length);
    const p = await Promise.all(v.map(async (f) => ({ name: f.name, type: f.type, b64: await toBase64(f) })));
    setFiles((prev) => [...prev, ...p].slice(0, 4));
  }

  function getPromptForType(type) {
    switch (type) {
      case "quote-card": return QUOTE_CARD_PROMPT;
      case "stat-card": return STAT_CARD_PROMPT;
      case "text-post": return TEXT_POST_PROMPT;
      default: return CAROUSEL_PROMPT;
    }
  }

  function getGenerateText(type) {
    switch (type) {
      case "quote-card": return "a quote card";
      case "stat-card": return "a stat card";
      case "text-post": return "a text post";
      default: return `exactly ${sc} carousel slides`;
    }
  }

  async function callApi(systemPrompt, userText) {
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
        system: systemPrompt,
        messages: [{ role: "user", content: userText }],
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.error?.message || `API error ${res.status}`);
    }
    const data = await res.json();
    const raw = data.content?.find((b) => b.type === "text")?.text || "";
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  }

  async function generate() {
    if (!input.trim() && !files.length) return;
    if (!apiKey) { setShowApiInput(true); setError("Please add your Anthropic API key."); return; }
    setLoad(true); setError(""); setSlides(null); setPost(null); setCur(0);
    try {
      const parts = [
        ...files.map((f) =>
          f.type === "application/pdf"
            ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: f.b64 } }
            : { type: "image", source: { type: "base64", media_type: f.type, data: f.b64 } }
        ),
        {
          type: "text",
          text: `Generate ${getGenerateText(contentType)}${files.length ? " from attached file(s)" : ""}${files.length && input.trim() ? " and" : ""}${input.trim() ? " from:\n\n" + input : ""}`,
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
          system: getPromptForType(contentType),
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
      setSlides(p.slides?.length ? p.slides : null);
      setTitle(p.title);
      setPost(p.post || null);
      if (contentType === "text-post") setActiveTab("post");
      else setActiveTab("slides");
    } catch (e) {
      setError(e.message || "Generation failed. Please try again.");
    }
    setLoad(false);
  }

  async function regenerateSlide(index) {
    if (!apiKey || regeneratingSlide !== null) return;
    setRegeneratingSlide(index);
    try {
      const s = slides[index];
      const prev = index > 0 ? slides[index - 1] : null;
      const next = index < slides.length - 1 ? slides[index + 1] : null;

      let context = `Regenerate slide ${index + 1} of ${slides.length} in a LinkedIn carousel about "${title}".`;
      if (prev) context += ` Previous slide: "${prev.headline}" — ${prev.body}.`;
      if (next) context += ` Next slide: "${next.headline}" — ${next.body}.`;
      context += ` Current type: ${s.type || "insight"}. Generate a fresh, improved replacement.`;
      if (input.trim()) context += `\n\nOriginal source context:\n${input.slice(0, 500)}`;

      const result = await callApi(SINGLE_SLIDE_PROMPT, context);
      setSlides((prev) => {
        const updated = [...prev];
        updated[index] = result;
        return updated;
      });
    } catch (e) {
      setError(`Failed to regenerate slide: ${e.message}`);
    }
    setRegeneratingSlide(null);
  }

  // PNG Export
  async function exportCurrentPng() {
    if (!hiddenSlideRef.current) return;
    setExportingPng(true);
    try {
      await downloadSinglePng(hiddenSlideRef.current, `${title || "slide"}-${cur + 1}.png`);
    } catch (e) {
      setError("PNG export failed. Try again.");
    }
    setExportingPng(false);
  }

  async function exportAllPngsZip() {
    setExportingAll(true);
    try {
      // We'll render each slide to the hidden container one at a time
      const tempContainer = document.createElement("div");
      tempContainer.style.cssText = "position:fixed;left:-9999px;top:0;";
      document.body.appendChild(tempContainer);

      // toPng, JSZip, saveAs already imported at top

      const zip = new JSZip();
      const folder = zip.folder(title || "carousel");

      for (let i = 0; i < slides.length; i++) {
        // Create a temporary react root for each slide
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `width:${SS}px;height:${SS}px;`;
        tempContainer.appendChild(wrapper);

        const root = createRoot(wrapper);

        await new Promise((resolve) => {
          root.render(
            <SlideInner s={slides[i]} brand={brand} i={i} n={slides.length} T={T} />
          );
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        });

        const dataUrl = await toPng(wrapper, { width: SS, height: SS, pixelRatio: 2, cacheBust: true });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        folder.file(`slide-${String(i + 1).padStart(2, "0")}.png`, blob);

        root.unmount();
        tempContainer.removeChild(wrapper);
      }

      document.body.removeChild(tempContainer);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${title || "carousel"}.zip`);
    } catch (e) {
      setError("ZIP export failed: " + e.message);
    }
    setExportingAll(false);
  }

  // Brand extraction
  async function extractBrand() {
    if (!brandUrl.trim()) return;
    setExtractingBrand(true);
    setError("");
    try {
      const url = brandUrl.startsWith("http") ? brandUrl : `https://${brandUrl}`;
      const res = await fetch(`/api/extract-brand?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error("Could not extract brand colors");
      const data = await res.json();

      if (data.colors?.length > 0) {
        const accent = data.themeColor || data.colors[0];
        const domain = new URL(url).hostname.replace("www.", "");
        const variants = themeFromAccent(accent);
        if (variants) {
          setCustomThemes((prev) => ({ ...prev, [domain]: variants }));
          setTheme(domain);
        }
      } else {
        setError("No brand colors found. Try entering a hex code instead.");
      }
    } catch (e) {
      setError(e.message || "Brand extraction failed.");
    }
    setExtractingBrand(false);
  }

  function addCustomThemeFromColor(input) {
    let hex = input.trim();
    if (!hex.startsWith("#")) hex = `#${hex}`;
    // Support 3 or 6 digit hex
    if (!hex.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)) {
      setError("Enter a valid hex color like #4F8EF7 or #F00");
      return;
    }
    // Normalize 3-digit to 6-digit
    if (hex.length === 4) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    const name = `Custom ${hex}`;
    const variants = themeFromAccent(hex);
    if (variants) {
      setCustomThemes((prev) => ({ ...prev, [name]: variants }));
      setTheme(name);
    }
  }

  function updateSlideField(index, field, value) {
    setSlides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function updatePostField(field, value) {
    setPost((prev) => ({ ...prev, [field]: value }));
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
    if (!win) { setError("Pop-up blocked. Allow pop-ups."); return; }
    setTimeout(() => URL.revokeObjectURL(url), 90000);
  }

  const slide = slides?.[cur];
  const hasContent = input.trim() || files.length > 0;
  const hasSlides = slides?.length > 0;
  const hasOutput = hasSlides || post;
  const showSlideControls = hasSlides && contentType !== "text-post";

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
      {/* Hidden render target for PNG export */}
      {slide && (
        <div style={{ position: "fixed", left: -9999, top: 0, zIndex: -1 }}>
          <div ref={hiddenSlideRef} style={{ width: SS, height: SS }}>
            <SlideInner s={slide} brand={brand} i={cur} n={slides.length} T={T} />
          </div>
        </div>
      )}

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
              &#9670;
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                ContentForge
              </div>
              <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.2 }}>
                LinkedIn Content Studio
              </div>
            </div>
          </div>
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
      </header>

      {/* API Key drawer */}
      <AnimatePresence>
        {showApiInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden", borderBottom: `1px solid ${T.border}`, background: T.card }}
          >
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <Zap size={16} style={{ color: T.accent, flexShrink: 0 }} />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-... (stored locally only)"
                style={{ flex: 1, background: T.bg, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}
              />
              <button
                onClick={() => { saveApiKey(apiKey); setShowApiInput(false); }}
                style={{ background: T.accent, color: ct, border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: hasOutput ? "minmax(0,420px) minmax(0,1fr)" : "minmax(0,600px)",
            gap: 32,
            alignItems: "start",
            justifyContent: "center",
          }}
        >
          {/* ─── LEFT PANEL ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Hero */}
            {!hasOutput && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 8 }}>
                <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 400, lineHeight: 1.15, marginBottom: 8, fontStyle: "italic" }}>
                  Create content that<span style={{ color: T.accent }}> stops the scroll</span>
                </h1>
                <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.6, maxWidth: 480 }}>
                  Transform any text, article, or document into stunning LinkedIn carousels, quote cards, stat cards, and post copy with AI. Ready to publish in seconds.
                </p>
              </motion.div>
            )}

            {/* Content Type Selector */}
            <div>
              <label style={labelStyle(T)}>
                <Layers size={12} /> Content Type
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {CONTENT_TYPES.map((ct) => (
                  <button
                    key={ct.id}
                    onClick={() => setContentType(ct.id)}
                    style={{
                      background: contentType === ct.id ? T.soft : "transparent",
                      border: `1.5px solid ${contentType === ct.id ? T.accent : T.border}`,
                      borderRadius: 10,
                      padding: "10px 6px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      transition: "all 0.2s",
                      color: contentType === ct.id ? T.accent : T.muted,
                    }}
                  >
                    <ct.icon size={16} />
                    <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2, textAlign: "center" }}>{ct.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings row */}
            <div style={{ display: "grid", gridTemplateColumns: contentType === "carousel" ? "1fr 1fr 72px" : "1fr 1fr", gap: 10 }}>
              <div>
                <label style={labelStyle(T)}><Palette size={12} /> Theme</label>
                <select value={theme} onChange={(e) => setTheme(e.target.value)} style={selectStyle(T)}>
                  {Object.keys(allThemes).map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle(T)}><Type size={12} /> Brand</label>
                <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="PAIA" style={inputStyle(T)} />
              </div>
              {contentType === "carousel" && (
                <div>
                  <label style={labelStyle(T)}><LayoutGrid size={12} /> Slides</label>
                  <select value={sc} onChange={(e) => setSc(Number(e.target.value))} style={selectStyle(T)}>
                    {[5, 6, 7, 8, 9, 10].map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Theme swatches */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {Object.entries(allThemes).map(([name, t]) => (
                <button
                  key={name}
                  onClick={() => setTheme(name)}
                  title={name}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    border: `2px solid ${name === theme ? t.accent : "transparent"}`,
                    background: t.card, cursor: "pointer", position: "relative", overflow: "hidden", padding: 0, transition: "all 0.2s",
                  }}
                >
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: t.accent }} />
                </button>
              ))}
            </div>

            {/* Brand Domain Grabber */}
            <div>
              <label style={labelStyle(T)}><Globe size={12} /> Brand from Website</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={brandUrl}
                  onChange={(e) => setBrandUrl(e.target.value)}
                  placeholder="example.com or #FF5722"
                  style={{ ...inputStyle(T), flex: 1 }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (brandUrl.match(/^#[0-9a-fA-F]{6}$/)) addCustomThemeFromColor(brandUrl);
                      else extractBrand();
                    }
                  }}
                />
                <button
                  onClick={() => brandMode === "dark" ? setBrandMode("light") : setBrandMode("dark")}
                  title={`${brandMode === "dark" ? "Dark" : "Light"} mode`}
                  style={{
                    background: T.soft, border: `1px solid ${T.border}`, borderRadius: 10, padding: "0 10px",
                    cursor: "pointer", color: T.muted, display: "flex", alignItems: "center",
                  }}
                >
                  {brandMode === "dark" ? <Moon size={14} /> : <Sun size={14} />}
                </button>
                <button
                  onClick={() => {
                    if (brandUrl.match(/^#[0-9a-fA-F]{6}$/)) addCustomThemeFromColor(brandUrl);
                    else extractBrand();
                  }}
                  disabled={extractingBrand || !brandUrl.trim()}
                  style={{
                    background: T.accent, color: contrastText(T.accent), border: "none", borderRadius: 10,
                    padding: "0 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    opacity: extractingBrand || !brandUrl.trim() ? 0.4 : 1, whiteSpace: "nowrap",
                    display: "flex", alignItems: "center", gap: 5,
                  }}
                >
                  {extractingBrand ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Globe size={13} />}
                  {extractingBrand ? "..." : "Apply"}
                </button>
              </div>
              <p style={{ fontSize: 10, color: T.muted, marginTop: 4, opacity: 0.7 }}>
                Enter a domain to grab colors, or paste a hex code like #4F8EF7
              </p>
            </div>

            {/* Source */}
            <div>
              <label style={labelStyle(T)}><MessageSquare size={12} /> Source (first comment)</label>
              <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. CIO.com — 6 Innovation Curves" style={inputStyle(T)} />
            </div>

            {/* File Upload */}
            {contentType !== "text-post" && (
              <div>
                <label style={labelStyle(T)}><Upload size={12} /> Upload Files <span style={{ opacity: 0.5, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(max 4)</span></label>
                <div
                  onClick={() => fileRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
                  style={{
                    border: `1.5px dashed ${drag ? T.accent : T.border}`, borderRadius: 12, padding: "20px 16px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer",
                    transition: "all 0.2s", background: drag ? T.soft : "transparent", textAlign: "center",
                  }}
                >
                  <input ref={fileRef} type="file" accept=".pdf,image/*" multiple style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
                  <Upload size={20} style={{ color: T.muted, opacity: 0.6 }} />
                  <span style={{ fontSize: 13, color: T.muted }}>Drop files or tap to browse</span>
                  <span style={{ fontSize: 11, color: T.muted, opacity: 0.5 }}>PDF, JPG, PNG, WEBP</span>
                </div>
                {files.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {files.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: T.soft, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, color: T.text }}>
                        {f.type === "application/pdf" ? <FileText size={13} style={{ color: T.accent }} /> : <ImageIcon size={13} style={{ color: T.accent }} />}
                        <span style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); setFiles((p) => p.filter((_, j) => j !== i)); }} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", padding: 0, display: "flex" }}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Text Input */}
            <div>
              <label style={labelStyle(T)}>
                <PenLine size={12} /> Source Text
                {files.length > 0 && <span style={{ opacity: 0.5, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}> (optional with files)</span>}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your report, transcript, article, or notes..."
                rows={hasOutput ? 5 : 8}
                style={{
                  width: "100%", background: T.card, color: T.text, border: `1px solid ${T.border}`,
                  borderRadius: 12, padding: 14, fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                  lineHeight: 1.65, resize: "vertical", transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = T.accent)}
                onBlur={(e) => (e.target.style.borderColor = T.border)}
              />
              {input.length > 0 && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: T.muted, opacity: 0.6 }}>{input.length.toLocaleString()} chars</span>
                </div>
              )}
            </div>

            {/* Generate */}
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={generate}
              disabled={loading || !hasContent}
              style={{
                background: loading ? T.card : T.gradient || T.accent,
                color: loading ? T.muted : contrastText(T.accent),
                border: loading ? `1px solid ${T.border}` : "none",
                borderRadius: 14, padding: "16px 24px", fontFamily: "'DM Sans', sans-serif",
                fontSize: 15, fontWeight: 700, cursor: loading || !hasContent ? "not-allowed" : "pointer",
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                opacity: !hasContent ? 0.4 : 1, transition: "all 0.3s", letterSpacing: "-0.01em",
              }}
            >
              {loading ? (
                <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Crafting your content...</>
              ) : (
                <><Sparkles size={18} /> Generate {CONTENT_TYPES.find((c) => c.id === contentType)?.label} <ArrowRight size={16} style={{ opacity: 0.6 }} /></>
              )}
            </motion.button>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ color: "#E85A3A", fontSize: 13, padding: "10px 14px", background: "rgba(232,90,58,0.08)", borderRadius: 10, border: "1px solid rgba(232,90,58,0.2)" }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* ─── RIGHT PANEL ─── */}
          {hasOutput && (
            <motion.div
              ref={rightRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* Tab bar */}
              <div style={{ display: "flex", background: T.card, borderRadius: 12, padding: 4, border: `1px solid ${T.border}` }}>
                {[
                  showSlideControls && { id: "slides", icon: Eye, label: "Preview" },
                  showSlideControls && { id: "edit", icon: PenLine, label: "Edit" },
                  post && { id: "post", icon: MessageSquare, label: "Post Copy" },
                ]
                  .filter(Boolean)
                  .map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        flex: 1, padding: "10px 14px", borderRadius: 9, border: "none",
                        background: activeTab === tab.id ? T.soft : "transparent",
                        color: activeTab === tab.id ? T.accent : T.muted,
                        fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s",
                      }}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                    </button>
                  ))}
              </div>

              {/* Title */}
              {title && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                    {title}
                  </span>
                  {showSlideControls && (
                    <span style={{ fontSize: 12, color: T.accent, fontWeight: 600, flexShrink: 0 }}>
                      {cur + 1} / {slides.length}
                    </span>
                  )}
                </div>
              )}

              {/* ── SLIDES TAB ── */}
              {activeTab === "slides" && showSlideControls && slide && (
                <>
                  <div ref={slideContainerRef} style={{ position: "relative" }}>
                    <AnimatePresence mode="wait">
                      <motion.div key={cur} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }}>
                        <ScaledSlide s={slide} brand={brand} i={cur} n={slides.length} T={T} size={cardPx} />
                      </motion.div>
                    </AnimatePresence>
                    {cur > 0 && <button onClick={() => setCur((c) => c - 1)} style={navBtnStyle(T, "left")}><ChevronLeft size={20} /></button>}
                    {cur < slides.length - 1 && <button onClick={() => setCur((c) => c + 1)} style={navBtnStyle(T, "right")}><ChevronRight size={20} /></button>}
                  </div>

                  {/* Dots */}
                  <div style={{ display: "flex", gap: 5, alignItems: "center", justifyContent: "center" }}>
                    {slides.map((_, i) => (
                      <button key={i} onClick={() => setCur(i)} style={{ width: i === cur ? 24 : 8, height: 8, borderRadius: 4, background: i === cur ? T.accent : T.muted, opacity: i === cur ? 1 : 0.25, transition: "all 0.3s", cursor: "pointer", border: "none", padding: 0 }} />
                    ))}
                  </div>

                  {/* Thumbnails */}
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(slides.length, 5)}, 1fr)`, gap: 6 }}>
                    {slides.map((s, i) => (
                      <button
                        key={i} onClick={() => setCur(i)}
                        style={{
                          background: T.card, border: `1.5px solid ${i === cur ? T.accent : T.border}`, borderRadius: 10,
                          padding: "8px 7px", cursor: "pointer", transition: "all 0.2s", opacity: i === cur ? 1 : 0.5, textAlign: "left",
                        }}
                      >
                        <div style={{ fontSize: 10, color: T.accent, fontWeight: 700, marginBottom: 3, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div style={{ fontSize: 9, color: T.text, lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {s.headline}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Export buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button onClick={exportCurrentPng} disabled={exportingPng} style={exportBtnStyle(T)}>
                      {exportingPng ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <ImageDown size={14} />}
                      {exportingPng ? "Exporting..." : "PNG"}
                    </button>
                    <button onClick={exportAllPngsZip} disabled={exportingAll} style={exportBtnStyle(T)}>
                      {exportingAll ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Archive size={14} />}
                      {exportingAll ? "Zipping..." : "All PNGs (ZIP)"}
                    </button>
                  </div>
                  <button onClick={downloadPDF} style={exportBtnStyle(T)}>
                    <Download size={14} /> Download PDF
                  </button>
                  <p style={{ fontSize: 11, color: T.muted, lineHeight: 1.5, textAlign: "center" }}>
                    PDF opens print dialog — select <strong style={{ color: T.text }}>Save as PDF</strong>. PNG exports at 2x resolution (1080x1080).
                  </p>
                </>
              )}

              {/* ── EDIT TAB ── */}
              {activeTab === "edit" && showSlideControls && slide && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Slide selector with regenerate */}
                  <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4, alignItems: "center" }}>
                    {slides.map((_, i) => (
                      <button
                        key={i} onClick={() => setCur(i)}
                        style={{
                          padding: "6px 12px", borderRadius: 8, border: `1px solid ${i === cur ? T.accent : T.border}`,
                          background: i === cur ? T.soft : "transparent", color: i === cur ? T.accent : T.muted,
                          fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif",
                          position: "relative",
                        }}
                      >
                        {regeneratingSlide === i && <Loader2 size={10} style={{ animation: "spin 1s linear infinite", position: "absolute", top: 2, right: 2 }} />}
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => regenerateSlide(cur)}
                      disabled={regeneratingSlide !== null}
                      title="Regenerate this slide"
                      style={{
                        padding: "6px 10px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.soft,
                        color: T.accent, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", opacity: regeneratingSlide !== null ? 0.4 : 1,
                      }}
                    >
                      <RefreshCw size={12} /> Regenerate
                    </button>
                  </div>

                  {/* Mini preview */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <ScaledSlide s={slide} brand={brand} i={cur} n={slides.length} T={T} size={Math.min(cardPx, 300)} />
                  </div>

                  {/* Edit fields */}
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ ...labelStyle(T), marginBottom: 4 }}>Type</label>
                      <select value={slide.type || "insight"} onChange={(e) => updateSlideField(cur, "type", e.target.value)} style={selectStyle(T)}>
                        {["cover", "insight", "stat", "quote", "cta"].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ ...labelStyle(T), marginBottom: 4 }}>Headline</label>
                      <input type="text" value={slide.headline || ""} onChange={(e) => updateSlideField(cur, "headline", e.target.value)} style={inputStyle(T)} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle(T), marginBottom: 4 }}>Body</label>
                      <textarea value={slide.body || ""} onChange={(e) => updateSlideField(cur, "body", e.target.value)} rows={3} style={{ ...inputStyle(T), resize: "vertical", lineHeight: 1.6 }} />
                    </div>
                    {slide.type === "stat" && (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div>
                            <label style={{ ...labelStyle(T), marginBottom: 4 }}>Stat</label>
                            <input type="text" value={slide.stat || ""} onChange={(e) => updateSlideField(cur, "stat", e.target.value)} placeholder="73%" style={inputStyle(T)} />
                          </div>
                          <div>
                            <label style={{ ...labelStyle(T), marginBottom: 4 }}>Stat Label</label>
                            <input type="text" value={slide.statLabel || ""} onChange={(e) => updateSlideField(cur, "statLabel", e.target.value)} placeholder="Adoption rate" style={inputStyle(T)} />
                          </div>
                        </div>
                        <div>
                          <label style={{ ...labelStyle(T), marginBottom: 4 }}>Stat Font Size</label>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <input
                              type="range"
                              min={40}
                              max={140}
                              value={slide.statFontSize || (slide.stat?.length > 5 ? 70 : slide.stat?.length > 3 ? 90 : 112)}
                              onChange={(e) => updateSlideField(cur, "statFontSize", Number(e.target.value))}
                              style={{ flex: 1, accentColor: T.accent }}
                            />
                            <span style={{ fontSize: 12, color: T.muted, fontFamily: "'JetBrains Mono', monospace", minWidth: 36, textAlign: "right" }}>
                              {slide.statFontSize || (slide.stat?.length > 5 ? 70 : slide.stat?.length > 3 ? 90 : 112)}px
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                    <div>
                      <label style={{ ...labelStyle(T), marginBottom: 4 }}>Tag</label>
                      <input type="text" value={slide.tag || ""} onChange={(e) => updateSlideField(cur, "tag", e.target.value)} style={inputStyle(T)} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── POST TAB ── */}
              {activeTab === "post" && post && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>LinkedIn Post Copy</span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={copyPost}
                      style={{
                        background: copied ? T.accent : T.soft, border: `1px solid ${copied ? T.accent : T.border}`,
                        color: copied ? contrastText(T.accent) : T.accent, borderRadius: 8, padding: "7px 14px",
                        fontSize: 12, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
                        fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                      }}
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? "Copied!" : "Copy All"}
                    </motion.button>
                  </div>

                  {/* Editable structured post */}
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
                    {/* Hook */}
                    <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${T.border}` }}>
                      <div style={postLabelStyle(T)}>Hook</div>
                      <textarea
                        value={post.hook}
                        onChange={(e) => updatePostField("hook", e.target.value)}
                        rows={2}
                        style={postEditStyle(T, true)}
                      />
                    </div>
                    {/* Body */}
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
                      <div style={postLabelStyle(T)}>Body</div>
                      <textarea
                        value={post.body}
                        onChange={(e) => updatePostField("body", e.target.value)}
                        rows={5}
                        style={postEditStyle(T)}
                      />
                    </div>
                    {/* CTA */}
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
                      <div style={postLabelStyle(T)}>Call to Action</div>
                      <textarea
                        value={post.cta}
                        onChange={(e) => updatePostField("cta", e.target.value)}
                        rows={2}
                        style={postEditStyle(T, true)}
                      />
                    </div>
                    {/* Hashtags */}
                    <div style={{ padding: "12px 16px" }}>
                      <div style={postLabelStyle(T)}>Hashtags</div>
                      <input
                        type="text"
                        value={post.hashtags.map((h) => h.replace(/^#/, "")).join(", ")}
                        onChange={(e) => {
                          const tags = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                          updatePostField("hashtags", tags);
                        }}
                        placeholder="tag1, tag2, tag3"
                        style={{ ...inputStyle(T), fontSize: 13, color: T.accent }}
                      />
                      <p style={{ fontSize: 10, color: T.muted, marginTop: 4, opacity: 0.7 }}>Separate with commas</p>
                    </div>
                  </div>

                  {/* Full preview */}
                  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.75, color: T.text, wordBreak: "break-word" }}>
                    {postText()}
                  </div>

                  {source.trim() && (
                    <p style={{ fontSize: 11, color: T.muted, lineHeight: 1.5, padding: "8px 12px", background: T.soft, borderRadius: 8 }}>
                      Tip: Paste the source line as your first comment after publishing for better reach.
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: minmax(0,420px) minmax(0,1fr)"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

// ── Shared styles ──
function labelStyle(T) {
  return { display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.muted, marginBottom: 6 };
}

function inputStyle(T) {
  return { background: T.card, color: T.text, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 13px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, width: "100%", transition: "border-color 0.2s" };
}

function selectStyle(T) {
  return { ...inputStyle(T), cursor: "pointer", appearance: "auto" };
}

function navBtnStyle(T, side) {
  return {
    position: "absolute", top: "50%", transform: "translateY(-50%)", [side]: 8,
    width: 40, height: 40, borderRadius: 12, background: `${T.card}DD`, backdropFilter: "blur(8px)",
    border: `1px solid ${T.border}`, color: T.text, display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", zIndex: 10, transition: "all 0.2s",
  };
}

function exportBtnStyle(T) {
  return {
    width: "100%", background: "transparent", color: T.text, border: `1px solid ${T.border}`, borderRadius: 12,
    padding: "12px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s",
  };
}

function postLabelStyle(T) {
  return { fontSize: 10, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 };
}

function postEditStyle(T, bold = false) {
  return {
    width: "100%", background: "transparent", color: T.text, border: "none", borderRadius: 0,
    padding: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.7, resize: "vertical",
    fontWeight: bold ? 600 : 400,
  };
}
