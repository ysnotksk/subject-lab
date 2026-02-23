export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function truncate(text, maxLen) {
  if (!text) return "";
  return text.length <= maxLen ? text : text.slice(0, maxLen) + "\u2026";
}

export function senderColor(sender) {
  const palette = [
    "#0d9488",
    "#7c3aed",
    "#db2777",
    "#ea580c",
    "#2563eb",
    "#059669",
    "#dc2626",
    "#0891b2",
    "#4f46e5",
    "#ca8a04",
    "#9333ea",
    "#16a34a",
  ];
  let h = 0;
  for (let i = 0; i < sender.length; i++)
    h = sender.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}
