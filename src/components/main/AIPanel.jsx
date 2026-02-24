import { useState, useEffect, useRef } from "react";
import { T } from "../../constants/tokens";
import { DEVICES } from "../../constants/devices";
import { NOTIF_DEVICES } from "../../constants/devices";
import { INDUSTRY_EMAILS } from "../../constants/emails";
import { load, save } from "../../utils/storage";
import SectionHeader from "../common/SectionHeader";
import SmallButton from "../common/SmallButton";
import ExportButtons from "../common/ExportButtons";

const PROVIDER_MODELS = {
  openai: [
    { id: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
    { id: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
    { id: "gpt-4.1", label: "GPT-4.1" },
  ],
  anthropic: [
    { id: "claude-haiku-4-5-20251001", label: "Claude 4.5 Haiku" },
    { id: "claude-sonnet-4-5-20250514", label: "Claude 4.5 Sonnet" },
    { id: "claude-opus-4-20250514", label: "Claude Opus 4" },
  ],
  gemini: [
    { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { id: "gemini-2.5-pro-preview-06-05", label: "Gemini 2.5 Pro" },
  ],
};

export default function AIPanel({
  sender,
  subject,
  preview,
  lang,
  candidates,
  industry,
}) {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState(PROVIDER_MODELS.openai[0].id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(() =>
    load("customPrompt", null),
  );

  const resultRef = useRef(null);

  useEffect(() => save("customPrompt", customPrompt), [customPrompt]);

  const exportMarkdown = () => {
    if (!result) return;
    const lines = [
      `# ${lang === "ja" ? "AI 件名分析" : "AI Subject Line Analysis"}`,
      "",
      `**${lang === "ja" ? "件名" : "Subject"}:** ${subject}`,
      `**${lang === "ja" ? "差出人" : "Sender"}:** ${sender}`,
      preview
        ? `**${lang === "ja" ? "プレビュー" : "Preview"}:** ${preview}`
        : "",
      "",
      `## ${lang === "ja" ? "切れ位置" : "Truncation"}`,
      result.truncation_advice || "",
      "",
      `## ${lang === "ja" ? "差別化" : "Differentiation"}`,
      result.differentiation_advice || "",
      "",
      `## ${lang === "ja" ? "プレビュー連携" : "Preview Synergy"}`,
      result.preview_text_advice || "",
      "",
      `## ${lang === "ja" ? "代替案" : "Alternatives"}`,
      ...(result.alternatives || []).flatMap((alt, i) => [
        `### ${i + 1}. "${alt.subject}"`,
        alt.rationale,
        `> ${alt.best_for}`,
        "",
      ]),
    ]
      .filter((l) => l !== undefined)
      .join("\n");
    const blob = new Blob([lines], { type: "text/markdown" });
    const a = document.createElement("a");
    a.download = "ai-analysis.md";
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const pool = INDUSTRY_EMAILS[industry]?.[lang] || INDUSTRY_EMAILS.ec[lang];
  const dummySubs = pool.slice(0, 8).map((d) => d.subject);

  const buildPrompt = () => {
    const deviceInfo = DEVICES.map((d) => {
      const m = lang === "ja" ? d.subjectCharsJa : d.subjectCharsEn;
      return `${d.name}: ${(subject || "").length > m ? "TRUNCATED at " + m : "OK"}`;
    }).join("\n");
    const notifInfo = NOTIF_DEVICES.map((d) => {
      const m = lang === "ja" ? d.subjectCharsJa : d.subjectCharsEn;
      return `${d.name[lang]}: ${(subject || "").length > m ? "TRUNCATED" : "OK"}`;
    }).join("\n");
    const langLabel = lang === "ja" ? "Japanese" : "English";
    return `Expert email subject line consultant. Language: ${langLabel}. Industry: ${INDUSTRY_EMAILS[industry]?.label[lang]}. Sender: "${sender}". Subject: "${subject}". Preview: "${preview}". DEVICES:\n${deviceInfo}\nNOTIFICATIONS:\n${notifInfo}\nCOMPETING:\n${dummySubs.join("\n")}\n${
      candidates.length > 1
        ? "OTHER CANDIDATES:\n" +
          candidates
            .filter((c) => c.subject !== subject)
            .map((c) => c.subject)
            .join("\n")
        : ""
    }\nRespond in ${langLabel} as JSON: {"truncation_advice":"...","differentiation_advice":"...","preview_text_advice":"...","alternatives":[{"subject":"...","rationale":"...","best_for":"..."},{"subject":"...","rationale":"...","best_for":"..."},{"subject":"...","rationale":"...","best_for":"..."}]}`;
  };

  const analyze = async () => {
    if (!apiKey || !subject) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const promptText = customPrompt || buildPrompt();
    try {
      let data;
      if (provider === "openai") {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: promptText }],
            temperature: 0.7,
            response_format: { type: "json_object" },
          }),
        });
        data = await res.json();
        if (data.error) throw new Error(data.error.message);
        setResult(JSON.parse(data.choices[0].message.content));
      } else if (provider === "anthropic") {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model,
            max_tokens: 2000,
            messages: [
              {
                role: "user",
                content: promptText + "\nRespond ONLY with valid JSON.",
              },
            ],
          }),
        });
        data = await res.json();
        if (data.error) throw new Error(data.error.message);
        setResult(
          JSON.parse(
            data.content[0].text.replace(/```json\n?|```\n?/g, "").trim(),
          ),
        );
      } else {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: buildPrompt() + "\nRespond ONLY with valid JSON.",
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
              },
            }),
          },
        );
        data = await res.json();
        if (data.error) throw new Error(data.error.message);
        setResult(
          JSON.parse(
            data.candidates[0].content.parts[0].text
              .replace(/```json\n?|```\n?/g, "")
              .trim(),
          ),
        );
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: "7px 10px",
    borderRadius: 6,
    border: `1px solid ${T.border}`,
    fontSize: 12,
    fontFamily: T.font,
    background: T.surface,
    color: T.text,
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div>
      <SectionHeader title={lang === "ja" ? "AI 分析" : "AI Analysis"} />
      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        <select
          value={provider}
          onChange={(e) => {
            const p = e.target.value;
            setProvider(p);
            setModel(PROVIDER_MODELS[p][0].id);
          }}
          aria-label={lang === "ja" ? "AIプロバイダー" : "AI provider"}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="gemini">Gemini</option>
        </select>
        <input
          list={`models-${provider}`}
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={PROVIDER_MODELS[provider][0].label}
          aria-label={lang === "ja" ? "モデル" : "Model"}
          style={{ ...inputStyle, minWidth: 140 }}
        />
        <datalist id={`models-${provider}`}>
          {PROVIDER_MODELS[provider].map((m) => (
            <option key={m.id} value={m.id} label={m.label} />
          ))}
        </datalist>
        <input
          type="password"
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          aria-label="API Key"
          style={{ ...inputStyle, flex: 1, minWidth: 160 }}
        />
        <SmallButton
          onClick={analyze}
          disabled={loading || !apiKey || !subject}
          active
        >
          {loading
            ? lang === "ja"
              ? "分析中\u2026"
              : "Analyzing\u2026"
            : lang === "ja"
              ? "分析する"
              : "Analyze"}
        </SmallButton>
      </div>

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          style={{
            background: "none",
            border: "none",
            fontSize: 11,
            fontWeight: 500,
            color: T.textMuted,
            cursor: "pointer",
            padding: "4px 0",
            fontFamily: T.font,
          }}
        >
          {showPrompt
            ? lang === "ja"
              ? "\u25bc プロンプトを隠す"
              : "\u25bc Hide prompt"
            : lang === "ja"
              ? "\u25b6 プロンプトを表示"
              : "\u25b6 Show prompt"}
        </button>
        {showPrompt && (
          <div style={{ marginTop: 6 }}>
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 6,
                alignItems: "center",
              }}
            >
              <SmallButton
                onClick={() => setEditingPrompt(!editingPrompt)}
                active={editingPrompt}
                style={{ padding: "3px 8px", fontSize: 10 }}
              >
                {editingPrompt
                  ? lang === "ja"
                    ? "読み取り専用"
                    : "Read-only"
                  : lang === "ja"
                    ? "編集"
                    : "Edit"}
              </SmallButton>
              {customPrompt !== null && (
                <SmallButton
                  onClick={() => {
                    setCustomPrompt(null);
                    setEditingPrompt(false);
                  }}
                  style={{ padding: "3px 8px", fontSize: 10 }}
                >
                  {lang === "ja" ? "リセット" : "Reset"}
                </SmallButton>
              )}
              {customPrompt !== null && (
                <span
                  style={{
                    fontSize: 10,
                    color: T.accent,
                    fontWeight: 500,
                  }}
                >
                  {lang === "ja" ? "カスタム" : "Custom"}
                </span>
              )}
            </div>
            <textarea
              readOnly={!editingPrompt}
              value={customPrompt || buildPrompt()}
              onChange={(e) => setCustomPrompt(e.target.value)}
              style={{
                width: "100%",
                minHeight: 120,
                maxHeight: 240,
                padding: 10,
                borderRadius: T.radius,
                border: `1px solid ${editingPrompt ? T.accent : T.border}`,
                fontSize: 11,
                fontFamily: "monospace",
                lineHeight: 1.5,
                background: editingPrompt ? T.surface : T.bg,
                color: T.text,
                resize: "vertical",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
            />
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            background: T.dangerLight,
            border: `1px solid ${T.dangerBorder}`,
            borderRadius: T.radius,
            padding: 10,
            fontSize: 12,
            color: T.danger,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                padding: 16,
                background: T.bg,
                borderRadius: T.radius,
                border: `1px solid ${T.borderSubtle}`,
              }}
            >
              <div
                style={{
                  height: 10,
                  width: 80,
                  background: T.border,
                  borderRadius: 4,
                  marginBottom: 8,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  height: 12,
                  width: "90%",
                  background: T.borderSubtle,
                  borderRadius: 4,
                  marginBottom: 4,
                  animation: "pulse 1.5s ease-in-out 0.2s infinite",
                }}
              />
              <div
                style={{
                  height: 12,
                  width: "70%",
                  background: T.borderSubtle,
                  borderRadius: 4,
                  animation: "pulse 1.5s ease-in-out 0.4s infinite",
                }}
              />
            </div>
          ))}
          <style
            dangerouslySetInnerHTML={{
              __html:
                "@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }",
            }}
          />
        </div>
      )}
      {!result && !loading && !error && (
        <div
          style={{
            padding: "24px 16px",
            textAlign: "center",
            border: `1px dashed ${T.border}`,
            borderRadius: T.radius,
            color: T.textMuted,
            fontSize: 12,
          }}
        >
          {lang === "ja"
            ? "APIキーを入力して分析を実行"
            : "Enter API key to run analysis"}
        </div>
      )}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              display: "flex",
              gap: 4,
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <ExportButtons
              targetRef={resultRef}
              filename="ai-analysis"
              lang={lang}
            />
            <button
              onClick={exportMarkdown}
              title={
                lang === "ja" ? "Markdownダウンロード" : "Download Markdown"
              }
              style={{
                background: "none",
                border: "none",
                color: T.textMuted,
                cursor: "pointer",
                fontSize: 11,
                padding: "4px 6px",
                borderRadius: 4,
                fontFamily: T.font,
                fontWeight: 500,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.color = T.accent)}
              onMouseLeave={(e) => (e.target.style.color = T.textMuted)}
            >
              .md
            </button>
          </div>
          <div
            ref={resultRef}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {[
              {
                label: lang === "ja" ? "切れ位置" : "Truncation",
                content: result.truncation_advice,
              },
              {
                label: lang === "ja" ? "差別化" : "Differentiation",
                content: result.differentiation_advice,
              },
              {
                label: lang === "ja" ? "プレビュー連携" : "Preview synergy",
                content: result.preview_text_advice,
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: 14,
                  background: T.bg,
                  borderRadius: T.radius,
                  border: `1px solid ${T.borderSubtle}`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: T.accent,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: T.textSecondary,
                    lineHeight: 1.65,
                  }}
                >
                  {item.content}
                </div>
              </div>
            ))}
            <div
              style={{
                padding: 14,
                background: T.accentLight,
                borderRadius: T.radius,
                border: `1px solid ${T.accentBorder}`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: T.accentDark,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 10,
                }}
              >
                {lang === "ja" ? "代替案" : "Alternatives"}
              </div>
              {(result.alternatives || []).map((alt, i) => (
                <div
                  key={i}
                  style={{
                    background: T.surface,
                    borderRadius: 6,
                    padding: 12,
                    marginBottom:
                      i < (result.alternatives || []).length - 1 ? 8 : 0,
                    border: `1px solid ${T.successBorder}`,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: T.text,
                      marginBottom: 4,
                    }}
                  >
                    "{alt.subject}"
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: T.textSecondary,
                      marginBottom: 3,
                    }}
                  >
                    {alt.rationale}
                  </div>
                  <div
                    style={{ fontSize: 11, color: T.accent, fontWeight: 600 }}
                  >
                    {alt.best_for}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
