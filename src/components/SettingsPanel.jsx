import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Key,
  User,
  Hash,
  Target,
  Package,
  BookOpen,
  Heart,
  Plus,
  X,
  Loader2,
  Check,
  Shield,
} from "lucide-react";

export default function SettingsPanel({ T, user, profile, onSave, apiKey, onApiKeySave }) {
  const [localProfile, setLocalProfile] = useState({
    linkedinHeadline: "",
    linkedinAbout: "",
    products: "",
    narratives: "",
    beliefs: "",
    goals: "",
    defaultTone: "professional",
    defaultAudience: "general",
    defaultBrand: "",
    hashtagGroups: [],
    ...profile,
  });
  const [localApiKey, setLocalApiKey] = useState(apiKey || "");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupTags, setNewGroupTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setLocalProfile((prev) => ({ ...prev, ...profile }));
  }, [profile]);

  useEffect(() => {
    setLocalApiKey(apiKey || "");
  }, [apiKey]);

  function updateField(field, value) {
    setLocalProfile((prev) => ({ ...prev, [field]: value }));
  }

  function addHashtagGroup() {
    if (!newGroupName.trim() || !newGroupTags.trim()) return;
    const tags = newGroupTags.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean);
    updateField("hashtagGroups", [
      ...localProfile.hashtagGroups,
      { name: newGroupName.trim(), tags },
    ]);
    setNewGroupName("");
    setNewGroupTags("");
  }

  function removeHashtagGroup(index) {
    updateField(
      "hashtagGroups",
      localProfile.hashtagGroups.filter((_, i) => i !== index)
    );
  }

  async function handleSave() {
    setSaving(true);
    await onSave(localProfile);
    await onApiKeySave(localApiKey);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const ct = getContrastText(T.accent);

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
        <input
          type="password"
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
          placeholder="sk-ant-api03-..."
          style={{ ...inputStyle(T), fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
        />
        <p style={hintStyle(T)}>Your key is encrypted and stored securely. Never shared.</p>
      </Section>

      {/* About Me */}
      <Section T={T} icon={User} title="About Me">
        <div>
          <label style={labelStyle(T)}>LinkedIn Headline</label>
          <input
            type="text"
            value={localProfile.linkedinHeadline}
            onChange={(e) => updateField("linkedinHeadline", e.target.value)}
            placeholder="e.g. CEO at PAIA | AI for Swiss Financial Services | Building the future of compliance"
            style={inputStyle(T)}
          />
        </div>
        <div>
          <label style={labelStyle(T)}>LinkedIn About / Bio</label>
          <textarea
            value={localProfile.linkedinAbout}
            onChange={(e) => updateField("linkedinAbout", e.target.value)}
            placeholder="Paste your LinkedIn About section here. This helps the AI write in your voice, reference your experience, and match your personal brand."
            rows={6}
            style={textareaStyle(T)}
          />
        </div>
        <p style={hintStyle(T)}>Copy from your LinkedIn profile. Used to personalize tone, reference your expertise, and keep content on-brand.</p>
      </Section>

      {/* User Context */}
      <Section T={T} icon={Package} title="Your Products & Services">
        <textarea
          value={localProfile.products}
          onChange={(e) => updateField("products", e.target.value)}
          placeholder="e.g. AI-powered compliance platform for Swiss banks, Enterprise RAG solutions..."
          rows={3}
          style={textareaStyle(T)}
        />
        <p style={hintStyle(T)}>What you sell or promote. Used to make content relevant to your offerings.</p>
      </Section>

      <Section T={T} icon={Target} title="Key Narratives">
        <textarea
          value={localProfile.narratives}
          onChange={(e) => updateField("narratives", e.target.value)}
          placeholder="e.g. AI should augment humans not replace them, Swiss quality meets Silicon Valley speed..."
          rows={3}
          style={textareaStyle(T)}
        />
        <p style={hintStyle(T)}>The stories and angles you want to push. Shapes the tone of generated content.</p>
      </Section>

      <Section T={T} icon={Heart} title="Beliefs & Values">
        <textarea
          value={localProfile.beliefs}
          onChange={(e) => updateField("beliefs", e.target.value)}
          placeholder="e.g. Trust is the new currency, Regulation drives innovation, Build in public..."
          rows={3}
          style={textareaStyle(T)}
        />
        <p style={hintStyle(T)}>Your professional convictions. Makes your content authentically yours.</p>
      </Section>

      <Section T={T} icon={BookOpen} title="Content Goals">
        <textarea
          value={localProfile.goals}
          onChange={(e) => updateField("goals", e.target.value)}
          placeholder="e.g. Position as thought leader in Swiss fintech AI, drive inbound leads for consulting..."
          rows={3}
          style={textareaStyle(T)}
        />
        <p style={hintStyle(T)}>What you want your LinkedIn presence to achieve.</p>
      </Section>

      {/* AI Instructions */}
      <Section T={T} icon={BookOpen} title="AI Instructions">
        <textarea
          value={localProfile.aiInstructions || ""}
          onChange={(e) => updateField("aiInstructions", e.target.value)}
          placeholder={"e.g.\n- Always use active voice\n- Never use the word 'leverage'\n- Keep sentences under 20 words\n- Reference Swiss market specifically\n- Use 'we' not 'I' when talking about the company\n- Include a contrarian take in every post\n- End carousels with a question, not a statement"}
          rows={6}
          style={textareaStyle(T)}
        />
        <p style={hintStyle(T)}>Personal rules for the AI. These instructions are applied to every generation — tone, style, words to avoid, formatting preferences, etc.</p>
      </Section>

      {/* Privacy */}
      <Section T={T} icon={Shield} title="Privacy & Storage">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Cloud History</div>
            <p style={hintStyle(T)}>
              {localProfile.historyEnabled !== false
                ? "Creations are saved to your library in the cloud. You can browse, reload, and remix past content."
                : "History is disabled. Nothing is stored in the cloud. Only your current work survives page refresh (localStorage)."}
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
        {localProfile.historyEnabled === false && (
          <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(0,119,181,0.06)", borderRadius: 8, fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
            Your settings and profile are still synced. Only content creations (slides, posts, speaker visuals) are not stored in the cloud.
          </div>
        )}
      </Section>

      {/* Defaults */}
      <Section T={T} icon={User} title="Defaults">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle(T)}>Brand</label>
            <input
              type="text"
              value={localProfile.defaultBrand}
              onChange={(e) => updateField("defaultBrand", e.target.value)}
              placeholder="PAIA"
              style={inputStyle(T)}
            />
          </div>
          <div>
            <label style={labelStyle(T)}>Tone</label>
            <select value={localProfile.defaultTone} onChange={(e) => updateField("defaultTone", e.target.value)} style={{ ...inputStyle(T), cursor: "pointer" }}>
              {["professional", "provocative", "storytelling", "educational", "data-driven"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle(T)}>Audience</label>
            <select value={localProfile.defaultAudience} onChange={(e) => updateField("defaultAudience", e.target.value)} style={{ ...inputStyle(T), cursor: "pointer" }}>
              {["general", "c-suite", "developers", "marketers", "founders", "hr", "finance"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* Hashtag Groups */}
      <Section T={T} icon={Hash} title="Saved Hashtag Groups">
        {localProfile.hashtagGroups.map((group, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: T.soft,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: T.accent, minWidth: 80 }}>{group.name}</span>
            <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 4 }}>
              {group.tags.map((tag, j) => (
                <span
                  key={j}
                  style={{
                    fontSize: 11,
                    color: T.accent,
                    background: T.soft,
                    border: `1px solid ${T.border}`,
                    borderRadius: 4,
                    padding: "2px 6px",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => removeHashtagGroup(i)}
              style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group name"
            style={{ ...inputStyle(T), width: 120, fontSize: 13 }}
          />
          <input
            type="text"
            value={newGroupTags}
            onChange={(e) => setNewGroupTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            style={{ ...inputStyle(T), flex: 1, fontSize: 13 }}
            onKeyDown={(e) => { if (e.key === "Enter") addHashtagGroup(); }}
          />
          <button
            onClick={addHashtagGroup}
            style={{
              background: T.soft,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "0 12px",
              cursor: "pointer",
              color: T.accent,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Plus size={16} />
          </button>
        </div>
        <p style={hintStyle(T)}>Save groups of hashtags to quickly insert when creating content.</p>
      </Section>

      {/* Save button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleSave}
        disabled={saving}
        style={{
          background: saved ? "#22c55e" : T.gradient || T.accent,
          color: saved ? "#fff" : ct,
          border: "none",
          borderRadius: 14,
          padding: "16px 24px",
          fontFamily: "'Inter', sans-serif",
          fontSize: 15,
          fontWeight: 700,
          cursor: saving ? "not-allowed" : "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          transition: "all 0.3s",
        }}
      >
        {saving ? (
          <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
        ) : saved ? (
          <><Check size={18} /> Saved!</>
        ) : (
          <><Save size={18} /> Save Settings</>
        )}
      </motion.button>
    </motion.div>
  );
}

function Section({ T, icon: Icon, title, children }) {
  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: T.text }}>
        <Icon size={14} style={{ color: T.accent }} />
        {title}
      </div>
      {children}
    </div>
  );
}

function getContrastText(hex) {
  try {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const srgb = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    return 1.05 / (L + 0.05) > (L + 0.05) / 0.05 ? "#FFFFFF" : "#111111";
  } catch { return "#F5F5F5"; }
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
