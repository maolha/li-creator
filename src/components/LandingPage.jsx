import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import { ScaledSlide } from "./SlideRenderer";
import { ScaledSpeakerSlide } from "./SpeakerSlide";
import Logo from "./Logo";

// ── Dark demo themes ──
const T_BLUE = { bg: "#08090D", card: "#0F1117", accent: "#0077B5", soft: "rgba(0,119,181,0.10)", text: "#F0F0F8", muted: "#7878A0", border: "rgba(0,119,181,0.15)", gradient: "linear-gradient(135deg, #0077B5, #571BC1)" };
const T_RED = { bg: "#0B0B0B", card: "#141414", accent: "#E83A3A", soft: "rgba(232,58,58,0.10)", text: "#F5F5F5", muted: "#808080", border: "rgba(232,58,58,0.18)", gradient: "linear-gradient(135deg, #E83A3A, #FF6B35)" };
const T_PURPLE = { bg: "#08090D", card: "#0F1117", accent: "#7C5CFC", soft: "rgba(124,92,252,0.10)", text: "#F0F0F8", muted: "#7878A0", border: "rgba(124,92,252,0.15)", gradient: "linear-gradient(135deg, #7C5CFC, #E040FB)" };
const T_TEAL = { bg: "#060D14", card: "#0C1520", accent: "#00D4AA", soft: "rgba(0,212,170,0.08)", text: "#E8F0F0", muted: "#607080", border: "rgba(0,212,170,0.15)", gradient: "linear-gradient(135deg, #00D4AA, #0099FF)" };
const T_GOLD = { bg: "#0C0A08", card: "#141210", accent: "#D4A853", soft: "rgba(212,168,83,0.08)", text: "#F0ECE4", muted: "#8A8070", border: "rgba(212,168,83,0.15)", gradient: "linear-gradient(135deg, #D4A853, #F0C060)" };

// ── Light demo themes ──
const T_BLUE_L = { bg: "#F5F7FA", card: "#FFFFFF", accent: "#0077B5", soft: "rgba(0,119,181,0.06)", text: "#1A1A2E", muted: "#6B7B8D", border: "rgba(0,119,181,0.12)", gradient: "linear-gradient(135deg, #0077B5, #571BC1)" };
const T_RED_L = { bg: "#FAF5F5", card: "#FFFFFF", accent: "#E83A3A", soft: "rgba(232,58,58,0.06)", text: "#1A1A1A", muted: "#707070", border: "rgba(232,58,58,0.12)", gradient: "linear-gradient(135deg, #E83A3A, #FF6B35)" };
const T_PURPLE_L = { bg: "#F5F5FA", card: "#FFFFFF", accent: "#7C5CFC", soft: "rgba(124,92,252,0.06)", text: "#1A1A2E", muted: "#6B7B8D", border: "rgba(124,92,252,0.12)", gradient: "linear-gradient(135deg, #7C5CFC, #E040FB)" };

