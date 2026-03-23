export function createBrand(overrides = {}) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
    name: "My Brand",
    colors: {
      primary: "#0077B5",
      secondary: "#571BC1",
      dark: "#0a0c10",
      light: "#f4f5f7",
    },
    logos: {
      light: null,  // logo URL/base64 for dark backgrounds
      dark: null,    // logo URL/base64 for light backgrounds
    },
    fonts: {
      heading: "",   // empty = use default DM Serif Display
      body: "",      // empty = use default Inter
    },
    voice: {
      tone: "professional",
      audience: "general",
      products: "",
      narratives: "",
      beliefs: "",
      aiInstructions: "",
    },
    hashtagGroups: [],
    isDefault: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

export function brandDisplayName(brand) {
  if (!brand) return "";
  if (typeof brand === "string") return brand;
  return brand.name || "";
}

// Get the accent color (primary) for theme generation
export function brandAccent(brand) {
  if (!brand) return null;
  return brand.colors?.primary || brand.colors?.accent || null;
}
