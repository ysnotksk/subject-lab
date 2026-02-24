import { useState } from "react";
import * as htmlToImage from "html-to-image";
import { T } from "../../constants/tokens";

export default function ExportButtons({ targetRef, filename, lang }) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [error, setError] = useState(null);
  const opts = {
    backgroundColor: "#ffffff",
    pixelRatio: 2,
    style: { borderRadius: "0" },
  };

  const handleDownload = async () => {
    if (!targetRef?.current || exporting) return;
    setExporting("download");
    setError(null);
    try {
      const url = await htmlToImage.toPng(targetRef.current, opts);
      const a = document.createElement("a");
      a.download = `${filename}.png`;
      a.href = url;
      a.click();
    } catch (e) {
      setError(lang === "ja" ? "エクスポート失敗" : "Export failed");
      setTimeout(() => setError(null), 3000);
    } finally {
      setExporting(null);
    }
  };

  const handleCopy = async () => {
    if (!targetRef?.current || exporting) return;
    setExporting("copy");
    setError(null);
    try {
      const blob = await htmlToImage.toBlob(targetRef.current, opts);
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setError(lang === "ja" ? "コピー失敗" : "Copy failed");
      setTimeout(() => setError(null), 3000);
    } finally {
      setExporting(null);
    }
  };

  const btnClass = "export-btn";

  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .${btnClass} { background: none; border: none; color: ${T.textMuted}; cursor: pointer; font-size: 12px; padding: 4px 6px; border-radius: 4px; transition: color 0.15s, background 0.15s; }
        .${btnClass}:hover { color: ${T.accent}; background: ${T.bg}; }
      `,
        }}
      />
      <button
        className={btnClass}
        onClick={handleCopy}
        disabled={!!exporting}
        title={lang === "ja" ? "クリップボードにコピー" : "Copy to clipboard"}
        aria-label={
          lang === "ja" ? "クリップボードにコピー" : "Copy to clipboard"
        }
      >
        {exporting === "copy" ? "\u22ef" : copied ? "\u2713" : "\u29c9"}
      </button>
      <button
        className={btnClass}
        onClick={handleDownload}
        disabled={!!exporting}
        title={lang === "ja" ? "PNGダウンロード" : "Download PNG"}
        aria-label={lang === "ja" ? "PNGダウンロード" : "Download PNG"}
      >
        {exporting === "download" ? "\u22ef" : "\u2193"}
      </button>
      {error && (
        <span style={{ fontSize: 10, color: T.danger, marginLeft: 4 }}>
          {error}
        </span>
      )}
    </div>
  );
}