// ── Style presets: professional / bold / dramatic ──
const STYLE_PRESETS = {
  professional: {
    label: "Professional",
    icon: "💼",
    desc: "Clean, polished, authority-driven",
    slides: [
      { slide: { type: "cover", headline: "The Future of AI in Enterprise", body: "How leaders are rethinking strategy in the age of intelligent automation.", tag: "Insight" }, darkTheme: T_BLUE, lightTheme: T_BLUE_L, intensity: "clean", i: 0, n: 7 },
      { slide: { type: "stat", headline: "Steady Growth", body: "Consistent, measurable returns across Q1 portfolio companies.", stat: "42%", statLabel: "Growth", tag: "Data" }, darkTheme: T_BLUE, lightTheme: T_BLUE_L, intensity: "clean", i: 0, n: 1 },
      { slide: { type: "quote", headline: "Trust is built in drops and lost in buckets.", body: "Leadership lessons from two decades in regulated finance.", tag: "Insight" }, darkTheme: T_BLUE, lightTheme: T_BLUE_L, intensity: "clean", i: 0, n: 1 },
    ],
    posts: [
      { name: "Sarah Chen", title: "Chief AI Officer at SwissBank AG", time: "4h", text: "**AI is reshaping compliance — not replacing it.**\n\nAfter 18 months of implementation across 3 divisions:\n\n• 42% reduction in false positives\n• Average review time: 3.2 hours → 47 minutes\n• Zero missed regulatory deadlines\n\nThe ROI speaks for itself.\n\n#AI #Compliance #SwissFinance", likes: 847, comments: 124 },
      { name: "Marc Weber", title: "Head of Innovation at FinTech Labs", time: "8h", text: "**Sustainable growth beats viral spikes every time.**\n\nOur Q1 data across 200+ portfolio companies tells a clear story:\n\nThe top performers aren't chasing trends.\nThey're building systems.\n\n#Innovation #DataStrategy #Growth", likes: 1203, comments: 89 },
      { name: "Elena Rossi", title: "CEO at Alpine Ventures", time: "1d", text: "**Trust is built in drops and lost in buckets.**\n\nTwo decades in regulated finance taught me this:\nConsistency > creativity when it comes to client relationships.\n\nThe firms that win long-term? They're boringly reliable.\n\n#Leadership #Finance #Trust", likes: 2041, comments: 216 },
    ],
    speaker: {
      eventTitle: "AI in Finance Summit",
      sessionTitle: "The Future of Compliance",
      eventDate: "March 28, 2026",
      cta: "Register now",
      tagLabel: "Keynote",
      speakers: [
        { name: "Sarah Chen", title: "Chief AI Officer", company: "SwissBank AG", photo: "https://i.pravatar.cc/300?img=47" },
        { name: "Marc Weber", title: "Head of Innovation", company: "FinTech Labs", photo: "https://i.pravatar.cc/300?img=68" },
      ],
      style: { layout: "classic", aspect: "1:1", bgMode: "dark" },
    },
    speakerPost: { name: "Sarah Chen", title: "Chief AI Officer at SwissBank AG", time: "2d", text: "Honoured to be speaking at the **AI in Finance Summit** alongside Marc Weber.\n\nWe'll cover compliance automation and what regulated industries can learn from early adopters.\n\n📅 March 28, 2026\n\n#AIFinance #Keynote #Compliance", likes: 634, comments: 45 },
  },

  bold: {
    label: "Bold",
    icon: "🔥",
    desc: "High-impact, attention-grabbing",
    slides: [
      { slide: { type: "cover", headline: "Stop Playing It Safe With Your Content", body: "The brands winning on LinkedIn aren't polishing — they're provoking.", tag: "Hot Take" }, darkTheme: T_RED, lightTheme: T_RED_L, intensity: "bold", i: 0, n: 7 },
      { slide: { type: "stat", headline: "Attention Is the New Currency", body: "Scroll-stopping visuals outperform text-only posts by a massive margin.", stat: "8×", statLabel: "More Reach", tag: "Data" }, darkTheme: T_RED, lightTheme: T_RED_L, intensity: "bold", i: 0, n: 1 },
      { slide: { type: "quote", headline: "If your content doesn't make someone uncomfortable, it's not saying anything.", body: "Why vanilla thought leadership is dead.", tag: "Hot Take" }, darkTheme: T_RED, lightTheme: T_RED_L, intensity: "bold", i: 0, n: 1 },
    ],
    posts: [
      { name: "Sarah Chen", title: "Chief AI Officer at SwissBank AG", time: "4h", text: "**Stop playing it safe with AI.**\n\nEvery company says they're 'AI-first.'\n90% of them are lying.\n\nReal AI adoption means:\n→ Breaking legacy workflows\n→ Uncomfortable org changes\n→ Betting on speed over perfection\n\nThe rest is just PowerPoint.\n\n#AI #Leadership #HotTake", likes: 2847, comments: 324 },
      { name: "Marc Weber", title: "Head of Innovation at FinTech Labs", time: "8h", text: "**Your content is invisible. Here's why.**\n\nScroll-stopping visuals get 8× more reach than text-only posts.\n\nYet 95% of LinkedIn creators are still posting walls of text.\n\nThe algorithm rewards BOLD.\nNot boring.\n\n#ContentStrategy #LinkedIn #Growth", likes: 3203, comments: 189 },
      { name: "Elena Rossi", title: "CEO at Alpine Ventures", time: "1d", text: "**If your content doesn't make someone uncomfortable, it's not saying anything.**\n\nI lost 200 followers after my last post.\nI also got 14 inbound leads.\n\nVanilla thought leadership is dead.\nPick a side.\n\n#Leadership #ContentStrategy #B2B", likes: 5041, comments: 416 },
    ],
    speaker: {
      eventTitle: "Disrupt or Be Disrupted",
      sessionTitle: "Why 90% of AI Projects Fail",
      eventDate: "April 15, 2026",
      cta: "Claim your seat",
      tagLabel: "Keynote",
      speakers: [
        { name: "Sarah Chen", title: "Chief AI Officer", company: "SwissBank AG", photo: "https://i.pravatar.cc/300?img=47" },
        { name: "Marc Weber", title: "Head of Innovation", company: "FinTech Labs", photo: "https://i.pravatar.cc/300?img=68" },
      ],
      style: { layout: "bold", aspect: "1:1", bgMode: "dark" },
    },
    speakerPost: { name: "Sarah Chen", title: "Chief AI Officer at SwissBank AG", time: "2d", text: "No slides. No scripts. Just hard truths.\n\nMarc Weber and I are going live at **Disrupt or Be Disrupted** to talk about why 90% of AI projects crash and burn.\n\n📅 April 15, 2026\n🔥 This one will be uncomfortable.\n\n#AIFinance #Keynote #RealTalk", likes: 1834, comments: 145 },
  },

  dramatic: {
    label: "Dramatic",
    icon: "⚡",
    desc: "Visually stunning, maximum contrast",
    slides: [
      { slide: { type: "cover", headline: "The Algorithm Changed. Did You?", body: "What the top 1% of LinkedIn creators know that you don't.", tag: "Deep Dive" }, darkTheme: T_PURPLE, lightTheme: T_PURPLE_L, intensity: "dramatic", i: 0, n: 7 },
      { slide: { type: "stat", headline: "The Engagement Gap", body: "The difference between viral and invisible is one visual.", stat: "73%", statLabel: "Engagement", tag: "Research" }, darkTheme: T_PURPLE, lightTheme: T_PURPLE_L, intensity: "dramatic", i: 0, n: 1 },
      { slide: { type: "quote", headline: "In a feed of noise, clarity is the ultimate luxury.", body: "Why minimalism wins in the age of information overload.", tag: "Insight" }, darkTheme: T_PURPLE, lightTheme: T_PURPLE_L, intensity: "dramatic", i: 0, n: 1 },
    ],
    posts: [
      { name: "Sarah Chen", title: "Chief AI Officer at SwissBank AG", time: "4h", text: "**The algorithm changed. Did you?**\n\nLinkedIn's 2026 update rewrites the playbook:\n\n🟣 Carousels now get 3× the dwell time\n🟣 'Expertise signals' weigh more than engagement bait\n🟣 Visual-first posts dominate the feed\n\nWhat the top 1% already know.\n\n#LinkedIn #Algorithm #ContentStrategy", likes: 4847, comments: 524 },
      { name: "Marc Weber", title: "Head of Innovation at FinTech Labs", time: "8h", text: "**73% engagement lift. One change.**\n\nWe A/B tested 500 posts across 12 accounts.\n\nThe variable? A single branded visual.\n\nThe difference between viral and invisible\nis one carousel slide.\n\n#DataDriven #LinkedIn #Research", likes: 6203, comments: 389 },
      { name: "Elena Rossi", title: "CEO at Alpine Ventures", time: "1d", text: "**In a feed of noise, clarity is the ultimate luxury.**\n\nI stripped my content strategy down to 3 principles:\n\n1. One idea per post\n2. One visual per idea\n3. One action per visual\n\nSimplicity scales. Complexity collapses.\n\n#Minimalism #ContentStrategy #Leadership", likes: 8041, comments: 616 },
    ],
    speaker: {
      eventTitle: "The Creator Economy Summit",
      sessionTitle: "Visual Storytelling at Scale",
      eventDate: "May 10, 2026",
      cta: "Get early access",
      tagLabel: "Main Stage",
      speakers: [
        { name: "Sarah Chen", title: "Chief AI Officer", company: "SwissBank AG", photo: "https://i.pravatar.cc/300?img=47" },
        { name: "Marc Weber", title: "Head of Innovation", company: "FinTech Labs", photo: "https://i.pravatar.cc/300?img=68" },
      ],
      style: { layout: "centered", aspect: "1:1", bgMode: "dark" },
    },
    speakerPost: { name: "Sarah Chen", title: "Chief AI Officer at SwissBank AG", time: "2d", text: "Main stage. **The Creator Economy Summit.**\n\nMarc Weber and I will unpack visual storytelling at scale — and why the next wave of LinkedIn influence belongs to creators who think in frames, not paragraphs.\n\n📅 May 10, 2026\n⚡ Limited early access\n\n#CreatorEconomy #VisualStorytelling", likes: 2834, comments: 245 },
  },
};

