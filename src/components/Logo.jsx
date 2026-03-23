// ContentForge logo variants — inline SVG monograms

// Variant A: Shared vertical stroke — C flows into F
export function LogoA({ size = 32, rounded = 8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cfgradA" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#0077B5" />
          <stop offset="100%" stopColor="#571BC1" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx={rounded} fill="url(#cfgradA)" />
      {/* C */}
      <path d="M22 14C16.5 14 12 18.5 12 24C12 29.5 16.5 34 22 34C24.5 34 26.8 33 28.5 31.5" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* F — shares the vertical with C's opening */}
      <line x1="28" y1="14" x2="28" y2="34" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="28" y1="14" x2="37" y2="14" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="28" y1="23" x2="35" y2="23" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

// Variant B: Geometric — C wraps around a bold F block
export function LogoB({ size = 32, rounded = 8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cfgradB" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#0077B5" />
          <stop offset="100%" stopColor="#571BC1" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx={rounded} fill="url(#cfgradB)" />
      {/* C as an arc */}
      <path d="M20 13C13.4 13 8 18.4 8 25C8 31.6 13.4 37 20 37C23.2 37 26 35.6 28 33.5" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* F as solid block lines */}
      <rect x="26" y="13" width="3" height="24" rx="1.5" fill="white" />
      <rect x="26" y="13" width="14" height="3" rx="1.5" fill="white" />
      <rect x="26" y="23.5" width="10" height="3" rx="1.5" fill="white" />
    </svg>
  );
}

// Variant C: Stacked — C above F, tight monogram block
export function LogoC({ size = 32, rounded = 8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cfgradC" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#0077B5" />
          <stop offset="100%" stopColor="#571BC1" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx={rounded} fill="url(#cfgradC)" />
      {/* Interlocking CF — the F's vertical is the C's right edge */}
      <path d="M14 16C14 11.6 17.6 8 22 8H34V12H22C19.8 12 18 13.8 18 16V22H28V26H18V40H14V16Z" fill="white" />
      <rect x="28" y="22" width="6" height="4" rx="1" fill="white" opacity="0.5" />
    </svg>
  );
}

// Variant D: Minimal slash — C/F with a forward-leaning energy
export function LogoD({ size = 32, rounded = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cfgradD" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#0077B5" />
          <stop offset="100%" stopColor="#571BC1" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx={rounded} fill="url(#cfgradD)" />
      {/* C */}
      <path d="M21 12C14.9 12 10 16.9 10 23C10 29.1 14.9 34 21 34" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Diagonal slash */}
      <line x1="26" y1="36" x2="30" y2="10" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
      {/* F */}
      <line x1="32" y1="12" x2="32" y2="34" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <line x1="32" y1="12" x2="40" y2="12" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <line x1="32" y1="22.5" x2="38" y2="22.5" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

// Default export — use Variant A as primary
export default LogoA;
