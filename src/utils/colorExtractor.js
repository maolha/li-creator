import { makeCustomVariants } from "./themes";

// Generate dark and light theme variants from a single accent color
export function themeFromAccent(accent) {
  if (!accent.match(/^#[0-9a-fA-F]{3,6}$/)) return null;
  return makeCustomVariants(accent);
}
