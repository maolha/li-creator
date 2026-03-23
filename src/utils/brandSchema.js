export function createBrand(overrides = {}) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
    name: "My Brand",
    colors: { accent: "#0077B5", gradient: null },
    voice: {
      tone: "professional",
      audience: "general",
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
