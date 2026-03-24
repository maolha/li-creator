export const SS = 540; // internal slide canvas size (px)

export const ACCEPTED_FILE_TYPES = {
  "application/pdf": true,
  "image/jpeg": true,
  "image/png": true,
  "image/webp": true,
};

export const FILE_ICONS = {
  "application/pdf": "PDF",
  "image/jpeg": "IMG",
  "image/png": "IMG",
  "image/webp": "IMG",
};

export const toBase64 = (f) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(f);
  });
