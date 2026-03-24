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
  ClipboardCopy,
  Mic,
  Users,
  Settings,
  LogIn,
  LogOut,
  History,
  Save,
  CopyPlus,
  Hash,
  UserCircle,
  FilePlus,
  ChevronDown,
} from "lucide-react";

import { getThemes, contrastText, makeCustomVariants } from "./utils/themes";
import { APP_THEMES } from "./utils/appTheme";
import { brandDisplayName, brandAccent } from "./utils/brandSchema";
import { ACCEPTED_FILE_TYPES, toBase64 } from "./utils/constants";
import {
  CAROUSEL_PROMPT,
  SINGLE_SLIDE_PROMPT,
  QUOTE_CARD_PROMPT,
  STAT_CARD_PROMPT,
  TEXT_POST_PROMPT,
} from "./utils/prompts";
import { ScaledSlide, SlideInner } from "./components/SlideRenderer";
import { ScaledSpeakerSlide, SpeakerSlideInner, SPEAKER_LAYOUTS, SPEAKER_ASPECTS } from "./components/SpeakerSlide";
import { buildPdf } from "./utils/buildPdf";
import { downloadSinglePng, downloadAllPngs } from "./utils/exportPng";
import { themeFromAccent } from "./utils/colorExtractor";
import { saveApiKey, loadApiKey } from "./utils/secureStorage";
import { formatForLinkedIn, renderBoldPreview } from "./utils/linkedinFormat";
import {
  signInWithGoogle,
  logOut,
  onAuthChange,
  getUserProfile,
  updateUserProfile,
  saveApiKeyToFirebase,
  getApiKeyFromFirebase,
  saveCreation,
  getCreations,
  deleteCreation,
} from "./utils/firebase";
import Logo from "./components/Logo";
import SettingsPanel from "./components/SettingsPanel";
import HistoryPanel from "./components/HistoryPanel";
import LandingPage from "./components/LandingPage";
import OnboardingFlow from "./components/OnboardingFlow";

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

// Deep-clean object for Firestore: replace undefined with null at all depths
function cleanForFirestore(obj) {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(cleanForFirestore);
  const cleaned = {};
  for (const [k, v] of Object.entries(obj)) {
    cleaned[k] = cleanForFirestore(v);
  }
  return cleaned;
}

const TONES = [
  { id: "professional", label: "Professional" },
  { id: "provocative", label: "Provocative" },
  { id: "storytelling", label: "Storytelling" },
  { id: "educational", label: "Educational" },
  { id: "data-driven", label: "Data-driven" },
];

const AUDIENCES = [
  { id: "general", label: "General" },
  { id: "c-suite", label: "C-Suite / Execs" },
  { id: "developers", label: "Developers" },
  { id: "marketers", label: "Marketers" },
  { id: "founders", label: "Founders / Startup" },
  { id: "hr", label: "HR / People" },
  { id: "finance", label: "Finance / Banking" },
];

const CONTENT_TYPES = [
  { id: "carousel", label: "Carousel", icon: Layers, desc: "Multi-slide deck" },
  { id: "quote-card", label: "Quote Card", icon: Quote, desc: "Single quote" },
  { id: "stat-card", label: "Stat Card", icon: BarChart3, desc: "Single stat" },
  { id: "text-post", label: "Text Post", icon: AlignLeft, desc: "Copy only" },
  { id: "speaker", label: "Speaker", icon: UserCircle, desc: "Event visual" },
];