// Boring filler posts
const BORING_POSTS = [
  { name: "Alex Thompson", title: "Marketing Manager at TechCorp", time: "2h", text: "Excited to share that our team just completed the Q1 planning session. Looking forward to what's ahead! #teamwork #planning", likes: 12, comments: 3 },
  { name: "Jennifer Parker", title: "HR Director", time: "6h", text: "We're hiring! Looking for talented individuals to join our growing team. DM me for details. #hiring #jobs", likes: 8, comments: 2 },
  { name: "David Liu", title: "Software Engineer", time: "12h", text: "Had a great day at the office today. Productive meetings and good coffee. Can't complain!", likes: 15, comments: 1 },
];

// ── Features data ──
const FEATURES = [
  { icon: "📑", title: "AI Carousel Builder", desc: "Paste any text — article, transcript, bullet points — and get a polished multi-slide carousel with headlines, stats, and CTAs. Three visual intensities: clean, bold, dramatic." },
  { icon: "🎤", title: "Speaker Cards", desc: "Generate professional speaker announcement visuals. Four layouts, multiple aspect ratios, custom branding. Perfect for events, webinars, and conferences." },
  { icon: "✍️", title: "Post Copy Generator", desc: "AI writes scroll-stopping LinkedIn copy matched to your voice and tone. Hashtags, hooks, and formatting included." },
  { icon: "🎨", title: "Brand Customization", desc: "Upload your logo, set accent colors, choose fonts. Every visual auto-matches your brand identity across all formats." },
  { icon: "📐", title: "Multiple Formats", desc: "Export as 1:1, 4:5, 16:9, or 9:16. Optimized for LinkedIn feed, stories, and cross-posting to other platforms." },
  { icon: "🔒", title: "Privacy First", desc: "Your API key stays yours. Optional cloud sync with full privacy controls. Local-only mode available — nothing leaves your browser." },
];

