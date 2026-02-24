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
  ollama: [
    { id: "qwen3:1.7b", label: "Qwen 3 1.7B" },
    { id: "qwen3:8b", label: "Qwen 3 8B" },
    { id: "gemma3:4b", label: "Gemma 3 4B" },
    { id: "llama3.2", label: "Llama 3.2" },
    { id: "phi4-mini", label: "Phi-4 Mini" },
  ],
  openai: [
    { id: "gpt-4.1-nano", label: "GPT-4.1 Nano — $0.10/M" },
    { id: "gpt-4.1-mini", label: "GPT-4.1 Mini — $0.40/M" },
    { id: "gpt-4.1", label: "GPT-4.1 — $2.00/M" },
    { id: "gpt-4o-mini", label: "GPT-4o Mini — $0.15/M" },
    { id: "gpt-4o", label: "GPT-4o — $2.50/M" },
    { id: "o4-mini", label: "o4-mini — $1.10/M" },
    { id: "o3", label: "o3 — reasoning" },
    { id: "o3-pro", label: "o3-pro — reasoning" },
  ],
  anthropic: [
    { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5 — $0.80/M" },
    { id: "claude-sonnet-4-5-20250514", label: "Sonnet 4.5 — $3.00/M" },
    { id: "claude-sonnet-4-6", label: "Sonnet 4.6 — $3.00/M" },
    { id: "claude-opus-4-20250514", label: "Opus 4 — $15.00/M" },
    { id: "claude-opus-4-6", label: "Opus 4.6 — $15.00/M" },
  ],
  gemini: [
    { id: "gemini-2.0-flash-lite", label: "2.0 Flash Lite — Free tier" },
    { id: "gemini-2.0-flash", label: "2.0 Flash — Free tier" },
    { id: "gemini-2.5-flash", label: "2.5 Flash — $0.15/M" },
    { id: "gemini-2.5-pro", label: "2.5 Pro — $1.25/M" },
    { id: "gemini-3-flash-preview", label: "3 Flash (preview)" },
    { id: "gemini-3-pro-preview", label: "3 Pro (preview)" },
  ],
};

const isOllamaLike = (provider) => provider === "ollama";

/** Extract and parse JSON from LLM response that may contain markdown or prose */
const extractJSON = (raw) => {
  // Try direct parse first
  try {
    return JSON.parse(raw);
  } catch {}
  // Strip markdown code fences
  let cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "");
  // Try to find JSON object/array
  const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {}
  }
  throw new Error(
    `Failed to parse JSON from response: ${raw.slice(0, 120)}...`,
  );
};