export default function App() {
  // Persisted state (survives F5)
  const [input, setInput] = useState(() => loadState("input", ""));
  const [source, setSource] = useState(() => loadState("source", ""));
  const [files, setFiles] = useState(() => loadState("files", []));
  const [sc, setSc] = useState(() => loadState("sc", 7));
  const [theme, setTheme] = useState(() => loadState("theme", "Midnight Pro"));
  const [activeBrand, setActiveBrand] = useState(() => loadState("activeBrand", null));
  const brand = brandDisplayName(activeBrand) || "";
  const [slides, setSlides] = useState(() => loadState("slides", null));
  const [title, setTitle] = useState(() => loadState("title", ""));
  const [post, setPost] = useState(() => loadState("post", null));
  const [cur, setCur] = useState(() => loadState("cur", 0));
  const [lastGenFingerprint, setLastGenFingerprint] = useState("");
  const [contentType, setContentType] = useState(() => loadState("contentType", "carousel"));
  const [customThemes, setCustomThemes] = useState(() => loadState("custom_themes", {}));
  const [appMode, setAppMode] = useState(() => loadState("appMode", "light")); // app shell only
  const [activeTab, setActiveTab] = useState(() => loadState("activeTab", "slides"));
  const [tone, setTone] = useState(() => loadState("tone", "professional"));
  const [intensity, setIntensity] = useState(() => loadState("intensity", "clean"));
  const [slideAspect, setSlideAspect] = useState(() => loadState("slideAspect", "1:1"));
  const [slideBgMode, setSlideBgMode] = useState(() => loadState("slideBgMode", "default"));
  const [slideLogo, setSlideLogo] = useState(() => loadState("slideLogo", { show: "none", position: "top-right" })); // show: none|all|first|last|first-last
  const [audience, setAudience] = useState(() => loadState("audience", "general"));
  const [speakerData, setSpeakerData] = useState(() => {
    const saved = loadState("speakerData", null);
    const defaults = { eventTitle: "", eventDate: "", cta: "", eventUrl: "", speakers: [{ name: "", title: "", company: "", photo: null, photoUrl: "" }] };
    if (!saved) return defaults;
    // Ensure speakers array is valid
    return {
      ...defaults,
      ...saved,
      speakers: Array.isArray(saved.speakers) && saved.speakers.length > 0
        ? saved.speakers.map((s) => ({ name: "", title: "", company: "", photo: null, photoUrl: "", ...s }))
        : defaults.speakers,
    };
  });

  // Auth & user state
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [creations, setCreations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [page, setPage] = useState("create"); // "create" | "settings" | "history"

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
  const [showDesign, setShowDesign] = useState(false);
  const [bgImageMode, setBgImageMode] = useState(() => loadState("bgImageMode", "off"));
  const [genInstructions, setGenInstructions] = useState("");

  const fileRef = useRef();
  const rightRef = useRef();
  const slideContainerRef = useRef();
  const hiddenSlideRef = useRef();

  // App shell theme (fixed dark/light, independent of output preset)
  const A = APP_THEMES[appMode] || APP_THEMES.dark;
  const appBg = A.bg;
  const appText = A.text;

  // Output preset (accent colors for slides + UI accents)
  // Output presets are always dark-base (slideBgMode handles light/invert on output)
  const builtInPresets = getThemes("dark");
  const customResolved = {};
  for (const [name, val] of Object.entries(customThemes)) {
    customResolved[name] = val.dark || val;
  }
  const allPresets = { ...builtInPresets, ...customResolved };
  const T = allPresets[theme] || builtInPresets["Midnight Pro"];
  const ct = contrastText(A.accent); // for UI buttons
  const slideCt = contrastText(T.accent); // for slide rendering

  // Auth listener
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        const profile = await getUserProfile(u.uid);
        setUserProfile(profile);
        // Check if user needs onboarding (no profile data yet)
        const p = profile?.profile;
        const isNew = !p || (!p.linkedinHeadline && !p.products && !p.goals);
        setNeedsOnboarding(isNew);
        // Load API key from Firebase if available, otherwise from local
        const fbKey = await getApiKeyFromFirebase(u.uid);
        if (fbKey) {
          setApiKey(fbKey);
        } else {
          loadApiKey().then((k) => { if (k) setApiKey(k); });
        }
        // Apply default brand from profile
        if (p?.brands?.length) {
          const defaultBrand = p.brands.find((b) => b.isDefault) || p.brands[0];
          if (defaultBrand && !activeBrand) {
            setActiveBrand(defaultBrand);
            if (defaultBrand.voice?.tone) setTone(defaultBrand.voice.tone);
            if (defaultBrand.voice?.audience) setAudience(defaultBrand.voice.audience);
            // Generate theme from brand accent
            if (brandAccent(defaultBrand)) {
              const variants = makeCustomVariants(brandAccent(defaultBrand));
              if (variants) {
                const themeName = `brand-${defaultBrand.id}`;
                setCustomThemes((prev) => ({ ...prev, [themeName]: variants }));
                setTheme(themeName);
              }
            }
          }
        }
      } else {
        setUserProfile(null);
        setNeedsOnboarding(false);
        loadApiKey().then((k) => { if (k) setApiKey(k); });
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Handle sign in from landing page
  async function handleSignIn() {
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e.message);
    }
  }

  // Handle onboarding completion
  async function handleOnboardingComplete(data) {
    if (!user) return;
    // Save profile
    await updateUserProfile(user.uid, { profile: data.profile });
    setUserProfile((prev) => ({ ...prev, profile: data.profile }));
    // Save API key
    if (data.apiKey) {
      setApiKey(data.apiKey);
      saveApiKey(data.apiKey);
      await saveApiKeyToFirebase(user.uid, data.apiKey);
    }
    // Apply defaults from onboarding
    if (data.profile.defaultBrand) setActiveBrand({ name: data.profile.defaultBrand });
    setNeedsOnboarding(false);
  }

  // Load creation history when user logs in
  useEffect(() => {
    if (!user) { setCreations([]); return; }
    setLoadingHistory(true);
    getCreations(user.uid).then((c) => { setCreations(c); setLoadingHistory(false); });
  }, [user]);

  // Persist all content state to localStorage
  useEffect(() => { saveState("input", input); }, [input]);
  useEffect(() => { saveState("source", source); }, [source]);
  useEffect(() => { saveState("files", files); }, [files]);
  useEffect(() => { saveState("sc", sc); }, [sc]);
  useEffect(() => { saveState("theme", theme); }, [theme]);
  useEffect(() => { saveState("activeBrand", activeBrand); }, [activeBrand]);
  useEffect(() => { saveState("slides", slides); }, [slides]);
  useEffect(() => { saveState("title", title); }, [title]);
  useEffect(() => { saveState("post", post); }, [post]);
  useEffect(() => { saveState("cur", cur); }, [cur]);
  useEffect(() => { saveState("contentType", contentType); }, [contentType]);
  useEffect(() => { saveState("custom_themes", customThemes); }, [customThemes]);
  useEffect(() => { saveState("appMode", appMode); }, [appMode]);
  useEffect(() => { saveState("activeTab", activeTab); }, [activeTab]);
  useEffect(() => { saveState("tone", tone); }, [tone]);
  useEffect(() => { saveState("audience", audience); }, [audience]);
  useEffect(() => { saveState("intensity", intensity); }, [intensity]);
  useEffect(() => { saveState("slideAspect", slideAspect); }, [slideAspect]);
  useEffect(() => { saveState("slideBgMode", slideBgMode); }, [slideBgMode]);
  useEffect(() => { saveState("slideLogo", slideLogo); }, [slideLogo]);
  useEffect(() => { saveState("bgImageMode", bgImageMode); }, [bgImageMode]);
  useEffect(() => { saveState("speakerData", speakerData); }, [speakerData]);

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
    let base;
    switch (type) {
      case "quote-card": base = QUOTE_CARD_PROMPT; break;
      case "stat-card": base = STAT_CARD_PROMPT; break;
      case "text-post": base = TEXT_POST_PROMPT; break;
      default: base = CAROUSEL_PROMPT;
    }
    const toneInstructions = tone !== "professional" ? `\n\nTONE: Write in a ${tone} tone. ${
      tone === "provocative" ? "Challenge conventional thinking. Use bold, contrarian statements. Be edgy but credible." :
      tone === "storytelling" ? "Use narrative structure. Open with a scene or anecdote. Make it personal and relatable." :
      tone === "educational" ? "Teach clearly. Use frameworks, step-by-step breakdowns, and 'here is what most people miss' patterns." :
      tone === "data-driven" ? "Lead with numbers and evidence. Cite specific stats. Use 'the data shows' framing." :
      ""
    }` : "";
    const audienceInstructions = audience !== "general" ? `\n\nAUDIENCE: Write specifically for ${
      audience === "c-suite" ? "C-suite executives and senior leaders. Use strategic language, focus on business impact, ROI, and competitive advantage. Skip technical details." :
      audience === "developers" ? "software developers and engineers. Use technical language, code metaphors, and engineering frameworks. Be specific and practical." :
      audience === "marketers" ? "marketing professionals. Focus on growth, engagement, conversion, and brand strategy. Use marketing frameworks." :
      audience === "founders" ? "startup founders and entrepreneurs. Focus on scaling, fundraising, product-market fit, and founder lessons. Be real and battle-tested." :
      audience === "hr" ? "HR and people leaders. Focus on culture, hiring, retention, DEI, and employee experience. Use empathetic, people-first language." :
      audience === "finance" ? "finance and banking professionals. Focus on risk, compliance, market trends, and financial innovation. Use precise, authoritative language." :
      `${audience} professionals.`
    }` : "";
    // Inject user context from profile
    let userContext = "";
    const p = userProfile?.profile;
    if (p) {
      const parts = [];
      if (p.linkedinHeadline?.trim()) parts.push(`AUTHOR HEADLINE: ${p.linkedinHeadline.trim()}`);
      if (p.linkedinAbout?.trim()) parts.push(`AUTHOR BIO: ${p.linkedinAbout.trim()}`);
      if (p.products?.trim()) parts.push(`PRODUCTS/SERVICES: ${p.products.trim()}`);
      if (p.goals?.trim()) parts.push(`CONTENT GOALS: ${p.goals.trim()}`);
      if (parts.length) {
        userContext = `\n\nUSER CONTEXT (use this to personalize content, match the author's voice, and reference their expertise naturally):\n${parts.join("\n")}`;
      }
    }
    // Inject brand voice
    const ab = activeBrand;
    if (ab?.voice) {
      const bParts = [];
      if (ab.voice.products?.trim()) bParts.push(`PRODUCTS/SERVICES: ${ab.voice.products.trim()}`);
      if (ab.voice.narratives?.trim()) bParts.push(`KEY NARRATIVES: ${ab.voice.narratives.trim()}`);
      if (ab.voice.beliefs?.trim()) bParts.push(`BELIEFS & VALUES: ${ab.voice.beliefs.trim()}`);
      if (bParts.length) {
        userContext += `\n\nBRAND VOICE for "${ab.name}":\n${bParts.join("\n")}`;
      }
      if (ab.voice.aiInstructions?.trim()) {
        userContext += `\n\nCUSTOM INSTRUCTIONS (follow these strictly):\n${ab.voice.aiInstructions.trim()}`;
      }
    }
    return base + toneInstructions + audienceInstructions + userContext;
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

  // Fingerprint of inputs that affect generation
  function genFingerprint() {
    return JSON.stringify([input, files.map((f) => f.name), sc, contentType, tone, audience, source, activeBrand?.id, genInstructions]);
  }
  // Note: isOutputStale computed later, after hasOutput is defined

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
          text: `Generate ${getGenerateText(contentType)}${files.length ? " from attached file(s)" : ""}${files.length && input.trim() ? " and" : ""}${input.trim() ? " from:\n\n" + input : ""}${source.trim() ? `\n\nSOURCE/REFERENCE: "${source.trim()}" — Reference this source naturally in the post body to add credibility. Attribute key insights to it.` : ""}${genInstructions.trim() ? `\n\nSPECIAL INSTRUCTIONS FOR THIS GENERATION: ${genInstructions.trim()}` : ""}`,
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

      setLastGenFingerprint(genFingerprint());
      // No auto-save — user saves manually via "Save to Library"
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

  // Rewrite slide with instructions
  const [slideRewritePrompt, setSlideRewritePrompt] = useState("");
  const [rewritingSlide, setRewritingSlide] = useState(false);
  async function rewriteSlide(index) {
    if (!apiKey || rewritingSlide) return;
    setRewritingSlide(true);
    try {
      const s = slides[index];
      const context = `Rewrite this LinkedIn carousel slide. Keep the same type "${s.type || "insight"}".
Current headline: "${s.headline}"
Current body: "${s.body}"
${s.stat ? `Current stat: "${s.stat}"` : ""}
${slideRewritePrompt.trim() ? `\nInstructions for rewrite: ${slideRewritePrompt}` : "Make it punchier, more engaging, and more surprising."}
${input.trim() ? `\nOriginal source context:\n${input.slice(0, 500)}` : ""}`;
      const result = await callApi(SINGLE_SLIDE_PROMPT, context);
      setSlides((prev) => {
        const updated = [...prev];
        updated[index] = result;
        return updated;
      });
      setSlideRewritePrompt("");
    } catch (e) {
      setError(`Rewrite failed: ${e.message}`);
    }
    setRewritingSlide(false);
  }

  // Rewrite post copy with instructions
  const [postRewritePrompt, setPostRewritePrompt] = useState("");
  const [rewritingPost, setRewritingPost] = useState(false);
  async function rewritePost() {
    if (!apiKey || !post || rewritingPost) return;
    setRewritingPost(true);
    try {
      const prompt = getPromptForType(contentType);
      const context = `Rewrite this LinkedIn post copy. Keep the same topic and structure.
Current hook: "${post.hook}"
Current body: "${post.body}"
Current CTA: "${post.cta}"
Current hashtags: ${post.hashtags.join(", ")}
${postRewritePrompt.trim() ? `\nInstructions for rewrite: ${postRewritePrompt}` : "Make it more engaging, bolder, and more scroll-stopping."}
${source.trim() ? `\nSource/reference: "${source}"` : ""}
${input.trim() ? `\nOriginal source context:\n${input.slice(0, 500)}` : ""}

Return the same JSON structure with just the post object updated.`;
      const result = await callApi(prompt, context);
      if (result.post) setPost(result.post);
      setPostRewritePrompt("");
    } catch (e) {
      setError(`Rewrite failed: ${e.message}`);
    }
    setRewritingPost(false);
  }

  // Copy slide as image to clipboard
  const [copiedSlide, setCopiedSlide] = useState(false);
  async function copySlideToClipboard() {
    if (!hiddenSlideRef.current) return;
    try {
      const dataUrl = await toPng(hiddenSlideRef.current, {
        width: SS, height: SS, pixelRatio: 2, cacheBust: true,
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopiedSlide(true);
      setTimeout(() => setCopiedSlide(false), 2000);
    } catch {
      setError("Copy failed. Your browser may not support clipboard image write.");
    }
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
            <SlideInner s={slides[i]} brand={brand} i={i} n={slides.length} T={T} intensity={intensity} aspect={slideAspect} bgMode={slideBgMode} logoConfig={slideLogo} brandLogos={activeBrand?.logos} brandFonts={activeBrand?.fonts} brandBgImage={activeBrand?.backgroundImage} bgImageMode={bgImageMode} />
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

  // Ctrl+B to toggle **bold** on selected text in post textareas
  function handleBoldShortcut(e, field) {
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      if (start === end) return; // no selection
      const val = ta.value;
      const selected = val.slice(start, end);

      // Toggle: if already wrapped in **, remove them; otherwise add them
      const before = val.slice(0, start);
      const after = val.slice(end);
      const alreadyBold = before.endsWith("**") && after.startsWith("**");

      let newVal, newStart, newEnd;
      if (alreadyBold) {
        newVal = before.slice(0, -2) + selected + after.slice(2);
        newStart = start - 2;
        newEnd = end - 2;
      } else {
        newVal = before + "**" + selected + "**" + after;
        newStart = start + 2;
        newEnd = end + 2;
      }

      updatePostField(field, newVal);
      // Restore selection after React re-render
      requestAnimationFrame(() => {
        ta.selectionStart = newStart;
        ta.selectionEnd = newEnd;
      });
    }
  }

  // Raw post text with **bold** markers (for preview and char count)
  function postTextRaw() {
    if (!post) return "";
    let t = post.hook + "\n\n" + post.body + "\n\n" + post.cta;
    t += "\n\n" + post.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ");
    if (source.trim()) t += `\n\n💬 Source: ${source.trim()}`;
    return t;
  }

  // LinkedIn-ready text with Unicode bold (for clipboard)
  function postTextLinkedIn() {
    return formatForLinkedIn(postTextRaw());
  }

  function copyPost() {
    navigator.clipboard.writeText(postTextLinkedIn()).then(() => {
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

  function resetToNew() {
    setInput("");
    setSource("");
    setFiles([]);
    setSlides(null);
    setTitle("");
    setPost(null);
    setCur(0);
    setSpeakerData({ eventTitle: "", eventDate: "", cta: "", eventUrl: "", sessionTitle: "", extraText: "", tagLabel: "", speakers: [{ name: "", title: "", company: "", photo: null, photoUrl: "" }], style: {} });
    setActiveTab("slides");
    setError("");
    setPage("create");
  }

  const slide = slides?.[cur];
  const isSpeakerMode = contentType === "speaker";

  // Save to Library
  const [savingToLibrary, setSavingToLibrary] = useState(false);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const historyEnabled = userProfile?.profile?.historyEnabled !== false;

  async function saveToLibrary() {
    if (!user || savingToLibrary || !historyEnabled) return;
    setSavingToLibrary(true);
    try {
      // Save custom theme definition if using one
      const customThemeDef = customThemes[theme] || null;
      // Strip large base64 data from speaker photos to stay under Firestore 1MB limit
      let savedSpeakerData = undefined;
      if (isSpeakerMode && speakerData) {
        savedSpeakerData = {
          ...speakerData,
          eventLogo: speakerData.eventLogo?.startsWith?.("data:") ? null : speakerData.eventLogo,
          speakers: (speakerData.speakers || []).map((s) => ({
            ...s,
            photo: s.photo?.startsWith?.("data:") ? null : s.photo,
          })),
        };
      }
      // Firestore rejects undefined values — use null instead
      const payload = {
        title: title || speakerData?.eventTitle || "Untitled",
        slides: slides || [],
        post: post || null,
        contentType: contentType || "carousel",
        theme: theme || "Midnight Pro",
        brand: activeBrand || { name: brand || "" },
        intensity: intensity || "clean",
        slideAspect: slideAspect || "1:1",
        slideBgMode: slideBgMode || "default",
        tone: tone || "professional",
        audience: audience || "general",
        sc: sc || 7,
        input: input || "",
        source: source || "",
        speakerData: savedSpeakerData || null,
        customThemeDef: customThemeDef || null,
      };
      await saveCreation(user.uid, cleanForFirestore(payload));
      const updated = await getCreations(user.uid);
      setCreations(updated);
      setSavedToLibrary(true);
      setTimeout(() => setSavedToLibrary(false), 2500);
    } catch (e) {
      setError("Failed to save: " + e.message);
    }
    setSavingToLibrary(false);
  }

  async function saveAsCopy() {
    if (!user) return;
    const customThemeDef = customThemes[theme] || null;
    let copySpeakerData = null;
    if (isSpeakerMode && speakerData) {
      copySpeakerData = {
        ...speakerData,
        eventLogo: speakerData.eventLogo?.startsWith?.("data:") ? null : speakerData.eventLogo,
        speakers: (speakerData.speakers || []).map((s) => ({
          ...s,
          photo: s.photo?.startsWith?.("data:") ? null : s.photo,
        })),
      };
    }
    const copyPayload = {
      title: (title || speakerData?.eventTitle || "Untitled") + " (copy)",
      slides: slides || [],
      post: post || null,
      contentType: contentType || "carousel",
      theme: theme || "Midnight Pro",
      brand: activeBrand || { name: brand || "" },
      intensity: intensity || "clean",
      slideAspect: slideAspect || "1:1",
      slideBgMode: slideBgMode || "default",
      tone: tone || "professional",
      audience: audience || "general",
      sc: sc || 7,
      input: input || "",
      source: source || "",
      speakerData: copySpeakerData,
      customThemeDef: customThemeDef || null,
    };
    await saveCreation(user.uid, cleanForFirestore(copyPayload));
    const updated = await getCreations(user.uid);
    setCreations(updated);
  }
  const hasSpeakerContent = isSpeakerMode && !!(speakerData?.eventTitle?.trim());
  const hasSpeakerSpeakers = hasSpeakerContent && Array.isArray(speakerData?.speakers) && speakerData.speakers.some((s) => !!(s?.name?.trim()));
  const hasContent = isSpeakerMode ? hasSpeakerContent : (input.trim() || files.length > 0);
  const hasSlides = slides?.length > 0;
  const hasOutput = hasSlides || post || hasSpeakerContent;
  const isOutputStale = hasOutput && !isSpeakerMode && lastGenFingerprint && lastGenFingerprint !== genFingerprint();
  const showSlideControls = hasSlides && contentType !== "text-post" && !isSpeakerMode;

  // Generate button tooltip for missing fields
  function getMissingFieldsHint() {
    if (isSpeakerMode) return ""; // no generate button for speaker
    if (loading) return "";
    const missing = [];
    if (!apiKey) missing.push("API key");
    if (!input.trim() && !files.length) missing.push("source text or files");
    return missing.length ? `Missing: ${missing.join(", ")}` : "";
  }

  // Loading state
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#08090D", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Sparkles size={28} style={{ color: "#6B8AFF" }} />
        </motion.div>
      </div>
    );
  }

  // Landing page for unauthenticated users
  if (!user) {
    return <LandingPage onSignIn={handleSignIn} loading={false} />;
  }

  // Onboarding for new users
  if (needsOnboarding) {
    return <OnboardingFlow T={A} user={user} onComplete={handleOnboardingComplete} />;
  }

  // Main app
  return (
    <div
      style={{
        minHeight: "100vh",
        background: appBg,
        color: appText,
        fontFamily: "'Inter', sans-serif",
        transition: "background 0.4s, color 0.4s",
      }}
    >
      {/* Hidden render target for PNG export */}
      {slide && (
        <div style={{ position: "fixed", left: -9999, top: 0, zIndex: -1 }}>
          <div ref={hiddenSlideRef} style={{ width: SS, height: SS }}>
            <SlideInner s={slide} brand={brand} i={cur} n={slides.length} T={T} intensity={intensity} aspect={slideAspect} bgMode={slideBgMode} logoConfig={slideLogo} brandLogos={activeBrand?.logos} brandFonts={activeBrand?.fonts} brandBgImage={activeBrand?.backgroundImage} bgImageMode={bgImageMode} />
          </div>
        </div>
      )}

      {/* HEADER */}
      <header
        style={{
          borderBottom: `1px solid ${A.border}`,
          background: `${A.card}99`,
          boxShadow: "0 20px 40px rgba(229,226,225,0.06)",
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
            padding: "0 clamp(12px, 3vw, 20px)",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo size={34} rounded={9} />
            <div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
                ContentForge
              </div>
              <div className="cf-brand-sub" style={{ fontSize: 11, color: A.muted, lineHeight: 1.2 }}>
                LinkedIn Content Studio
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Nav buttons */}
            {user && (
              <>
                <NavBtn T={A} active={false} onClick={resetToNew}>
                  <FilePlus size={13} /> <span className="cf-nav-label">New</span>
                </NavBtn>
                <NavBtn T={A} active={page === "create"} onClick={() => setPage("create")}>
                  <Sparkles size={13} /> <span className="cf-nav-label">Create</span>
                </NavBtn>
                {historyEnabled && <NavBtn T={A} active={page === "history"} onClick={() => setPage("history")}>
                  <History size={13} /> <span className="cf-nav-label">Library</span>
                </NavBtn>}
                <NavBtn T={A} active={page === "settings"} onClick={() => setPage("settings")}>
                  <Settings size={13} />
                </NavBtn>
              </>
            )}
            {/* App dark/light toggle */}
            <button
              onClick={() => setAppMode(appMode === "dark" ? "light" : "dark")}
              title={appMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                background: "none", border: `1px solid ${A.border}`, borderRadius: 8,
                padding: "6px 8px", cursor: "pointer", color: A.muted, display: "flex",
                alignItems: "center", transition: "all 0.2s",
              }}
            >
              {appMode === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            {!user && !apiKey && (
              <button
                onClick={() => setShowApiInput(!showApiInput)}
                style={headerBtnStyle(T, false)}
              >
                <Zap size={13} /> API Key
              </button>
            )}
            {/* Auth */}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt=""
                    style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${A.border}` }}
                    referrerPolicy="no-referrer"
                  />
                )}
                <button onClick={logOut} style={headerBtnStyle(T, false)} title="Sign out">
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={async () => {
                  try { await signInWithGoogle(); } catch (e) { setError(e.message); }
                }}
                style={headerBtnStyle(T, true)}
              >
                <LogIn size={13} /> Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* API Key drawer */}
      <AnimatePresence>
        {showApiInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden", borderBottom: `1px solid ${A.border}`, background: A.card }}
          >
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <Zap size={16} style={{ color: A.accent, flexShrink: 0 }} />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-... (stored locally only)"
                style={{ flex: 1, background: A.bg, color: A.text, border: `1px solid ${A.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}
              />
              <button
                onClick={() => { saveApiKey(apiKey); setShowApiInput(false); }}
                style={{ background: A.accent, color: ct, border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(16px, 3vw, 24px) clamp(12px, 3vw, 20px) 80px" }}>

        {/* Settings Page */}
        {page === "settings" && user && (
          <SettingsPanel
            T={A}
            user={user}
            profile={userProfile?.profile}
            apiKey={apiKey}
            onSave={async (profileData) => {
              await updateUserProfile(user.uid, { profile: profileData });
              setUserProfile((prev) => ({ ...prev, profile: profileData }));
              // Apply default brand if changed
              const defBrand = profileData.brands?.find((b) => b.isDefault);
              if (defBrand) {
                setActiveBrand(defBrand);
                if (defBrand.voice?.tone) setTone(defBrand.voice.tone);
                if (defBrand.voice?.audience) setAudience(defBrand.voice.audience);
                if (brandAccent(defBrand)) {
                  const variants = makeCustomVariants(brandAccent(defBrand));
                  if (variants) {
                    const themeName = `brand-${defBrand.id}`;
                    setCustomThemes((prev) => ({ ...prev, [themeName]: variants }));
                    setTheme(themeName);
                  }
                }
              }
            }}
            onApiKeySave={async (key) => {
              setApiKey(key);
              saveApiKey(key);
              if (user) await saveApiKeyToFirebase(user.uid, key);
            }}
          />
        )}

        {/* History Page */}
        {page === "history" && user && (
          <HistoryPanel
            T={A}
            creations={creations}
            loading={loadingHistory}
            onLoad={(c) => {
              // Restore custom theme if saved with creation
              if (c.customThemeDef && c.theme) {
                setCustomThemes((prev) => ({ ...prev, [c.theme]: c.customThemeDef }));
              }
              // Clear left panel state
              setInput(c.input || "");
              setSource(c.source || "");
              setFiles(c.files || []);
              // Restore all settings
              setSlides(c.slides?.length ? c.slides : null);
              setTitle(c.title || "");
              setPost(c.post || null);
              setContentType(c.contentType || "carousel");
              // appMode is a user preference, not restored from creations
              if (c.theme) setTheme(c.theme);
              // Restore brand (object or legacy string)
              if (c.brand && typeof c.brand === "object") setActiveBrand(c.brand);
              else if (c.brand) setActiveBrand({ name: c.brand });
              else setActiveBrand(null);
              setIntensity(c.intensity || "clean");
              setSlideAspect(c.slideAspect || "1:1");
              setSlideBgMode(c.slideBgMode || "default");
              setTone(c.tone || "professional");
              setAudience(c.audience || "general");
              setSc(c.sc || 7);
              if (c.speakerData) setSpeakerData(c.speakerData);
              else setSpeakerData({ eventTitle: "", eventDate: "", cta: "", eventUrl: "", speakers: [{ name: "", title: "", company: "", photo: null, photoUrl: "" }] });
              setCur(0);
              setActiveTab(c.contentType === "speaker" ? "slides" : c.slides?.length ? "slides" : "post");
              setLastGenFingerprint(genFingerprint());
              setPage("create");
            }}
            onDelete={async (id) => {
              await deleteCreation(user.uid, id);
              setCreations((prev) => prev.filter((c) => c.id !== id));
            }}
          />
        )}

        {/* Create Page */}
        {page === "create" && <div
          className="cf-main-grid"
          style={{
            display: "grid",
            gridTemplateColumns: hasOutput ? "minmax(0,420px) minmax(0,1fr)" : "minmax(0,600px)",
            gap: "clamp(16px, 3vw, 32px)",
            alignItems: "start",
            justifyContent: "center",
          }}
        >
          {/* ─── LEFT PANEL ─── */}
          <div className="cf-left-panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Hero */}
            {!hasOutput && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 8 }}>
                <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 8, letterSpacing: "-0.02em" }}>
                  Create content that<span className="text-gradient-ai" style={{ background: "linear-gradient(135deg, #0077B5, #571BC1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}> stops the scroll</span>
                </h1>
                <p style={{ color: A.muted, fontSize: 15, lineHeight: 1.6, maxWidth: 480 }}>
                  Transform any text, article, or document into stunning LinkedIn carousels, quote cards, stat cards, and post copy with AI. Ready to publish in seconds.
                </p>
              </motion.div>
            )}

            {/* Content Type Selector */}
            <div>
              <label style={labelStyle(A)}>
                <Layers size={12} /> Content Type
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {CONTENT_TYPES.map((ct) => (
                  <button
                    key={ct.id}
                    onClick={() => setContentType(ct.id)}
                    style={{
                      background: contentType === ct.id ? A.soft : "transparent",
                      border: `1.5px solid ${contentType === ct.id ? A.accent : A.border}`,
                      borderRadius: 10,
                      padding: "10px 6px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      transition: "all 0.2s",
                      color: contentType === ct.id ? A.accent : A.muted,
                    }}
                  >
                    <ct.icon size={16} />
                    <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2, textAlign: "center" }}>{ct.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div>
              <label style={labelStyle(A)}>Brand</label>
              <select
                value={(() => {
                  if (!activeBrand?.id) return "_custom";
                  const brands = userProfile?.profile?.brands || [];
                  if (brands.some((b) => b.id === activeBrand.id)) return activeBrand.id;
                  return "_custom";
                })()}
                onChange={(e) => {
                  if (e.target.value === "_custom") {
                    setActiveBrand({ name: "" });
                    return;
                  }
                  const brands = userProfile?.profile?.brands || [];
                  const selected = brands.find((b) => b.id === e.target.value);
                  if (selected) {
                    setActiveBrand(selected);
                    if (selected.voice?.tone) setTone(selected.voice.tone);
                    if (selected.voice?.audience) setAudience(selected.voice.audience);
                    if (brandAccent(selected)) {
                      const variants = makeCustomVariants(brandAccent(selected));
                      if (variants) {
                        const themeName = `brand-${selected.id}`;
                        setCustomThemes((prev) => ({ ...prev, [themeName]: variants }));
                        setTheme(themeName);
                      }
                    }
                  }
                }}
                style={selectStyle(A)}
              >
                <option value="_custom">Custom</option>
                {(userProfile?.profile?.brands || []).map((b) => (
                  <option key={b.id} value={b.id}>{b.name}{b.isDefault ? " ★" : ""}</option>
                ))}
              </select>
            </div>

            {/* Design — collapsible */}
            {contentType !== "speaker" && contentType !== "text-post" && (
              <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 12, overflow: "hidden" }}>
                <button
                  onClick={() => setShowDesign((p) => !p)}
                  style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", color: A.text, fontFamily: "'Inter', sans-serif" }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    <Palette size={12} style={{ marginRight: 6, verticalAlign: -2 }} />
                    Design
                    <span style={{ fontWeight: 400, color: A.muted, marginLeft: 8, fontSize: 11 }}>
                      {intensity} · {slideAspect} · {slideBgMode}
                    </span>
                  </span>
                  <ChevronDown size={14} style={{ color: A.muted, transform: showDesign ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {showDesign && (
                  <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Preset swatches */}
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {Object.entries(allPresets).filter(([name]) => !name.startsWith("brand-") && !name.startsWith("Custom #")).map(([name, t]) => (
                        <button key={name} onClick={() => setTheme(name)} title={name} style={{ width: 26, height: 26, borderRadius: 7, border: `2px solid ${name === theme ? t.accent : "transparent"}`, background: t.card, cursor: "pointer", position: "relative", overflow: "hidden", padding: 0, transition: "all 0.2s" }}>
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: t.accent }} />
                        </button>
                      ))}
                      {/* Brand colors inline */}
                      {activeBrand?.colors && activeBrand.id && Object.entries(activeBrand.colors).filter(([_, v]) => v?.startsWith?.("#")).map(([key, color]) => (
                        <button key={key} onClick={() => { const v = makeCustomVariants(color); if (v) { setCustomThemes((p) => ({ ...p, [`brand-${activeBrand.id}-${key}`]: v })); setTheme(`brand-${activeBrand.id}-${key}`); } }} title={`${key}: ${color}`} style={{ width: 26, height: 26, borderRadius: 7, border: "2px solid transparent", background: color, cursor: "pointer", padding: 0 }} />
                      ))}
                    </div>
                    {/* Style + Size + Bg in compact rows */}
                    <div style={{ display: "flex", gap: 4 }}>
                      {["clean", "bold", "dramatic"].map((v) => (
                        <button key={v} onClick={() => setIntensity(v)} style={{ flex: 1, padding: "6px 4px", borderRadius: 6, fontSize: 10, fontWeight: 700, border: `1px solid ${intensity === v ? A.accent : A.border}`, background: intensity === v ? A.soft : "transparent", color: intensity === v ? A.accent : A.muted, cursor: "pointer", textTransform: "capitalize", fontFamily: "'Inter', sans-serif" }}>{v}</button>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div style={{ display: "flex", gap: 3 }}>
                        {["1:1", "4:5", "16:9"].map((a) => (
                          <button key={a} onClick={() => setSlideAspect(a)} style={{ flex: 1, padding: "5px 2px", borderRadius: 5, fontSize: 10, fontWeight: 600, border: `1px solid ${slideAspect === a ? A.accent : A.border}`, background: slideAspect === a ? A.soft : "transparent", color: slideAspect === a ? A.accent : A.muted, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>{a}</button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 3 }}>
                        {[{ id: "default", l: "Dark" }, { id: "light", l: "Light" }, { id: "invert", l: "Invert" }].map((m) => (
                          <button key={m.id} onClick={() => setSlideBgMode(m.id)} style={{ flex: 1, padding: "5px 2px", borderRadius: 5, fontSize: 10, fontWeight: 600, border: `1px solid ${slideBgMode === m.id ? A.accent : A.border}`, background: slideBgMode === m.id ? A.soft : "transparent", color: slideBgMode === m.id ? A.accent : A.muted, cursor: "pointer", fontFamily: "'Inter', sans-serif", textAlign: "center" }}>{m.l}</button>
                        ))}
                      </div>
                    </div>
                    {/* Logo + Slides count */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      {contentType === "carousel" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 10, color: A.muted }}>Slides:</span>
                          <select value={sc} onChange={(e) => setSc(Number(e.target.value))} style={{ ...selectStyle(A), width: 52, padding: "4px 6px", fontSize: 12 }}>
                            {[5, 6, 7, 8, 9, 10].map((n) => <option key={n}>{n}</option>)}
                          </select>
                        </div>
                      )}
                      {activeBrand?.logos && (activeBrand.logos.light || activeBrand.logos.dark) && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 10, color: A.muted }}>Logo:</span>
                          {["none", "all", "first", "last"].map((o) => (
                            <button key={o} onClick={() => setSlideLogo((p) => ({ ...p, show: o }))} style={{ padding: "3px 6px", borderRadius: 4, fontSize: 9, fontWeight: 600, border: `1px solid ${(slideLogo?.show || "none") === o ? A.accent : A.border}`, background: (slideLogo?.show || "none") === o ? A.soft : "transparent", color: (slideLogo?.show || "none") === o ? A.accent : A.muted, cursor: "pointer", textTransform: "capitalize" }}>{o}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* BG image mode */}
                    {activeBrand?.backgroundImage && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 10, color: A.muted, flexShrink: 0 }}>BG Image:</span>
                        {["off", "subtle", "strong"].map((m) => (
                          <button key={m} onClick={() => setBgImageMode(m)} style={{
                            padding: "3px 8px", borderRadius: 4, fontSize: 9, fontWeight: 600, textTransform: "capitalize",
                            border: `1px solid ${bgImageMode === m ? A.accent : A.border}`,
                            background: bgImageMode === m ? A.soft : "transparent",
                            color: bgImageMode === m ? A.accent : A.muted,
                            cursor: "pointer",
                          }}>{m}</button>
                        ))}
                      </div>
                    )}
                    {/* Global slide label */}
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: A.muted, flexShrink: 0 }}>Label:</span>
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setActiveBrand((prev) => ({ ...(prev || {}), name: e.target.value }))}
                        placeholder="Text on all slides (optional)"
                        style={{ ...inputStyle(A), padding: "4px 8px", fontSize: 11, flex: 1 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Source — not for speaker mode */}
            {!isSpeakerMode && (
              <div>
                <label style={labelStyle(A)}><MessageSquare size={12} /> Source (first comment)</label>
                <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. CIO.com — 6 Innovation Curves" style={inputStyle(A)} />
              </div>
            )}

            {/* File Upload */}
            {contentType !== "text-post" && !isSpeakerMode && (
              <div>
                <label style={labelStyle(A)}><Upload size={12} /> Upload Files <span style={{ opacity: 0.5, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(max 4)</span></label>
                <div
                  onClick={() => fileRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
                  style={{
                    border: `1.5px dashed ${drag ? A.accent : A.border}`, borderRadius: 12, padding: "20px 16px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer",
                    transition: "all 0.2s", background: drag ? A.soft : "transparent", textAlign: "center",
                  }}
                >
                  <input ref={fileRef} type="file" accept=".pdf,image/*" multiple style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
                  <Upload size={20} style={{ color: A.muted, opacity: 0.6 }} />
                  <span style={{ fontSize: 13, color: A.muted }}>Drop files or tap to browse</span>
                  <span style={{ fontSize: 11, color: A.muted, opacity: 0.5 }}>PDF, JPG, PNG, WEBP</span>
                </div>
                {files.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {files.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: A.soft, border: `1px solid ${A.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, color: A.text }}>
                        {f.type === "application/pdf" ? <FileText size={13} style={{ color: A.accent }} /> : <ImageIcon size={13} style={{ color: A.accent }} />}
                        <span style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); setFiles((p) => p.filter((_, j) => j !== i)); }} style={{ background: "none", border: "none", color: A.muted, cursor: "pointer", padding: 0, display: "flex" }}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Speaker Inputs */}
            {contentType === "speaker" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ ...labelStyle(A), marginBottom: 4 }}>Event Title</label>
                    <input type="text" value={speakerData.eventTitle} onChange={(e) => setSpeakerData((p) => ({ ...p, eventTitle: e.target.value }))} placeholder="e.g. AI in Finance Summit 2026" style={inputStyle(A)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ ...labelStyle(A), marginBottom: 4 }}>Date</label>
                      <input type="text" value={speakerData.eventDate || ""} onChange={(e) => setSpeakerData((p) => ({ ...p, eventDate: e.target.value }))} placeholder="March 28, 2026" style={inputStyle(A)} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle(A), marginBottom: 4 }}>CTA</label>
                      <input type="text" value={speakerData.cta || ""} onChange={(e) => setSpeakerData((p) => ({ ...p, cta: e.target.value }))} placeholder="Register now" style={inputStyle(A)} />
                    </div>
                  </div>
                  <div>
                    <label style={{ ...labelStyle(A), marginBottom: 4 }}><Globe size={12} /> Event URL (for branding)</label>
                    <input type="text" value={speakerData.eventUrl || ""} onChange={(e) => setSpeakerData((p) => ({ ...p, eventUrl: e.target.value }))} placeholder="https://event-website.com" style={inputStyle(A)} />
                  </div>
                  <div>
                    <label style={{ ...labelStyle(A), marginBottom: 4 }}>Event Logo (URL or upload)</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="text"
                        value={speakerData.eventLogoUrl || ""}
                        onChange={(e) => setSpeakerData((p) => ({ ...p, eventLogoUrl: e.target.value, eventLogo: e.target.value || p.eventLogo }))}
                        placeholder="https://... logo image URL"
                        style={{ ...inputStyle(A), flex: 1, fontSize: 12 }}
                      />
                      <label style={{ background: A.soft, border: `1px solid ${A.border}`, borderRadius: 10, padding: "0 12px", cursor: "pointer", display: "flex", alignItems: "center", color: A.muted, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", height: 38 }}>
                        <Upload size={12} style={{ marginRight: 4 }} /> File
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => setSpeakerData((p) => ({ ...p, eventLogo: reader.result, eventLogoUrl: "" }));
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                    {speakerData.eventLogo && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                        <div style={{ background: speakerData.logoDarkBg ? "#1a1a2e" : "transparent", borderRadius: 6, padding: speakerData.logoDarkBg ? "4px 8px" : 0 }}>
                          <img src={speakerData.eventLogo} alt="" style={{ height: 24, maxWidth: 80, objectFit: "contain", borderRadius: 4, display: "block" }} />
                        </div>
                        <button
                          onClick={() => setSpeakerData((p) => ({ ...p, logoDarkBg: !p.logoDarkBg }))}
                          style={{
                            background: speakerData.logoDarkBg ? A.accent : A.soft,
                            border: `1px solid ${speakerData.logoDarkBg ? A.accent : A.border}`,
                            borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 600,
                            color: speakerData.logoDarkBg ? contrastText(A.accent) : A.muted,
                            cursor: "pointer", fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          Dark bg
                        </button>
                        <button onClick={() => setSpeakerData((p) => ({ ...p, eventLogo: null, eventLogoUrl: "", logoDarkBg: false }))} style={{ background: "none", border: "none", color: A.muted, cursor: "pointer", padding: 0, fontSize: 11 }}>Remove</button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ ...labelStyle(A), marginBottom: 4 }}>Session / Talk Title (optional)</label>
                    <input type="text" value={speakerData.sessionTitle || ""} onChange={(e) => setSpeakerData((p) => ({ ...p, sessionTitle: e.target.value }))} placeholder="e.g. The Future of AI in Banking" style={inputStyle(A)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={{ ...labelStyle(A), marginBottom: 4 }}>Registration URL</label>
                      <input type="text" value={speakerData.regUrl || ""} onChange={(e) => setSpeakerData((p) => ({ ...p, regUrl: e.target.value }))} placeholder="https://event.com/register" style={inputStyle(A)} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle(A), marginBottom: 4 }}>Tag Label</label>
                      <input type="text" value={speakerData.tagLabel || ""} onChange={(e) => setSpeakerData((p) => ({ ...p, tagLabel: e.target.value }))} placeholder="Speaker / Panelist / Keynote" style={inputStyle(A)} />
                    </div>
                  </div>
                  <div>
                    <label style={{ ...labelStyle(A), marginBottom: 4 }}>Extra Text (shown below speakers)</label>
                    <input type="text" value={speakerData.extraText || ""} onChange={(e) => setSpeakerData((p) => ({ ...p, extraText: e.target.value }))} placeholder="e.g. Free entry · Limited seats · Online + In-person" style={inputStyle(A)} />
                  </div>
                </div>

                {/* Speakers */}
                {(speakerData.speakers || []).map((speaker, si) => (
                  <div key={si} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: A.accent }}>Speaker {si + 1}</span>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        {si > 0 && (
                          <button onClick={() => setSpeakerData((p) => { const s = [...p.speakers]; [s[si-1], s[si]] = [s[si], s[si-1]]; return { ...p, speakers: s }; })} style={{ background: "none", border: `1px solid ${A.border}`, borderRadius: 4, color: A.muted, cursor: "pointer", padding: "2px 5px", fontSize: 10 }} title="Move up">
                            &#9650;
                          </button>
                        )}
                        {si < (speakerData.speakers || []).length - 1 && (
                          <button onClick={() => setSpeakerData((p) => { const s = [...p.speakers]; [s[si], s[si+1]] = [s[si+1], s[si]]; return { ...p, speakers: s }; })} style={{ background: "none", border: `1px solid ${A.border}`, borderRadius: 4, color: A.muted, cursor: "pointer", padding: "2px 5px", fontSize: 10 }} title="Move down">
                            &#9660;
                          </button>
                        )}
                        {(speakerData.speakers || []).length > 1 && (
                          <button onClick={() => setSpeakerData((p) => ({ ...p, speakers: p.speakers.filter((_, j) => j !== si) }))} style={{ background: "none", border: "none", color: A.muted, cursor: "pointer", padding: 0 }}>
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <input type="text" value={speaker.name} onChange={(e) => { const s = [...speakerData.speakers]; s[si] = { ...s[si], name: e.target.value }; setSpeakerData((p) => ({ ...p, speakers: s })); }} placeholder="Full name" style={inputStyle(A)} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <input type="text" value={speaker.title} onChange={(e) => { const s = [...speakerData.speakers]; s[si] = { ...s[si], title: e.target.value }; setSpeakerData((p) => ({ ...p, speakers: s })); }} placeholder="Title / Role" style={inputStyle(A)} />
                      <input type="text" value={speaker.company} onChange={(e) => { const s = [...speakerData.speakers]; s[si] = { ...s[si], company: e.target.value }; setSpeakerData((p) => ({ ...p, speakers: s })); }} placeholder="Company" style={inputStyle(A)} />
                    </div>
                    <div>
                      <label style={{ ...labelStyle(A), marginBottom: 4 }}>Photo (URL or upload)</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          value={speaker.photoUrl || ""}
                          onChange={(e) => {
                            const s = [...speakerData.speakers];
                            s[si] = { ...s[si], photoUrl: e.target.value, photo: e.target.value || s[si].photo };
                            setSpeakerData((p) => ({ ...p, speakers: s }));
                          }}
                          placeholder="https://... or paste image URL"
                          style={{ ...inputStyle(A), flex: 1, fontSize: 12 }}
                        />
                        <label style={{ background: A.soft, border: `1px solid ${A.border}`, borderRadius: 10, padding: "0 12px", cursor: "pointer", display: "flex", alignItems: "center", color: A.muted, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                          <Upload size={12} style={{ marginRight: 4 }} /> File
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                const s = [...speakerData.speakers];
                                s[si] = { ...s[si], photo: reader.result, photoUrl: "" };
                                setSpeakerData((p) => ({ ...p, speakers: s }));
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>
                      {speaker.photo && (
                        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                          <img src={speaker.photo} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: `2px solid ${A.accent}` }} />
                          <span style={{ fontSize: 11, color: A.muted }}>Photo set</span>
                          <button onClick={() => { const s = [...speakerData.speakers]; s[si] = { ...s[si], photo: null, photoUrl: "" }; setSpeakerData((p) => ({ ...p, speakers: s })); }} style={{ background: "none", border: "none", color: A.muted, cursor: "pointer", padding: 0, fontSize: 11 }}>Remove</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {(speakerData.speakers || []).length < 3 && (
                  <button
                    onClick={() => setSpeakerData((p) => ({ ...p, speakers: [...p.speakers, { name: "", title: "", company: "", photo: null }] }))}
                    style={{ background: A.soft, border: `1px solid ${A.border}`, borderRadius: 10, padding: "10px", cursor: "pointer", color: A.accent, fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                  >
                    <UserCircle size={14} /> Add Speaker ({(speakerData.speakers || []).length}/3)
                  </button>
                )}
              </div>
            )}

            {/* Text Input */}
            {contentType !== "speaker" && <div>
              <label style={labelStyle(A)}>
                <PenLine size={12} /> Source Text
                {files.length > 0 && <span style={{ opacity: 0.5, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}> (optional with files)</span>}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your report, transcript, article, or notes..."
                rows={hasOutput ? 5 : 8}
                style={{
                  width: "100%", background: A.card, color: A.text, border: `1px solid ${A.border}`,
                  borderRadius: 12, padding: 14, fontFamily: "'Inter', sans-serif", fontSize: 14,
                  lineHeight: 1.65, resize: "vertical", transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = A.accent)}
                onBlur={(e) => (e.target.style.borderColor = A.border)}
              />
              {input.length > 0 && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: A.muted, opacity: 0.6 }}>{input.length.toLocaleString()} chars</span>
                </div>
              )}
            </div>}

            {/* Generation instructions */}
            {!isSpeakerMode && (
              <div>
                <label style={labelStyle(A)}>
                  <Sparkles size={12} /> Instructions for AI
                  <span style={{ opacity: 0.5, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}> (optional)</span>
                </label>
                <input
                  type="text"
                  value={genInstructions}
                  onChange={(e) => setGenInstructions(e.target.value)}
                  placeholder="e.g. focus on ROI data, make it provocative, add a personal story..."
                  style={inputStyle(A)}
                />
              </div>
            )}

            {/* Generate button — hidden for speaker mode (live preview) */}
            {!isSpeakerMode && (
              <div style={{ position: "relative" }}>
                <motion.button
                  whileHover={hasContent ? { scale: 1.01, y: -1 } : {}}
                  whileTap={hasContent ? { scale: 0.99 } : {}}
                  onClick={generate}
                  disabled={loading || !hasContent}
                  title={getMissingFieldsHint()}
                  style={{
                    background: loading ? A.card : A.gradient || A.accent,
                    color: loading ? A.muted : contrastText(A.accent),
                    border: loading ? `1px solid ${A.border}` : "none",
                    borderRadius: 14, padding: "16px 24px", fontFamily: "'Inter', sans-serif",
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
                {!hasContent && !loading && (
                  <p style={{ fontSize: 11, color: A.muted, marginTop: 6, textAlign: "center", opacity: 0.7 }}>
                    {!apiKey ? "Add your API key in Settings to generate content." : "Paste text or upload a file to get started."}
                  </p>
                )}
              </div>
            )}

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
              className="cf-right-panel"
              ref={rightRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* Tab bar — hidden for speaker mode */}
              {!isSpeakerMode && (
                <div style={{ display: "flex", background: A.card, borderRadius: 12, padding: 4, border: `1px solid ${A.border}` }}>
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
                          background: activeTab === tab.id ? A.soft : "transparent",
                          color: activeTab === tab.id ? A.accent : A.muted,
                          fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s",
                        }}
                      >
                        <tab.icon size={14} />
                        {tab.label}
                      </button>
                    ))}
                </div>
              )}

              {/* Speaker mode header */}
              {isSpeakerMode && hasSpeakerContent && (
                <div style={{ fontSize: 12, color: A.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Live Preview
                </div>
              )}

              {/* Title — non-speaker modes */}
              {!isSpeakerMode && title && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: A.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                    {title}
                  </span>
                  {showSlideControls && (
                    <span style={{ fontSize: 12, color: A.accent, fontWeight: 600, flexShrink: 0 }}>
                      {cur + 1} / {slides.length}
                    </span>
                  )}
                </div>
              )}

              {/* Stale output indicator */}
              {isOutputStale && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 10,
                    background: `rgba(${A.accent === "#0077b5" ? "0,119,181" : "124,92,252"},0.08)`,
                    border: `1px solid ${A.accent}33`,
                  }}
                >
                  <span style={{ fontSize: 12, color: A.accent, fontWeight: 600 }}>
                    Inputs changed — regenerate to update
                  </span>
                  <button
                    onClick={generate}
                    disabled={loading}
                    style={{
                      background: A.accent, color: "#fff", border: "none", borderRadius: 8,
                      padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                      fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 5,
                    }}
                  >
                    <Sparkles size={12} /> Regenerate
                  </button>
                </motion.div>
              )}

              {/* Save to Library — always visible when logged in + has output */}
              {user && historyEnabled && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={saveToLibrary}
                    disabled={savingToLibrary}
                    style={{
                      ...exportBtnStyle(A),
                      flex: 1,
                      background: savedToLibrary ? "#22c55e" : A.soft,
                      color: savedToLibrary ? "#fff" : A.accent,
                      borderColor: savedToLibrary ? "#22c55e" : A.border,
                    }}
                  >
                    {savingToLibrary ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> :
                     savedToLibrary ? <Check size={14} /> : <Save size={14} />}
                    {savingToLibrary ? "Saving..." : savedToLibrary ? "Saved!" : "Save to Library"}
                  </button>
                </div>
              )}

              {/* ── SPEAKER PREVIEW ── */}
              {contentType === "speaker" && hasSpeakerContent && (
                <>
                  <ScaledSpeakerSlide data={speakerData} T={T} brand={brand} size={cardPx} />
                  {/* Export */}
                  <div ref={slideContainerRef}>
                    <div style={{ position: "fixed", left: -9999, top: 0, zIndex: -1 }}>
                      <div ref={hiddenSlideRef} style={{ width: (SPEAKER_ASPECTS[speakerData?.style?.aspect] || SPEAKER_ASPECTS["1:1"]).w, height: (SPEAKER_ASPECTS[speakerData?.style?.aspect] || SPEAKER_ASPECTS["1:1"]).h }}>
                        <SpeakerSlideInner data={speakerData} T={T} brand={brand} />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={copySlideToClipboard}
                    style={{
                      ...exportBtnStyle(A),
                      background: copiedSlide ? A.accent : "transparent",
                      color: copiedSlide ? contrastText(A.accent) : A.text,
                      borderColor: copiedSlide ? A.accent : A.border,
                    }}
                  >
                    {copiedSlide ? <Check size={14} /> : <ClipboardCopy size={14} />}
                    {copiedSlide ? "Copied to clipboard!" : "Copy to clipboard"}
                  </button>
                  {/* Style customization */}
                  <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: A.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Customize</span>
                    {/* Layout */}
                    <div style={{ display: "flex", gap: 6 }}>
                      {Object.entries(SPEAKER_LAYOUTS).map(([id, label]) => (
                        <button
                          key={id}
                          onClick={() => setSpeakerData((p) => ({ ...p, style: { ...p.style, layout: id } }))}
                          style={{
                            flex: 1, padding: "7px 4px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                            border: `1px solid ${(speakerData.style?.layout || "classic") === id ? A.accent : A.border}`,
                            background: (speakerData.style?.layout || "classic") === id ? A.soft : "transparent",
                            color: (speakerData.style?.layout || "classic") === id ? A.accent : A.muted,
                            cursor: "pointer", fontFamily: "'Inter', sans-serif", textAlign: "center",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {/* CTA color + Photo shape */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 600, color: A.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, display: "block" }}>CTA Color</label>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input
                            type="color"
                            value={speakerData.style?.ctaColor || A.accent}
                            onChange={(e) => setSpeakerData((p) => ({ ...p, style: { ...p.style, ctaColor: e.target.value } }))}
                            style={{ width: 32, height: 32, border: "none", borderRadius: 6, cursor: "pointer", padding: 0, background: "transparent" }}
                          />
                          <input
                            type="text"
                            value={speakerData.style?.ctaColor || A.accent}
                            onChange={(e) => setSpeakerData((p) => ({ ...p, style: { ...p.style, ctaColor: e.target.value } }))}
                            style={{ ...inputStyle(A), fontSize: 12, fontFamily: "'JetBrains Mono', monospace", flex: 1 }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 600, color: A.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, display: "block" }}>Photo Shape</label>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[
                            { id: "circle", label: "O" },
                            { id: "rounded", label: "▢" },
                            { id: "square", label: "□" },
                          ].map((s) => (
                            <button
                              key={s.id}
                              onClick={() => setSpeakerData((p) => ({ ...p, style: { ...p.style, photoShape: s.id } }))}
                              style={{
                                flex: 1, padding: "8px 0", borderRadius: 6, fontSize: 14,
                                border: `1px solid ${(speakerData.style?.photoShape || "circle") === s.id ? A.accent : A.border}`,
                                background: (speakerData.style?.photoShape || "circle") === s.id ? A.soft : "transparent",
                                color: (speakerData.style?.photoShape || "circle") === s.id ? A.accent : A.muted,
                                cursor: "pointer", textAlign: "center",
                              }}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Aspect ratio */}
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 600, color: A.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, display: "block" }}>Size</label>
                      <div style={{ display: "flex", gap: 4 }}>
                        {Object.keys(SPEAKER_ASPECTS).map((a) => (
                          <button
                            key={a}
                            onClick={() => setSpeakerData((p) => ({ ...p, style: { ...p.style, aspect: a } }))}
                            style={{
                              flex: 1, padding: "7px 4px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                              border: `1px solid ${(speakerData.style?.aspect || "1:1") === a ? A.accent : A.border}`,
                              background: (speakerData.style?.aspect || "1:1") === a ? A.soft : "transparent",
                              color: (speakerData.style?.aspect || "1:1") === a ? A.accent : A.muted,
                              cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", textAlign: "center",
                            }}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Background mode */}
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 600, color: A.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, display: "block" }}>Background</label>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[
                          { id: "dark", label: "Dark", icon: "🌙" },
                          { id: "light", label: "Light", icon: "☀" },
                          { id: "invert", label: "Invert", icon: "◑" },
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSpeakerData((p) => ({ ...p, style: { ...p.style, bgMode: m.id } }))}
                            style={{
                              flex: 1, padding: "7px 4px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                              border: `1px solid ${(speakerData.style?.bgMode || "dark") === m.id ? A.accent : A.border}`,
                              background: (speakerData.style?.bgMode || "dark") === m.id ? A.soft : "transparent",
                              color: (speakerData.style?.bgMode || "dark") === m.id ? A.accent : A.muted,
                              cursor: "pointer", textAlign: "center", fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {m.icon} {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Element visibility */}
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 600, color: A.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, display: "block" }}>Show / Hide</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {[
                          { id: "showTag", label: "Tag" },
                          { id: "showDate", label: "Date" },
                          { id: "showSession", label: "Session" },
                          { id: "showCta", label: "CTA" },
                          { id: "showBrand", label: "Brand" },
                          { id: "showRegUrl", label: "URL" },
                        ].map((el) => {
                          const isOn = speakerData.style?.[el.id] !== false;
                          return (
                            <button
                              key={el.id}
                              onClick={() => setSpeakerData((p) => ({ ...p, style: { ...p.style, [el.id]: !isOn } }))}
                              style={{
                                padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                                border: `1px solid ${isOn ? A.accent : A.border}`,
                                background: isOn ? A.soft : "transparent",
                                color: isOn ? A.accent : A.muted,
                                cursor: "pointer", fontFamily: "'Inter', sans-serif",
                                opacity: isOn ? 1 : 0.5,
                              }}
                            >
                              {el.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button onClick={exportCurrentPng} disabled={exportingPng} style={exportBtnStyle(A)}>
                      {exportingPng ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <ImageDown size={14} />}
                      {exportingPng ? "..." : "Download PNG"}
                    </button>
                    {user && (
                      <button onClick={saveToLibrary} disabled={savingToLibrary || !historyEnabled} style={exportBtnStyle(A)} title={!historyEnabled ? "Enable Cloud History in Settings to save" : ""}>
                        {savingToLibrary ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
                        {savedToLibrary ? "Saved!" : "Save to Library"}
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* ── SLIDES TAB ── */}
              {activeTab === "slides" && showSlideControls && slide && (
                <>
                  <div ref={slideContainerRef} style={{ position: "relative" }}>
                    <AnimatePresence mode="wait">
                      <motion.div key={cur} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }}>
                        <ScaledSlide s={slide} brand={brand} i={cur} n={slides.length} T={T} size={cardPx} intensity={intensity} aspect={slideAspect} bgMode={slideBgMode} logoConfig={slideLogo} brandLogos={activeBrand?.logos} brandFonts={activeBrand?.fonts} brandBgImage={activeBrand?.backgroundImage} bgImageMode={bgImageMode} />
                      </motion.div>
                    </AnimatePresence>
                    {cur > 0 && <button onClick={() => setCur((c) => c - 1)} style={navBtnStyle(T, "left")}><ChevronLeft size={20} /></button>}
                    {cur < slides.length - 1 && <button onClick={() => setCur((c) => c + 1)} style={navBtnStyle(T, "right")}><ChevronRight size={20} /></button>}
                  </div>

                  {/* Dots */}
                  <div style={{ display: "flex", gap: 5, alignItems: "center", justifyContent: "center" }}>
                    {slides.map((_, i) => (
                      <button key={i} onClick={() => setCur(i)} style={{ width: i === cur ? 24 : 8, height: 8, borderRadius: 4, background: i === cur ? A.accent : A.muted, opacity: i === cur ? 1 : 0.25, transition: "all 0.3s", cursor: "pointer", border: "none", padding: 0 }} />
                    ))}
                  </div>

                  {/* Thumbnails */}
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(slides.length, 5)}, 1fr)`, gap: 6 }}>
                    {slides.map((s, i) => (
                      <button
                        key={i} onClick={() => setCur(i)}
                        style={{
                          background: A.card, border: `1.5px solid ${i === cur ? A.accent : A.border}`, borderRadius: 10,
                          padding: "8px 7px", cursor: "pointer", transition: "all 0.2s", opacity: i === cur ? 1 : 0.5, textAlign: "left",
                        }}
                      >
                        <div style={{ fontSize: 10, color: A.accent, fontWeight: 700, marginBottom: 3, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div style={{ fontSize: 9, color: A.text, lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {s.headline}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Export buttons */}
                  <button
                    onClick={copySlideToClipboard}
                    style={{
                      ...exportBtnStyle(A),
                      background: copiedSlide ? A.accent : "transparent",
                      color: copiedSlide ? contrastText(A.accent) : A.text,
                      borderColor: copiedSlide ? A.accent : A.border,
                    }}
                  >
                    {copiedSlide ? <Check size={14} /> : <ClipboardCopy size={14} />}
                    {copiedSlide ? "Copied to clipboard!" : "Copy slide to clipboard"}
                  </button>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <button onClick={exportCurrentPng} disabled={exportingPng} style={exportBtnStyle(A)}>
                      {exportingPng ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <ImageDown size={14} />}
                      {exportingPng ? "..." : "PNG"}
                    </button>
                    <button onClick={exportAllPngsZip} disabled={exportingAll} style={exportBtnStyle(A)}>
                      {exportingAll ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Archive size={14} />}
                      {exportingAll ? "..." : "ZIP All"}
                    </button>
                    <button onClick={downloadPDF} style={exportBtnStyle(A)}>
                      <Download size={14} /> PDF
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: A.muted, lineHeight: 1.5, textAlign: "center" }}>
                    Copy pastes directly into LinkedIn. PNG/PDF export at 2x resolution (1080x1080).
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
                          padding: "6px 12px", borderRadius: 8, border: `1px solid ${i === cur ? A.accent : A.border}`,
                          background: i === cur ? A.soft : "transparent", color: i === cur ? A.accent : A.muted,
                          fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif",
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
                        padding: "6px 10px", borderRadius: 8, border: `1px solid ${A.border}`, background: A.soft,
                        color: A.accent, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                        display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", opacity: regeneratingSlide !== null ? 0.4 : 1,
                      }}
                    >
                      <RefreshCw size={12} /> Regenerate
                    </button>
                  </div>

                  {/* Mini preview */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <ScaledSlide s={slide} brand={brand} i={cur} n={slides.length} T={T} size={Math.min(cardPx, slideAspect === "16:9" ? cardPx : 360)} intensity={intensity} aspect={slideAspect} bgMode={slideBgMode} logoConfig={slideLogo} brandLogos={activeBrand?.logos} brandFonts={activeBrand?.fonts} brandBgImage={activeBrand?.backgroundImage} bgImageMode={bgImageMode} />
                  </div>

                  {/* Edit fields */}
                  <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Row 1: Type + Tag */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={{ ...labelStyle(A), marginBottom: 3 }}>Type</label>
                        <select value={slide.type || "insight"} onChange={(e) => updateSlideField(cur, "type", e.target.value)} style={{ ...selectStyle(A), padding: "7px 10px" }}>
                          {["cover", "insight", "stat", "quote", "cta"].map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ ...labelStyle(A), marginBottom: 3 }}>Tag</label>
                        <input type="text" value={slide.tag || ""} onChange={(e) => updateSlideField(cur, "tag", e.target.value)} style={{ ...inputStyle(A), padding: "7px 10px" }} />
                      </div>
                    </div>
                    {/* Headline */}
                    <div>
                      <label style={{ ...labelStyle(A), marginBottom: 3 }}>Headline</label>
                      <input type="text" value={slide.headline || ""} onChange={(e) => updateSlideField(cur, "headline", e.target.value)} style={inputStyle(A)} />
                    </div>
                    {/* Body */}
                    <div>
                      <label style={{ ...labelStyle(A), marginBottom: 3 }}>Body</label>
                      <textarea value={slide.body || ""} onChange={(e) => updateSlideField(cur, "body", e.target.value)} rows={2} style={{ ...inputStyle(A), resize: "vertical", lineHeight: 1.6 }} />
                    </div>
                    {/* Stat fields */}
                    {slide.type === "stat" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "end" }}>
                        <div>
                          <label style={{ ...labelStyle(A), marginBottom: 3 }}>Stat</label>
                          <input type="text" value={slide.stat || ""} onChange={(e) => updateSlideField(cur, "stat", e.target.value)} placeholder="73%" style={{ ...inputStyle(A), padding: "7px 10px" }} />
                        </div>
                        <div>
                          <label style={{ ...labelStyle(A), marginBottom: 3 }}>Label</label>
                          <input type="text" value={slide.statLabel || ""} onChange={(e) => updateSlideField(cur, "statLabel", e.target.value)} placeholder="Adoption" style={{ ...inputStyle(A), padding: "7px 10px" }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, paddingBottom: 2 }}>
                          <input type="range" min={40} max={140} value={slide.statFontSize || (slide.stat?.length > 5 ? 70 : slide.stat?.length > 3 ? 90 : 112)} onChange={(e) => updateSlideField(cur, "statFontSize", Number(e.target.value))} style={{ width: 60, accentColor: A.accent }} />
                          <span style={{ fontSize: 10, color: A.muted, fontFamily: "'JetBrains Mono', monospace" }}>{slide.statFontSize || "auto"}</span>
                        </div>
                      </div>
                    )}
                    {/* Row: Label */}
                    <div>
                      <label style={{ ...labelStyle(A), marginBottom: 3 }}>Slide Label</label>
                      <input type="text" value={slide.label ?? brand} onChange={(e) => updateSlideField(cur, "label", e.target.value)} placeholder={brand || "Source, URL, tagline..."} style={{ ...inputStyle(A), padding: "7px 10px" }} />
                    </div>

                    {/* Per-slide toggles */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {/* Logo version override */}
                      {activeBrand?.logos && (activeBrand.logos.light || activeBrand.logos.dark) && slideLogo?.show !== "none" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 10, color: A.muted }}>Logo:</span>
                          {[
                            { id: "auto", label: "Auto" },
                            { id: "light", label: "Light" },
                            { id: "dark", label: "Dark" },
                            { id: "none", label: "None" },
                          ].map((o) => (
                            <button key={o.id} onClick={() => updateSlideField(cur, "logoVersion", o.id === "auto" ? undefined : o.id)} style={{
                              padding: "3px 6px", borderRadius: 4, fontSize: 9, fontWeight: 600,
                              border: `1px solid ${(slide.logoVersion || "auto") === (o.id === "auto" ? undefined : o.id) || (!slide.logoVersion && o.id === "auto") ? A.accent : A.border}`,
                              background: (slide.logoVersion || "auto") === (o.id === "auto" ? undefined : o.id) || (!slide.logoVersion && o.id === "auto") ? A.soft : "transparent",
                              color: (slide.logoVersion || "auto") === (o.id === "auto" ? undefined : o.id) || (!slide.logoVersion && o.id === "auto") ? A.accent : A.muted,
                              cursor: "pointer",
                            }}>{o.label}</button>
                          ))}
                        </div>
                      )}
                      {/* Counter toggle */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 10, color: A.muted }}>Counter:</span>
                        <button onClick={() => updateSlideField(cur, "hideCounter", !slide.hideCounter)} style={{
                          padding: "3px 8px", borderRadius: 4, fontSize: 9, fontWeight: 600,
                          border: `1px solid ${A.border}`,
                          background: slide.hideCounter ? "transparent" : A.soft,
                          color: slide.hideCounter ? A.muted : A.accent,
                          cursor: "pointer",
                        }}>{slide.hideCounter ? "Off" : "On"}</button>
                      </div>
                    </div>

                    {/* Rewrite with instructions */}
                    <div style={{ borderTop: `1px solid ${A.border}`, paddingTop: 12 }}>
                      <label style={{ ...labelStyle(A), marginBottom: 4 }}>
                        <RefreshCw size={12} /> AI Rewrite
                      </label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          value={slideRewritePrompt}
                          onChange={(e) => setSlideRewritePrompt(e.target.value)}
                          placeholder="e.g. make it more provocative..."
                          style={{ ...inputStyle(A), flex: 1, fontSize: 13 }}
                          onKeyDown={(e) => { if (e.key === "Enter") rewriteSlide(cur); }}
                        />
                        <button
                          onClick={() => rewriteSlide(cur)}
                          disabled={rewritingSlide || !apiKey}
                          style={{
                            background: A.accent, color: contrastText(A.accent), border: "none", borderRadius: 10,
                            padding: "0 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                            fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
                            opacity: rewritingSlide ? 0.5 : 1, display: "flex", alignItems: "center", gap: 5,
                          }}
                        >
                          {rewritingSlide ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={13} />}
                          Rewrite
                        </button>
                      </div>
                      <p style={{ fontSize: 10, color: A.muted, marginTop: 4, opacity: 0.7 }}>
                        Leave empty for a general improvement, or describe what to change
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── POST TAB ── */}
              {activeTab === "post" && post && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: A.muted, fontWeight: 600 }}>LinkedIn Post Copy</span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={copyPost}
                      style={{
                        background: copied ? A.accent : A.soft, border: `1px solid ${copied ? A.accent : A.border}`,
                        color: copied ? contrastText(A.accent) : A.accent, borderRadius: 8, padding: "7px 14px",
                        fontSize: 12, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
                        fontFamily: "'Inter', sans-serif", transition: "all 0.2s",
                      }}
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? "Copied!" : "Copy All"}
                    </motion.button>
                  </div>

                  {/* Rewrite post */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={postRewritePrompt}
                      onChange={(e) => setPostRewritePrompt(e.target.value)}
                      placeholder="e.g. shorter, more personal, add a story..."
                      style={{ ...inputStyle(A), flex: 1, fontSize: 13 }}
                      onKeyDown={(e) => { if (e.key === "Enter") rewritePost(); }}
                    />
                    <button
                      onClick={rewritePost}
                      disabled={rewritingPost || !apiKey}
                      style={{
                        background: A.accent, color: contrastText(A.accent), border: "none", borderRadius: 10,
                        padding: "0 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
                        opacity: rewritingPost ? 0.5 : 1, display: "flex", alignItems: "center", gap: 5,
                      }}
                    >
                      {rewritingPost ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={13} />}
                      Rewrite
                    </button>
                  </div>

                  {/* Editable structured post */}
                  <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, overflow: "hidden" }}>
                    {/* Hook */}
                    <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${A.border}` }}>
                      <div style={postLabelStyle(A)}>Hook</div>
                      <textarea
                        value={post.hook}
                        onChange={(e) => updatePostField("hook", e.target.value)}
                        onKeyDown={(e) => handleBoldShortcut(e, "hook")}
                        rows={2}
                        style={postEditStyle(T, true)}
                      />
                    </div>
                    {/* Body */}
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${A.border}` }}>
                      <div style={postLabelStyle(A)}>Body</div>
                      <textarea
                        value={post.body}
                        onChange={(e) => updatePostField("body", e.target.value)}
                        onKeyDown={(e) => handleBoldShortcut(e, "body")}
                        rows={5}
                        style={postEditStyle(T)}
                      />
                    </div>
                    {/* CTA */}
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${A.border}` }}>
                      <div style={postLabelStyle(A)}>Call to Action</div>
                      <textarea
                        value={post.cta}
                        onChange={(e) => updatePostField("cta", e.target.value)}
                        onKeyDown={(e) => handleBoldShortcut(e, "cta")}
                        rows={2}
                        style={postEditStyle(T, true)}
                      />
                    </div>
                    {/* Hashtags */}
                    <div style={{ padding: "12px 16px" }}>
                      <div style={postLabelStyle(A)}>Hashtags</div>
                      <input
                        type="text"
                        value={post.hashtags.map((h) => h.replace(/^#/, "")).join(", ")}
                        onChange={(e) => {
                          const tags = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                          updatePostField("hashtags", tags);
                        }}
                        placeholder="tag1, tag2, tag3"
                        style={{ ...inputStyle(A), fontSize: 13, color: A.accent }}
                      />
                      {/* Hashtag group picker */}
                      {userProfile?.profile?.hashtagGroups?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                          {userProfile.profile.hashtagGroups.map((group, gi) => (
                            <button
                              key={gi}
                              onClick={() => {
                                const existing = post.hashtags.map((h) => h.replace(/^#/, ""));
                                const merged = [...new Set([...existing, ...group.tags])];
                                updatePostField("hashtags", merged);
                              }}
                              style={{
                                background: A.soft,
                                border: `1px solid ${A.border}`,
                                borderRadius: 8,
                                padding: "5px 10px",
                                fontSize: 11,
                                fontWeight: 600,
                                color: A.accent,
                                cursor: "pointer",
                                fontFamily: "'Inter', sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = A.accent; e.currentTarget.style.color = contrastText(A.accent); }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = A.soft; e.currentTarget.style.color = A.accent; }}
                              title={group.tags.map((t) => `#${t}`).join(" ")}
                            >
                              <Hash size={11} />
                              {group.name}
                            </button>
                          ))}
                        </div>
                      )}
                      <p style={{ fontSize: 10, color: A.muted, marginTop: 4, opacity: 0.7 }}>
                        {userProfile?.profile?.hashtagGroups?.length > 0
                          ? "Click a group to add its tags. Edit manually above."
                          : "Separate with commas. Save groups in Settings."}
                      </p>
                    </div>
                  </div>

                  {/* Character counter */}
                  {(() => {
                    const linkedInText = postTextLinkedIn();
                    const len = linkedInText.length;
                    const over = len > 3000;
                    return (
                      <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "8px 14px", borderRadius: 10,
                        background: over ? "rgba(232,58,58,0.08)" : A.soft,
                        border: `1px solid ${over ? "rgba(232,58,58,0.25)" : A.border}`,
                      }}>
                        <span style={{ fontSize: 12, color: over ? "#E85A3A" : A.muted }}>
                          {over ? "Over LinkedIn's 3,000 character limit" : "Post length"}
                        </span>
                        <span style={{
                          fontSize: 13, fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: over ? "#E85A3A" : len > 2700 ? "#D4A853" : A.accent,
                        }}>
                          {len.toLocaleString()} / 3,000
                        </span>
                      </div>
                    );
                  })()}

                  {/* Full preview with bold rendering */}
                  <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: 16, whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.75, color: A.text, wordBreak: "break-word" }}>
                    {renderBoldPreview(postTextRaw()).map((part, i) =>
                      typeof part === "string" ? <span key={i}>{part}</span> : <strong key={i} style={{ fontWeight: 700 }}>{part.text}</strong>
                    )}
                  </div>
                  <p style={{ fontSize: 10, color: A.muted, textAlign: "center", opacity: 0.7 }}>
                    Preview shows bold. Copied text uses LinkedIn-compatible Unicode bold formatting.
                  </p>

                  {source.trim() && (
                    <p style={{ fontSize: 11, color: A.muted, lineHeight: 1.5, padding: "8px 12px", background: A.soft, borderRadius: 8 }}>
                      Tip: Paste the source line as your first comment after publishing for better reach.
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          /* Main layout: stack to single column, output first */
          .cf-main-grid { grid-template-columns: 1fr !important; }
          .cf-right-panel { order: -1 !important; }
          .cf-left-panel { order: 1 !important; }
          /* Content type: 2x2 grid */
          div[style*="grid-template-columns: repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          /* Settings rows: compact */
          div[style*="grid-template-columns: 1fr 1fr 72px"] { grid-template-columns: 1fr 1fr !important; }
          div[style*="grid-template-columns: 1fr 72px"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        /* Header nav: hide text labels on small screens */
        @media (max-width: 640px) {
          .cf-nav-label { display: none !important; }
          .cf-brand-sub { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ── Shared styles ──
function labelStyle(A) {
  return { display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: A.muted, marginBottom: 6 };
}

function inputStyle(A) {
  return { background: A.card, color: A.text, border: `1px solid ${A.border}`, borderRadius: 10, padding: "10px 13px", fontFamily: "'Inter', sans-serif", fontSize: 14, width: "100%", transition: "border-color 0.2s" };
}

function selectStyle(A) {
  return { ...inputStyle(A), cursor: "pointer", appearance: "auto" };
}

function navBtnStyle(A, side) {
  return {
    position: "absolute", top: "50%", transform: "translateY(-50%)", [side]: 8,
    width: 40, height: 40, borderRadius: 12, background: `${A.card}DD`, backdropFilter: "blur(8px)",
    border: `1px solid ${A.border}`, color: A.text, display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", zIndex: 10, transition: "all 0.2s",
  };
}

function exportBtnStyle(A) {
  return {
    width: "100%", background: "transparent", color: A.text, border: `1px solid ${A.border}`, borderRadius: 12,
    padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s",
  };
}

function postLabelStyle(A) {
  return { fontSize: 10, fontWeight: 700, color: A.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 };
}

function postEditStyle(A, bold = false) {
  return {
    width: "100%", background: "transparent", color: A.text, border: "none", borderRadius: 0,
    padding: 0, fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.7, resize: "vertical",
    fontWeight: bold ? 600 : 400,
  };
}

function headerBtnStyle(A, primary) {
  return {
    background: primary ? A.accent : A.soft,
    border: `1px solid ${primary ? A.accent : A.border}`,
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 600,
    color: primary ? (contrastText(A.accent)) : A.muted,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    alignItems: "center",
    gap: 5,
    transition: "all 0.2s",
  };
}

function NavBtn({ T: A, active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? A.soft : "transparent",
        border: `1px solid ${active ? A.accent : "transparent"}`,
        borderRadius: 8,
        padding: "7px 10px",
        fontSize: 12,
        fontWeight: 600,
        color: active ? A.accent : A.muted,
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        gap: 5,
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
}