// ── Page theme helpers ──
const PAGE_DARK = {
  bg: "#0a0c10", card: "#12151c", cardBoring: "#0f1115",
  text: "#e8e6e3", muted: "rgba(232,230,227,0.55)", mutedStrong: "rgba(232,230,227,0.45)",
  mutedWeak: "rgba(232,230,227,0.25)", border: "rgba(255,255,255,0.04)",
  borderFeatured: "rgba(0,119,181,0.12)", navBg: "rgba(10,12,16,0.7)",
  heroGlow1: "rgba(0,119,181,0.15)", heroGlow2: "rgba(87,27,193,0.1)",
  btnBg: "#fff", btnText: "#0a0c10", accentFaded: "rgba(0,119,181,0.3)",
  featureCardBg: "#12151c", featureBorder: "rgba(255,255,255,0.06)",
  feedBg: "linear-gradient(to bottom, #0a0c10, #0e1118, #0a0c10)",
  avatarBoring: "#2a2d35", textBoring: "rgba(232,230,227,0.5)",
  textFeatured: "rgba(232,230,227,0.8)", ctaGlow: "rgba(0,119,181,0.06)",
};
const PAGE_LIGHT = {
  bg: "#f4f5f7", card: "#ffffff", cardBoring: "#f0f1f3",
  text: "#0a0c10", muted: "rgba(10,12,16,0.55)", mutedStrong: "rgba(10,12,16,0.45)",
  mutedWeak: "rgba(10,12,16,0.25)", border: "rgba(0,0,0,0.06)",
  borderFeatured: "rgba(0,119,181,0.15)", navBg: "rgba(244,245,247,0.85)",
  heroGlow1: "rgba(0,119,181,0.08)", heroGlow2: "rgba(87,27,193,0.05)",
  btnBg: "#0a0c10", btnText: "#fff", accentFaded: "rgba(0,119,181,0.15)",
  featureCardBg: "#ffffff", featureBorder: "rgba(0,0,0,0.06)",
  feedBg: "linear-gradient(to bottom, #f4f5f7, #eceef2, #f4f5f7)",
  avatarBoring: "#d0d3da", textBoring: "rgba(10,12,16,0.4)",
  textFeatured: "rgba(10,12,16,0.8)", ctaGlow: "rgba(0,119,181,0.04)",
};