export default function AIPanel({
  sender,
  subject,
  preview,
  lang,
  candidates,
  industry,
  updateActive,
  addCandidateFrom,
  candidatesCount,
}) {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("ollama");
  const [model, setModel] = useState(PROVIDER_MODELS.ollama[0].id);
  const [ollamaEndpoint, setOllamaEndpoint] = useState(() =>
    load("ollamaEndpoint", "http://localhost:11434"),
  );
  const [ollamaModels, setOllamaModels] = useState([]);
  const [ollamaStatus, setOllamaStatus] = useState("unknown"); // "unknown" | "connected" | "error"
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(() =>
    load("customPrompt", null),
  );
  const [mode, setMode] = useState("analyze");
  const [genIntent, setGenIntent] = useState("");
  const [genCount, setGenCount] = useState(5);
  const [genResult, setGenResult] = useState(null);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState(null);

  const resultRef = useRef(null);

  useEffect(() => save("ollamaEndpoint", ollamaEndpoint), [ollamaEndpoint]);

  const fetchOllamaModels = (endpoint) => {
    const base = endpoint.replace(/\/+$/, "");
    setOllamaStatus("unknown");
    fetch(`${base}/api/tags`)
      .then((r) => r.json())
      .then((data) => {
        const models = (data.models || []).map((m) => ({
          id: m.name,
          label: m.name,
        }));
        setOllamaModels(models);
        setOllamaStatus("connected");
        if (models.length && !models.find((m) => m.id === model)) {
          setModel(models[0].id);
        }
      })
      .catch(() => {
        setOllamaModels([]);
        setOllamaStatus("error");
      });
  };

  useEffect(() => {
    if (!isOllamaLike(provider)) return;
    fetchOllamaModels(ollamaEndpoint);
  }, [provider]);

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
    if ((!apiKey && !isOllamaLike(provider)) || !subject) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const promptText = customPrompt || buildPrompt();
    try {
      let data;
      if (provider === "openai" || isOllamaLike(provider)) {
        const url = isOllamaLike(provider)
          ? `${ollamaEndpoint.replace(/\/+$/, "")}/v1/chat/completions`
          : "https://api.openai.com/v1/chat/completions";
        const headers = { "Content-Type": "application/json" };
        if (!isOllamaLike(provider)) headers.Authorization = `Bearer ${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: promptText }],
            temperature: 0.7,
            ...(isOllamaLike(provider)
              ? {}
              : { response_format: { type: "json_object" } }),
          }),
        });
        data = await res.json();
        if (data.error) throw new Error(data.error.message);
        const raw = data.choices[0].message.content;
        setResult(extractJSON(raw));
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
        setResult(extractJSON(data.content[0].text));
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
        setResult(extractJSON(data.candidates[0].content.parts[0].text));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const buildGenPrompt = () => {
    const langLabel = lang === "ja" ? "Japanese" : "English";
    const industryLabel = INDUSTRY_EMAILS[industry]?.label[lang];
    return `Expert email copywriter. Language: ${langLabel}. Industry: ${industryLabel}. Sender: "${sender}".
User intent: "${genIntent}".
Competing subjects in this inbox:
${dummySubs.join("\n")}
Generate ${genCount} distinct subject + preview text pairs with different angles.
Respond as JSON: {"variants":[{"subject":"...","preview":"...","rationale":"..."}]}`;
  };

  const generate = async () => {
    if ((!apiKey && !isOllamaLike(provider)) || !genIntent) return;
    setGenLoading(true);
    setGenError(null);
    setGenResult(null);
    const promptText = buildGenPrompt();
    try {
      let data;
      if (provider === "openai" || isOllamaLike(provider)) {
        const url = isOllamaLike(provider)
          ? `${ollamaEndpoint.replace(/\/+$/, "")}/v1/chat/completions`
          : "https://api.openai.com/v1/chat/completions";
        const headers = { "Content-Type": "application/json" };
        if (!isOllamaLike(provider)) headers.Authorization = `Bearer ${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: promptText }],
            temperature: 0.9,
            ...(isOllamaLike(provider)
              ? {}
              : { response_format: { type: "json_object" } }),
          }),
        });
        data = await res.json();
        if (data.error) throw new Error(data.error.message);
        const raw = data.choices[0].message.content;
        setGenResult(extractJSON(raw));
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
        setGenResult(extractJSON(data.content[0].text));
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
                    { text: promptText + "\nRespond ONLY with valid JSON." },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.9,
                responseMimeType: "application/json",
              },
            }),
          },
        );
        data = await res.json();
        if (data.error) throw new Error(data.error.message);
        setGenResult(extractJSON(data.candidates[0].content.parts[0].text));
      }
    } catch (e) {
      setGenError(e.message);
    } finally {
      setGenLoading(false);
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
      <SectionHeader title={lang === "ja" ? "AI" : "AI"} />

      {/* Mode toggle */}
      <div
        style={{
          display: "flex",
          gap: 2,
          marginBottom: 14,
          background: T.bg,
          borderRadius: 8,
          padding: 3,
          border: `1px solid ${T.border}`,
        }}
      >
        {[
          { key: "analyze", label: lang === "ja" ? "分析" : "Analyze" },
          { key: "generate", label: lang === "ja" ? "生成" : "Generate" },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            style={{
              flex: 1,
              padding: "5px 10px",
              borderRadius: 6,
              border: "none",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: T.font,
              background: mode === m.key ? T.surface : "transparent",
              color: mode === m.key ? T.text : T.textMuted,
              boxShadow: mode === m.key ? T.shadow : "none",
              transition: "all 0.15s",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Shared config */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 16,
          padding: 12,
          background: T.bg,
          borderRadius: T.radius,
          border: `1px solid ${T.borderSubtle}`,
        }}
      >
        {/* Row 1: Provider + Model */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={provider}
            onChange={(e) => {
              const p = e.target.value;
              setProvider(p);
              if (p === "ollama" && ollamaModels.length) {
                setModel(ollamaModels[0].id);
              } else {
                setModel(PROVIDER_MODELS[p][0].id);
              }
            }}
            aria-label={lang === "ja" ? "AIプロバイダー" : "AI provider"}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="ollama">Ollama / Local</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="gemini">Gemini</option>
          </select>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            aria-label={lang === "ja" ? "モデル" : "Model"}
            style={{ ...inputStyle, flex: 1, cursor: "pointer" }}
          >
            {(isOllamaLike(provider) && ollamaModels.length
              ? ollamaModels
              : PROVIDER_MODELS[provider]
            ).map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: Endpoint (Ollama) or API Key */}
        {isOllamaLike(provider) ? (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span
              style={{
                fontSize: 10,
                color: T.textMuted,
                fontWeight: 600,
                flexShrink: 0,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              URL
            </span>
            <input
              type="text"
              value={ollamaEndpoint}
              onChange={(e) => setOllamaEndpoint(e.target.value)}
              onBlur={() => fetchOllamaModels(ollamaEndpoint)}
              onKeyDown={(e) =>
                e.key === "Enter" && fetchOllamaModels(ollamaEndpoint)
              }
              placeholder="http://localhost:11434"
              aria-label="Endpoint URL"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={() => fetchOllamaModels(ollamaEndpoint)}
              title={lang === "ja" ? "モデル再取得" : "Refresh models"}
              style={{
                background: "none",
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: "5px 8px",
                cursor: "pointer",
                fontSize: 12,
                lineHeight: 1,
                color: T.textMuted,
              }}
            >
              ↻
            </button>
            <span
              title={
                ollamaStatus === "connected"
                  ? `${ollamaModels.length} ${lang === "ja" ? "モデル検出" : "models found"}`
                  : ollamaStatus === "error"
                    ? lang === "ja"
                      ? "接続失敗"
                      : "Connection failed"
                    : ""
              }
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                flexShrink: 0,
                background:
                  ollamaStatus === "connected"
                    ? T.success
                    : ollamaStatus === "error"
                      ? T.danger
                      : T.border,
                transition: "background 0.2s",
              }}
            />
          </div>
        ) : (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span
              style={{
                fontSize: 10,
                color: T.textMuted,
                fontWeight: 600,
                flexShrink: 0,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              KEY
            </span>
            <input
              type="password"
              placeholder="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              aria-label="API Key"
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        )}

        {/* Action button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {mode === "analyze" ? (
            <SmallButton
              onClick={analyze}
              disabled={
                loading || (!apiKey && !isOllamaLike(provider)) || !subject
              }
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
          ) : (
            <SmallButton
              onClick={generate}
              disabled={
                genLoading || (!apiKey && !isOllamaLike(provider)) || !genIntent
              }
              active
            >
              {genLoading
                ? lang === "ja"
                  ? "生成中\u2026"
                  : "Generating\u2026"
                : lang === "ja"
                  ? "生成する"
                  : "Generate"}
            </SmallButton>
          )}
        </div>
      </div>

      {/* ── Analyze mode ── */}
      {mode === "analyze" && (
        <>
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
                padding: 12,
                fontSize: 12,
                color: T.danger,
                marginBottom: 12,
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {lang === "ja" ? "エラー" : "Error"}
              </div>
              <div>{error}</div>
              {isOllamaLike(provider) &&
                error.match(/fetch|network|refused|CORS/i) && (
                  <div
                    style={{ marginTop: 6, fontSize: 11, color: T.textMuted }}
                  >
                    {lang === "ja"
                      ? "Ollamaが起動していない可能性があります。ターミナルで ollama serve を実行してください。"
                      : "Ollama may not be running. Try running 'ollama serve' in your terminal."}
                  </div>
                )}
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
                padding: "20px 16px",
                border: `1px dashed ${T.border}`,
                borderRadius: T.radius,
                color: T.textMuted,
                fontSize: 12,
                lineHeight: 1.8,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 6,
                  color: T.textSecondary,
                }}
              >
                {lang === "ja" ? "使い方" : "How to use"}
              </div>
              {isOllamaLike(provider) ? (
                <ol style={{ margin: 0, paddingLeft: 18 }}>
                  <li>
                    {lang === "ja"
                      ? "Ollamaが起動中か確認（緑●）"
                      : "Make sure Ollama is running (green dot)"}
                  </li>
                  <li>
                    {lang === "ja"
                      ? "左の入力欄に件名を入力"
                      : "Enter a subject line in the sidebar"}
                  </li>
                  <li>
                    {lang === "ja"
                      ? "「分析する」をクリック"
                      : 'Click "Analyze"'}
                  </li>
                </ol>
              ) : (
                <ol style={{ margin: 0, paddingLeft: 18 }}>
                  <li>
                    {lang === "ja" ? "APIキーを入力" : "Enter your API key"}
                  </li>
                  <li>
                    {lang === "ja"
                      ? "左の入力欄に件名を入力"
                      : "Enter a subject line in the sidebar"}
                  </li>
                  <li>
                    {lang === "ja"
                      ? "「分析する」をクリック"
                      : 'Click "Analyze"'}
                  </li>
                </ol>
              )}
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
                        style={{
                          fontSize: 11,
                          color: T.accent,
                          fontWeight: 600,
                        }}
                      >
                        {alt.best_for}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Generate mode ── */}
      {mode === "generate" && (
        <div>
          <textarea
            value={genIntent}
            onChange={(e) => setGenIntent(e.target.value)}
            placeholder={
              lang === "ja"
                ? "例: ブラックフライデーセール、緊急感、20%オフ"
                : "e.g. Black Friday flash sale, urgency focus, 20% off"
            }
            aria-label={lang === "ja" ? "生成意図" : "Generation intent"}
            style={{
              width: "100%",
              minHeight: 72,
              padding: 10,
              borderRadius: T.radius,
              border: `1px solid ${T.border}`,
              fontSize: 12,
              fontFamily: T.font,
              background: T.surface,
              color: T.text,
              resize: "vertical",
              boxSizing: "border-box",
              lineHeight: 1.5,
              marginBottom: 10,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 11, color: T.textMuted, marginRight: 2 }}>
              {lang === "ja" ? "件数:" : "Count:"}
            </span>
            {[3, 5, 7].map((n) => (
              <button
                key={n}
                onClick={() => setGenCount(n)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: `1px solid ${genCount === n ? T.accent : T.border}`,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: T.font,
                  background: genCount === n ? T.accentLight : T.surface,
                  color: genCount === n ? T.accentDark : T.textSecondary,
                  transition: "all 0.15s",
                }}
              >
                {n}
              </button>
            ))}
          </div>

          {genError && (
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
              {genError}
            </div>
          )}

          {genLoading && (
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
                      height: 12,
                      width: "75%",
                      background: T.border,
                      borderRadius: 4,
                      marginBottom: 8,
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                  <div
                    style={{
                      height: 10,
                      width: "90%",
                      background: T.borderSubtle,
                      borderRadius: 4,
                      marginBottom: 4,
                      animation: "pulse 1.5s ease-in-out 0.2s infinite",
                    }}
                  />
                  <div
                    style={{
                      height: 10,
                      width: "60%",
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

          {!genResult && !genLoading && !genError && (
            <div
              style={{
                padding: "20px 16px",
                border: `1px dashed ${T.border}`,
                borderRadius: T.radius,
                color: T.textMuted,
                fontSize: 12,
                lineHeight: 1.8,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 6,
                  color: T.textSecondary,
                }}
              >
                {lang === "ja"
                  ? "件名バリアントを生成"
                  : "Generate subject variants"}
              </div>
              <div>
                {lang === "ja"
                  ? "上のテキストエリアにキャンペーンの意図やキーワードを入力してください。AIが複数の件名・プレビューテキストを提案します。"
                  : "Describe your campaign intent or keywords in the text area above. AI will suggest multiple subject line and preview text combinations."}
              </div>
            </div>
          )}

          {genResult && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(genResult.variants || []).map((v, i) => (
                <div
                  key={i}
                  style={{
                    background: T.bg,
                    borderRadius: T.radius,
                    border: `1px solid ${T.borderSubtle}`,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: T.text,
                      marginBottom: 3,
                    }}
                  >
                    {v.subject}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: T.textMuted,
                      marginBottom: 6,
                    }}
                  >
                    {v.preview}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.textSecondary,
                      marginBottom: 10,
                      lineHeight: 1.5,
                    }}
                  >
                    {v.rationale}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <SmallButton
                      onClick={() => {
                        updateActive("subject", v.subject);
                        updateActive("preview", v.preview);
                      }}
                      active
                      style={{ fontSize: 11, padding: "3px 10px" }}
                    >
                      {lang === "ja" ? "適用" : "Apply"}
                    </SmallButton>
                    <SmallButton
                      onClick={() => addCandidateFrom(v.subject, v.preview)}
                      disabled={candidatesCount >= 5}
                      style={{ fontSize: 11, padding: "3px 10px" }}
                    >
                      + {lang === "ja" ? "候補" : "Candidate"}
                    </SmallButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
