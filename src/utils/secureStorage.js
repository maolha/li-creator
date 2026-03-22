const STORAGE_KEY = "cf_api_key_enc";
const SALT_KEY = "cf_api_key_salt";

async function getDerivedKey(salt) {
  // Use a device-bound passphrase derived from origin + user agent
  const passphrase = new TextEncoder().encode(
    window.location.origin + navigator.userAgent
  );
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passphrase,
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function saveApiKey(apiKey) {
  if (!apiKey) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SALT_KEY);
    return;
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getDerivedKey(salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(apiKey)
  );

  // Store iv + ciphertext together
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  localStorage.setItem(STORAGE_KEY, btoa(String.fromCharCode(...combined)));
  localStorage.setItem(SALT_KEY, btoa(String.fromCharCode(...salt)));
}

export async function loadApiKey() {
  const encB64 = localStorage.getItem(STORAGE_KEY);
  const saltB64 = localStorage.getItem(SALT_KEY);
  if (!encB64 || !saltB64) {
    // Migrate from old plain-text storage
    const plain = localStorage.getItem("cf_api_key");
    if (plain) {
      await saveApiKey(plain);
      localStorage.removeItem("cf_api_key");
      return plain;
    }
    return "";
  }

  try {
    const combined = Uint8Array.from(atob(encB64), (c) => c.charCodeAt(0));
    const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const key = await getDerivedKey(salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    // Decryption failed (different browser/device) — clear and start fresh
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SALT_KEY);
    return "";
  }
}
