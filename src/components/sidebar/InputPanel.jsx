import { useRef } from "react";
import { T } from "../../constants/tokens";
import { senderColor } from "../../utils/helpers";
import SectionHeader from "../common/SectionHeader";
import Card from "../common/Card";

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: `1px solid ${T.border}`,
  fontSize: 13,
  fontFamily: T.font,
  background: T.surface,
  color: T.text,
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const SUBJECT_LIMITS = [
  { chars: 35, label: "iPhone Mail" },
  { chars: 33, label: "Gmail mobile" },
  { chars: 42, label: "Outlook mobile" },
];

function counterColor(len) {
  if (len > 40) return T.danger;
  if (len > 30) return T.warning;
  return T.textMuted;
}

export default function InputPanel({ active, updateActive, lang }) {
  const fileRef = useRef(null);

  const handleIconUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512 * 1024) return; // 512KB limit
    const reader = new FileReader();
    reader.onload = () => updateActive("senderIcon", reader.result);
    reader.readAsDataURL(file);
  };

  const fields = [
    {
      key: "subject",
      label: lang === "ja" ? "件名" : "Subject line",
      ph: lang === "ja" ? "メールの件名" : "Your subject line",
      rows: 2,
      maxLen: 80,
      guidance: true,
    },
    {
      key: "preview",
      label: lang === "ja" ? "プレビューテキスト" : "Preview text",
      ph: lang === "ja" ? "件名の後に表示される文" : "Text shown after subject",
      rows: 2,
      maxLen: 100,
    },
    {
      key: "note",
      label: lang === "ja" ? "メモ" : "Notes",
      ph: lang === "ja" ? "この候補の狙い" : "Intent",
      rows: 1,
    },
  ];

  const subjectLen = (active.subject || "").length;
  const nearestLimit = SUBJECT_LIMITS.find((l) => subjectLen > l.chars);

  return (
    <Card style={{ padding: 16 }}>
      <SectionHeader title={lang === "ja" ? "入力" : "Input"} />

      {/* Sender + Icon row */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <label
            htmlFor="input-sender"
            style={{ fontSize: 11, fontWeight: 500, color: T.textSecondary }}
          >
            {lang === "ja" ? "送信者名" : "Sender"}
          </label>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: T.textMuted,
            }}
          >
            {(active.sender || "").length}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={handleIconUpload}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            title={lang === "ja" ? "アイコン画像を選択" : "Choose icon image"}
            aria-label={
              lang === "ja"
                ? "送信者アイコン画像を選択"
                : "Upload sender icon image"
            }
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: `1.5px dashed ${active.senderIcon ? "transparent" : T.border}`,
              background: active.senderIcon
                ? "none"
                : senderColor(active.sender || "?"),
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {active.senderIcon ? (
              <img
                src={active.senderIcon}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            ) : (
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
                {(active.sender || "?").charAt(0)}
              </span>
            )}
          </button>
          {active.senderIcon && (
            <button
              onClick={() => updateActive("senderIcon", "")}
              style={{
                background: "none",
                border: "none",
                fontSize: 10,
                color: T.textMuted,
                cursor: "pointer",
                padding: 0,
              }}
              title={lang === "ja" ? "アイコンを削除" : "Remove icon"}
              aria-label={lang === "ja" ? "アイコンを削除" : "Remove icon"}
            >
              ✕
            </button>
          )}
          <input
            id="input-sender"
            value={active.sender}
            onChange={(e) => updateActive("sender", e.target.value)}
            placeholder={lang === "ja" ? "例：Amazon.co.jp" : "e.g. Amazon"}
            maxLength={40}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
      </div>

      {fields.map((f) => {
        const len = (active[f.key] || "").length;
        return (
          <div key={f.key} style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <label
                htmlFor={`input-${f.key}`}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: T.textSecondary,
                }}
              >
                {f.label}
              </label>
              {f.maxLen && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                    color: f.guidance ? counterColor(len) : T.textMuted,
                    transition: "color 0.15s",
                  }}
                >
                  {len}
                </span>
              )}
            </div>
            {f.rows === 1 ? (
              <input
                id={`input-${f.key}`}
                value={active[f.key]}
                onChange={(e) => updateActive(f.key, e.target.value)}
                placeholder={f.ph}
                maxLength={f.maxLen}
                style={inputStyle}
              />
            ) : (
              <textarea
                id={`input-${f.key}`}
                value={active[f.key]}
                onChange={(e) => updateActive(f.key, e.target.value)}
                placeholder={f.ph}
                rows={f.rows}
                maxLength={f.maxLen}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            )}
            {f.guidance && nearestLimit && (
              <div
                style={{
                  fontSize: 10,
                  color: T.warning,
                  marginTop: 4,
                  transition: "opacity 0.15s",
                }}
              >
                {lang === "ja"
                  ? `${nearestLimit.chars}文字 = ${nearestLimit.label}の上限`
                  : `${nearestLimit.chars} chars = ${nearestLimit.label} limit`}
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
}
