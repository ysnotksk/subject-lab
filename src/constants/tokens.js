export const T = {
  bg: "#fafaf9",
  surface: "#ffffff",
  surfaceRaised: "#ffffff",
  border: "#e7e5e4",
  borderSubtle: "#f5f5f4",
  text: "#1c1917",
  textSecondary: "#57534e",
  textMuted: "#a8a29e",
  accent: "#0d9488",
  accentLight: "#ccfbf1",
  accentDark: "#115e59",
  danger: "#dc2626",
  dangerLight: "#fef2f2",
  success: "#059669",
  successLight: "#ecfdf5",
  warning: "#d97706",
  warningLight: "#fefce8",
  successBorder: "#bbf7d0",
  accentBorder: "#99f6e4",
  dangerBorder: "#fecaca",
  shadow: "0 1px 2px rgba(28,25,23,0.04), 0 1px 3px rgba(28,25,23,0.06)",
  shadowMd: "0 2px 4px rgba(28,25,23,0.04), 0 4px 12px rgba(28,25,23,0.06)",
  radius: 8,
  radiusLg: 12,
  font: "'DM Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif",
  fontDisplay: "'Newsreader', 'Hiragino Mincho ProN', serif",
};

export const linkStyle = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600&display=swap');
* { box-sizing: border-box; }
::selection { background: ${T.accentLight}; color: ${T.accentDark}; }
input:focus, textarea:focus, select:focus { outline: none; border-color: ${T.accent} !important; box-shadow: 0 0 0 3px rgba(13,148,136,0.08) !important; }
button { font-family: ${T.font}; }
button:focus-visible { outline: 2px solid ${T.accent}; outline-offset: 2px; }
button:active:not(:disabled) { transform: scale(0.97); }
`;