// Sun/Moon icons
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

export default function LandingPage({ onSignIn }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [darkMode, setDarkMode] = useState(true);
  const [feedStyle, setFeedStyle] = useState("professional");
  const P = darkMode ? PAGE_DARK : PAGE_LIGHT;
  const preset = STYLE_PRESETS[feedStyle];

  // Get theme-appropriate slide theme
  const getSlideTheme = (slide) => darkMode ? slide.darkTheme : slide.lightTheme;
  const getSpeakerTheme = () => darkMode ? T_BLUE : T_BLUE_L;

  // Speaker data with bgMode matching page theme
  const speakerData = useMemo(() => ({
    ...preset.speaker,
    style: { ...preset.speaker.style, bgMode: darkMode ? "dark" : "light" },
  }), [preset, darkMode]);

  return (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.text, fontFamily: "'Manrope', sans-serif", overflowX: "hidden", transition: "background 0.4s, color 0.4s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');
        ::selection { background: rgba(0,119,181,0.4); }
        .cf-hero-mockup { display: block; }
        @media (max-width: 700px) {
          .cf-hero-mockup { display: none !important; }
        }
      `}</style>

      {/* NAV */}
      <header style={{ position: "fixed", top: 0, width: "100%", zIndex: 50, background: P.navBg, backdropFilter: "blur(24px)", transition: "background 0.4s" }}>
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 72, padding: "0 clamp(20px, 4vw, 48px)", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo size={32} rounded={8} />
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" }}>ContentForge</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode((d) => !d)}
              style={{
                background: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: P.text, transition: "background 0.3s, border 0.3s",
              }}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onSignIn}
              style={{ background: P.btnBg, color: P.btnText, padding: "10px 22px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "background 0.3s, color 0.3s" }}
            >
              Get Started
            </motion.button>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section ref={heroRef} style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 72 }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${P.heroGlow1}, transparent 70%)` }} />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 50% at 75% 55%, ${P.heroGlow2}, transparent 70%)` }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: `linear-gradient(to top, ${P.bg}, transparent)` }} />

        <motion.div style={{ scale: heroScale, opacity: heroOpacity, width: "100%" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(24px, 5vw, 64px)", display: "flex", alignItems: "center", gap: "clamp(32px, 5vw, 72px)", flexWrap: "wrap", justifyContent: "center" }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ flex: "1 1 400px", minWidth: 300, maxWidth: 520 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                <Logo size={48} rounded={12} />
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>ContentForge</div>
                  <div style={{ fontSize: 11, color: P.mutedWeak, letterSpacing: "0.06em", textTransform: "uppercase" }}>LinkedIn Content Studio</div>
                </div>
              </div>
              <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 18 }}>
                Create content<br />that stops<br />
                <span style={{ background: "linear-gradient(135deg, #0077B5, #571BC1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>the scroll</span>
              </h1>
              <p style={{ fontSize: 16, color: P.muted, lineHeight: 1.7, marginBottom: 32, maxWidth: 400 }}>
                Transform any text into stunning LinkedIn carousels and post copy. Personalized to your voice. Published in seconds.
              </p>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: `0 8px 32px rgba(0,119,181,0.4)` }}
                whileTap={{ scale: 0.97 }}
                onClick={onSignIn}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "15px 32px", background: P.btnBg, color: P.btnText, fontWeight: 700, borderRadius: 12, border: "none", fontSize: 15, cursor: "pointer", fontFamily: "'Manrope', sans-serif", boxShadow: darkMode ? "0 4px 20px rgba(255,255,255,0.08)" : "0 4px 20px rgba(0,0,0,0.1)", transition: "background 0.3s, color 0.3s" }}
              >
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZa3zOgexK2Mebawxy68F-sMSEQmGNPMggZJ9-jD0hEVAva9s-qe5TL8o9wDcI84NV0TRlwKo_ue3TPWMDF-RhKygaRBlnkQAF0pBeIwwloHAVdTE7fWI08sQVSBDpVFWBc-K68QtwCGdL3GzWqeLgvsg1C45JzEDMAZLJRvXkTYSeXOpkX3VmjWVJEjGWlB_iNdLR9QLJVR0EUiXocJYlBe1sF0tiiUcS_DAI0UI-QFI1PVKFL9BZvgtPTFKefEmyYOtHm1WGlKo" alt="" style={{ width: 18, height: 18 }} />
                Start creating — free
              </motion.button>
              <p style={{ fontSize: 11, color: P.mutedWeak, marginTop: 12 }}>Your API key. Cloud history optional. Privacy controls in settings.</p>
            </motion.div>

            {/* Mockup */}
            <motion.div className="cf-hero-mockup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} style={{ flex: "0 1 380px", position: "relative" }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
                <div style={{ background: darkMode ? "#151820" : "#fff", borderRadius: 16, padding: 14, border: `1px solid ${darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`, boxShadow: darkMode ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.1)", transition: "background 0.4s, border 0.4s, box-shadow 0.4s" }}>
                  <div style={{ background: "linear-gradient(135deg, #0077B5, #571BC1)", borderRadius: 10, height: 240, display: "flex", flexDirection: "column", justifyContent: "center", padding: 28, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>CAROUSEL SLIDE</div>
                    <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, fontStyle: "italic", lineHeight: 1.15, color: "#fff" }}>The future belongs to those who create it</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 10 }}>1 / 7</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 10, justifyContent: "center" }}>
                    {[0,1,2,3,4,5,6].map((i) => <div key={i} style={{ width: i === 0 ? 18 : 5, height: 5, borderRadius: 3, background: i === 0 ? "#0077B5" : (darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)") }} />)}
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1.5 }}
                style={{ position: "absolute", bottom: -30, left: -40, background: darkMode ? "#151820" : "#fff", borderRadius: 10, padding: 12, border: `1px solid ${darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`, boxShadow: darkMode ? "0 12px 40px rgba(0,0,0,0.5)" : "0 12px 40px rgba(0,0,0,0.1)", width: 130, transition: "background 0.4s, border 0.4s" }}
              >
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E83A3A", marginBottom: 4 }}>STAT</div>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: P.text, lineHeight: 1 }}>73%</div>
                <div style={{ fontSize: 8, color: P.mutedWeak, marginTop: 3 }}>Engagement lift</div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* FAKE LINKEDIN FEED */}
      <section style={{ padding: "clamp(60px, 10vw, 100px) clamp(24px, 5vw, 64px)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: P.feedBg }} />
        <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 10 }}>
              Spot the difference
            </h2>
            <p style={{ fontSize: 15, color: P.mutedStrong }}>
              Your content in a real feed. Scroll and see what stops you.
            </p>
          </motion.div>

          {/* Style preset selector */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 36, flexWrap: "wrap" }}>
            {Object.entries(STYLE_PRESETS).map(([key, p]) => {
              const active = feedStyle === key;
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setFeedStyle(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 18px", borderRadius: 10, border: "none",
                    fontSize: 13, fontWeight: active ? 700 : 500, cursor: "pointer",
                    fontFamily: "'Manrope', sans-serif",
                    background: active
                      ? "linear-gradient(135deg, #0077B5, #571BC1)"
                      : (darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                    color: active ? "#fff" : P.text,
                    transition: "background 0.3s, color 0.3s",
                  }}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence>
            <motion.p
              key={feedStyle}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: 13, color: P.mutedStrong, textAlign: "center", marginBottom: 28, marginTop: -20 }}
            >
              {preset.desc}
            </motion.p>
          </AnimatePresence>

          {/* Feed container */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Boring 1 */}
            <FeedPost P={P} darkMode={darkMode} boring {...BORING_POSTS[0]} />

            {/* Featured: Carousel */}
            <FeedPost P={P} darkMode={darkMode} featured {...preset.posts[0]}
              slide={{ ...preset.slides[0], theme: getSlideTheme(preset.slides[0]) }}
            />

            {/* Boring 2 */}
            <FeedPost P={P} darkMode={darkMode} boring {...BORING_POSTS[1]} />

            {/* Featured: Stat */}
            <FeedPost P={P} darkMode={darkMode} featured {...preset.posts[1]}
              slide={{ ...preset.slides[1], theme: getSlideTheme(preset.slides[1]) }}
            />

            {/* Boring 3 */}
            <FeedPost P={P} darkMode={darkMode} boring {...BORING_POSTS[2]} />

            {/* Featured: Quote */}
            <FeedPost P={P} darkMode={darkMode} featured {...preset.posts[2]}
              slide={{ ...preset.slides[2], theme: getSlideTheme(preset.slides[2]) }}
            />

            {/* Featured: Speaker */}
            <FeedPost P={P} darkMode={darkMode} featured {...preset.speakerPost}
              speakerData={speakerData}
              speakerTheme={getSpeakerTheme()}
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "clamp(60px, 10vw, 100px) clamp(24px, 5vw, 64px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 10 }}>
              Everything you need to<br />
              <span style={{ background: "linear-gradient(135deg, #0077B5, #571BC1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>own your feed</span>
            </h2>
            <p style={{ fontSize: 15, color: P.mutedStrong, maxWidth: 440, margin: "0 auto" }}>
              From carousel slides to speaker cards — one tool for every LinkedIn visual format.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: 0.06 * i, duration: 0.4 }}
                style={{
                  background: P.featureCardBg, borderRadius: 14,
                  border: `1px solid ${P.featureBorder}`,
                  padding: "24px 22px",
                  transition: "background 0.4s, border 0.4s",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: P.text }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: P.mutedStrong, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "clamp(60px, 10vw, 100px) clamp(24px, 5vw, 64px)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 48, textAlign: "center" }}>
            Idea to published<br />in under a minute
          </motion.h2>
          {[
            { n: "01", title: "Paste anything", desc: "An article, transcript, or just a few bullet points." },
            { n: "02", title: "AI builds everything", desc: "Slides, copy, hashtags — matched to your voice." },
            { n: "03", title: "Refine with instructions", desc: "Edit visually or tell the AI what to change." },
            { n: "04", title: "Copy. Paste. Publish.", desc: "One click to clipboard. Paste into LinkedIn." },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              style={{ display: "flex", gap: 20, padding: "28px 0", borderBottom: `1px solid ${P.border}` }}
            >
              <span style={{ fontSize: 44, fontWeight: 800, color: P.accentFaded, lineHeight: 1, flexShrink: 0, width: 56 }}>{s.n}</span>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: P.mutedStrong, lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "clamp(80px, 12vw, 140px) clamp(24px, 5vw, 64px)", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${P.ctaGlow}, transparent 70%)` }} />
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ position: "relative" }}>
          <h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>
            Your LinkedIn presence,<br />
            <span style={{ background: "linear-gradient(135deg, #0077B5, #571BC1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>architected</span>
          </h2>
          <p style={{ fontSize: 15, color: P.mutedStrong, marginBottom: 32, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
            Join creators building authority without burning hours on content.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,119,181,0.4)" }}
            whileTap={{ scale: 0.96 }}
            onClick={onSignIn}
            style={{ padding: "16px 36px", background: P.btnBg, color: P.btnText, fontWeight: 700, borderRadius: 12, border: "none", fontSize: 15, cursor: "pointer", fontFamily: "'Manrope', sans-serif", boxShadow: darkMode ? "0 4px 20px rgba(255,255,255,0.06)" : "0 4px 20px rgba(0,0,0,0.08)", transition: "background 0.3s, color 0.3s" }}
          >
            Start creating — free
          </motion.button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${P.border}`, padding: "28px clamp(20px, 4vw, 48px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>ContentForge</span>
          <span style={{ fontSize: 11, color: P.mutedWeak }}>Your API key. Your data. Your content.</span>
        </div>
      </footer>
    </div>
  );
}

// ── Fake LinkedIn feed post ──
function FeedPost({ name, title, time, text, likes, comments, boring, featured, slide, speakerData, speakerTheme, P, darkMode }) {
  const initials = name.split(" ").map((w) => w[0]).join("");
  const avatarBg = boring ? P.avatarBoring : "linear-gradient(135deg, #0077B5, #571BC1)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4 }}
      style={{
        background: featured ? P.card : P.cardBoring,
        borderRadius: 12,
        border: `1px solid ${featured ? P.borderFeatured : P.border}`,
        overflow: "hidden",
        opacity: boring ? 0.5 : 1,
        transition: "background 0.4s, border 0.4s, opacity 0.3s",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 16px 0", display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%", background: avatarBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: P.text }}>{name}</div>
          <div style={{ fontSize: 11, color: P.mutedStrong, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        </div>
        <span style={{ fontSize: 10, color: P.mutedWeak, flexShrink: 0 }}>{time}</span>
      </div>

      {/* Text */}
      <div style={{ padding: "10px 16px", fontSize: 13, lineHeight: 1.6, color: boring ? P.textBoring : P.textFeatured, whiteSpace: "pre-line" }}>
        {text.split("**").map((part, i) => i % 2 === 1 ? <strong key={i} style={{ fontWeight: 700, color: P.text }}>{part}</strong> : <span key={i}>{part}</span>)}
      </div>

      {/* Visual */}
      {slide && (
        <div style={{ padding: "0 16px 4px", display: "flex", justifyContent: "center" }}>
          <ScaledSlide s={slide.slide} brand="Content Forge" i={slide.i} n={slide.n} T={slide.theme} size={Math.min(528, 520)} intensity={slide.intensity} />
        </div>
      )}
      {speakerData && (
        <div style={{ padding: "0 16px 4px", display: "flex", justifyContent: "center" }}>
          <ScaledSpeakerSlide data={speakerData} T={speakerTheme || T_BLUE} brand="Content Forge" size={Math.min(528, 520)} />
        </div>
      )}

      {/* Engagement bar */}
      <div style={{ padding: "8px 16px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${P.border}`, marginTop: 4 }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 12 }}>👍</span>
          <span style={{ fontSize: 11, color: P.mutedStrong }}>{likes?.toLocaleString()}</span>
        </div>
        <span style={{ fontSize: 11, color: P.mutedWeak }}>{comments} comments</span>
      </div>
    </motion.div>
  );
}
