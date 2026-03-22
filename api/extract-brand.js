export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    const targetUrl = url.startsWith("http") ? url : `https://${url}`;
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ContentForge/1.0; +https://contentforge.app)",
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: `Failed to fetch: ${response.status}` });
    }

    const html = await response.text();
    const result = extractBrandData(html, targetUrl);

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Extraction failed" });
  }
}

function extractBrandData(html, url) {
  const colors = new Set();
  const fonts = new Set();

  // Extract meta theme-color
  const themeColorMatch = html.match(
    /<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i
  );
  if (themeColorMatch) colors.add(themeColorMatch[1].trim());

  // Extract meta msapplication-TileColor
  const tileColorMatch = html.match(
    /<meta[^>]*name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i
  );
  if (tileColorMatch) colors.add(tileColorMatch[1].trim());

  // Extract colors from inline styles and CSS
  const hexPattern = /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/g;
  const rgbPattern =
    /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+)?\s*\)/g;

  // Look for colors in style tags and inline styles
  const styleBlocks = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  const inlineStyles = html.match(/style=["'][^"']*["']/gi) || [];
  const colorSources = [...styleBlocks, ...inlineStyles].join(" ");

  let match;
  while ((match = hexPattern.exec(colorSources)) !== null) {
    colors.add(match[0].toLowerCase());
  }
  while ((match = rgbPattern.exec(colorSources)) !== null) {
    const hex = `#${[match[1], match[2], match[3]]
      .map((v) => parseInt(v).toString(16).padStart(2, "0"))
      .join("")}`;
    colors.add(hex);
  }

  // Extract CSS custom properties that look like colors
  const cssVarPattern =
    /--[\w-]*(?:color|bg|background|accent|primary|brand)[\w-]*\s*:\s*([^;}\n]+)/gi;
  while ((match = cssVarPattern.exec(html)) !== null) {
    const val = match[1].trim();
    if (val.startsWith("#")) colors.add(val.toLowerCase());
  }

  // Extract Google Fonts
  const gfPattern =
    /fonts\.googleapis\.com\/css2?\?family=([^"'&\s]+)/g;
  while ((match = gfPattern.exec(html)) !== null) {
    const families = decodeURIComponent(match[1]).split("|");
    families.forEach((f) => {
      const name = f.split(":")[0].replace(/\+/g, " ");
      if (name) fonts.add(name);
    });
  }

  // Extract font-family declarations
  const fontFamilyPattern = /font-family\s*:\s*["']?([^"';},]+)/gi;
  while ((match = fontFamilyPattern.exec(html)) !== null) {
    const name = match[1].trim().split(",")[0].trim().replace(/["']/g, "");
    if (
      name &&
      !["inherit", "initial", "unset", "serif", "sans-serif", "monospace", "cursive", "system-ui"].includes(
        name.toLowerCase()
      )
    ) {
      fonts.add(name);
    }
  }

  // Filter out common non-brand colors
  const filtered = [...colors].filter((c) => {
    const hex = c.toLowerCase();
    return (
      hex !== "#000000" &&
      hex !== "#000" &&
      hex !== "#ffffff" &&
      hex !== "#fff" &&
      hex !== "#333333" &&
      hex !== "#333" &&
      hex !== "#666666" &&
      hex !== "#666" &&
      hex !== "#999999" &&
      hex !== "#999" &&
      hex !== "#cccccc" &&
      hex !== "#ccc" &&
      hex !== "#f5f5f5" &&
      hex !== "#eeeeee" &&
      hex !== "#eee" &&
      hex !== "#e5e5e5"
    );
  });

  return {
    url,
    colors: filtered.slice(0, 12),
    fonts: [...fonts].slice(0, 6),
    themeColor: themeColorMatch ? themeColorMatch[1].trim() : null,
  };
}
