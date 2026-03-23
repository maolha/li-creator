import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save, Key, User, Target, Package, BookOpen,
  Plus, X, Loader2, Check, Shield, Briefcase,
} from "lucide-react";
import BrandEditor from "./BrandEditor";

export default function SettingsPanel({ T, user, profile, onSave, apiKey, onApiKeySave }) {
  const [localProfile, setLocalProfile] = useState({
    linkedinHeadline: "",
    linkedinAbout: "",
    products: "",
    goals: "",
    brands: [],
    historyEnabled: true,
    ...profile,
  });
  const [localApiKey, setLocalApiKey] = useState(apiKey || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (profile) setLocalProfile((prev) => ({ ...prev, ...profile })); }, [profile]);
  useEffect(() => { setLocalApiKey(apiKey || ""); }, [apiKey]);

  function updateField(field, value) {
    setLocalProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(localProfile);
    await onApiKeySave(localApiKey);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640, margin: "0 auto", width: "100%" }}
    >
      <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
        Settings
      </h2>

      {/* API Key */}
      <Section T={T} icon={Key} title="Claude API Key">
        <input type="password" value={localApiKey} onChange={(e) => setLocalApiKey(e.target.value)} placeholder="sk-ant-api03-..." style={{ ...inputStyle(T), fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }} />
        <p style={hintStyle(T)}>Encrypted and stored securely. Never shared.</p>
      </Section>

      {/* About Me */}
      <Section T={T} icon={User} title="About Me">
        <div>
          <label style={labelStyle(T)}>LinkedIn Headline</label>
          <input type="text" value={localProfile.linkedinHeadline || ""} onChange={(e) => updateField("linkedinHeadline", e.target.value)} placeholder="e.g. CEO at PAIA | AI for Swiss Financial Services" style={inputStyle(T)} />
        </div>
        <div>
          <label style={labelStyle(T)}>LinkedIn About / Bio</label>
          <textarea value={localProfile.linkedinAbout || ""} onChange={(e) => updateField("linkedinAbout", e.target.value)} placeholder="Paste your LinkedIn About section here..." rows={4} style={textareaStyle(T)} />
        </div>
        <p style={hintStyle(T)}>Used to personalize tone and reference your expertise.</p>
      </Section>

      {/* Products & Goals */}
      <Section T={T} icon={Target} title="Products & Goals">
        <div>
          <label style={labelStyle(T)}>Products & Services</label>
          <textarea value={localProfile.products || ""} onChange={(e) => updateField("products", e.target.value)} placeholder="What you sell or promote..." rows={2} style={textareaStyle(T)} />
        </div>
        <div>
          <label style={labelStyle(T)}>Content Goals</label>
          <textarea value={localProfile.goals || ""} onChange={(e) => updateField("goals", e.target.value)} placeholder="What your LinkedIn presence should achieve..." rows={2} style={textareaStyle(T)} />
        </div>
      </Section>

      {/* Brands */}
      <Section T={T} icon={Briefcase} title="Brands">
        <p style={hintStyle(T)}>Each brand bundles visual identity, content voice, and hashtags. Set one as default — it loads automatically when you create.</p>
        <BrandEditor
          T={T}
          brands={localProfile.brands || []}
          onChange={(brands) => updateField("brands", brands)}
        />
      </Section>

      {/* Privacy */}
      <Section T={T} icon={Shield} title="Privacy & Storage">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Cloud History</div>
            <p style={hintStyle(T)}>
              {localProfile.historyEnabled !== false
                ? "Creations saved to your library in the cloud."
                : "History disabled. Only current work survives refresh (localStorage)."}
            </p>
          </div>
          <button
            onClick={() => updateField("historyEnabled", localProfile.historyEnabled === false ? true : false)}
            style={{
              width: 48, height: 28, borderRadius: 14, border: "none", cursor: "pointer",
              background: localProfile.historyEnabled !== false ? T.accent || "#0077b5" : "rgba(128,128,128,0.3)",
              position: "relative", transition: "background 0.2s", flexShrink: 0, marginLeft: 16,
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 11, background: "#fff",
              position: "absolute", top: 3,
              left: localProfile.historyEnabled !== false ? 23 : 3,
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }} />
          </button>
        </div>
      </Section>

      {/* Save */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleSave}
        disabled={saving}
        style={{
          background: saved ? "#22c55e" : T.gradient || T.accent,
          color: saved ? "#fff" : "#fff",
          border: "none", borderRadius: 14, padding: "16px 24px",
          fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700,
          cursor: saving ? "not-allowed" : "pointer",
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}
      >
        {saving ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
         : saved ? <><Check size={18} /> Saved!</>
         : <><Save size={18} /> Save Settings</>}
      </motion.button>
    </motion.div>
  );
}

function Section({ T, icon: Icon, title, children }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: T.text }}>
        <Icon size={14} style={{ color: T.accent }} />
        {title}
      </div>
      {children}
    </div>
  );
}

function labelStyle(T) {
  return { display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.muted, marginBottom: 4 };
}
function inputStyle(T) {
  return { background: T.bg, color: T.text, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 13px", fontFamily: "'Inter', sans-serif", fontSize: 14, width: "100%" };
}
function textareaStyle(T) {
  return { ...inputStyle(T), resize: "vertical", lineHeight: 1.6 };
}
function hintStyle(T) {
  return { fontSize: 10, color: T.muted, opacity: 0.7, margin: 0 };
}
