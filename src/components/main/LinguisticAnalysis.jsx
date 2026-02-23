import { T } from "../../constants/tokens";
import { INDUSTRY_EMAILS } from "../../constants/emails";
import { truncate } from "../../utils/helpers";
import {
  detectSyntagmaticRedundancy,
  detectPreviewRedundancy,
  detectParadigmaticSimilarity,
} from "../../utils/linguistic";
import SectionHeader from "../common/SectionHeader";

export default function LinguisticAnalysis({
  sender,
  subject,
  preview,
  lang,
  industry,
}) {
  const pool = INDUSTRY_EMAILS[industry]?.[lang] || INDUSTRY_EMAILS.ec[lang];

  const syntagmatic = [
    ...detectSyntagmaticRedundancy(sender, subject, lang),
    ...detectPreviewRedundancy(subject, preview, lang),
  ];
  const paradigmatic = detectParadigmaticSimilarity(subject, pool, lang);

  const hasFindings = syntagmatic.length > 0 || paradigmatic.length > 0;
  const allClear = subject && sender && !hasFindings;

  const severityColor = (s) =>
    s === "high" ? T.danger : s === "medium" ? T.warning : T.textMuted;
  const severityBg = (s) =>
    s === "high" ? T.dangerLight : s === "medium" ? T.warningLight : T.bg;
  const severityLabel = (s, lang) => {
    if (lang === "ja")
      return s === "high" ? "要改善" : s === "medium" ? "注意" : "参考";
    return s === "high" ? "Fix" : s === "medium" ? "Review" : "Note";
  };

  return (
    <div>
      <SectionHeader
        title={lang === "ja" ? "件名チェック" : "Subject Line Check"}
      />

      {!subject && (
        <div
          style={{
            padding: "20px 16px",
            textAlign: "center",
            border: `1px dashed ${T.border}`,
            borderRadius: T.radius,
            color: T.textMuted,
            fontSize: 12,
          }}
        >
          {lang === "ja"
            ? "件名を入力すると自動分析されます"
            : "Enter a subject line to run analysis"}
        </div>
      )}

      {allClear && (
        <div
          style={{
            padding: 14,
            background: T.successLight,
            borderRadius: T.radius,
            border: `1px solid ${T.successBorder}`,
            fontSize: 13,
            color: T.success,
            textAlign: "center",
          }}
        >
          {lang === "ja" ? "問題は検出されませんでした" : "No issues detected"}
        </div>
      )}

      {hasFindings && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {syntagmatic.map((f, i) => (
            <div
              key={`syn-${i}`}
              style={{
                padding: 14,
                background: severityBg(f.severity),
                borderRadius: T.radius,
                border: `1px solid ${f.severity === "high" ? T.dangerBorder : f.severity === "medium" ? "#fde68a" : T.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: severityColor(f.severity),
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "2px 6px",
                    background: T.surface,
                    borderRadius: 3,
                  }}
                >
                  {severityLabel(f.severity, lang)}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: T.accent,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {lang === "ja" ? "重複" : "Overlap"}
                </span>
              </div>

              {f.type === "sender_in_subject" && (
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: T.text,
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    {lang === "ja" ? (
                      <>
                        送信者名「{sender}」と件名が記号を共有しています：
                        <strong style={{ color: severityColor(f.severity) }}>
                          {f.shared}
                        </strong>
                      </>
                    ) : (
                      <>
                        Sender "{sender}" shares tokens with subject:{" "}
                        <strong style={{ color: severityColor(f.severity) }}>
                          {f.shared}
                        </strong>
                      </>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: T.textSecondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {lang === "ja"
                      ? "受信者は「送信者名 → 件名 → プレビュー」を一つの流れとして読みます。同じ言葉が繰り返されると、限られた表示スペースが無駄になります。送信者名で既に伝えている情報を件名から削り、代わりに新しい情報を入れてください。"
                      : "Recipients read 'Sender \u2192 Subject \u2192 Preview' as one continuous flow. When the same words repeat, limited display space is wasted. Remove what the sender name already communicates and replace it with new information."}
                  </div>
                </div>
              )}

              {f.type === "preview_echoes_subject" && (
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: T.text,
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    {lang === "ja" ? (
                      <>
                        プレビューテキストが件名と
                        <strong style={{ color: severityColor(f.severity) }}>
                          {f.ratio}%
                        </strong>
                        の語彙重複をしています
                      </>
                    ) : (
                      <>
                        Preview text overlaps{" "}
                        <strong style={{ color: severityColor(f.severity) }}>
                          {f.ratio}%
                        </strong>{" "}
                        with subject line
                      </>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: T.textSecondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {lang === "ja"
                      ? "「送信者名 → 件名 → プレビュー」は読み進めるごとに新しい情報が出てくるのが理想です。プレビューが件名と同じ内容だと、読者の目が止まりません。プレビューは件名の「続き」として、具体的な価値や詳細を追加してください。"
                      : "Ideally, each step from Sender \u2192 Subject \u2192 Preview reveals something new. When the preview repeats the subject, the reader's eye moves on. Make the preview the 'next chapter' \u2014 add specific value or details the subject didn't cover."}
                  </div>
                </div>
              )}
            </div>
          ))}

          {paradigmatic.map((f, i) => (
            <div
              key={`par-${i}`}
              style={{
                padding: 14,
                background: severityBg(f.severity),
                borderRadius: T.radius,
                border: `1px solid ${f.severity === "high" ? T.dangerBorder : f.severity === "medium" ? "#fde68a" : T.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: severityColor(f.severity),
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "2px 6px",
                    background: T.surface,
                    borderRadius: 3,
                  }}
                >
                  {severityLabel(f.severity, lang)}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: T.accent,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {lang === "ja" ? "差別化" : "Contrast"}
                </span>
              </div>

              {f.type === "shared_opening_pattern" && (
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: T.text,
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    {lang === "ja" ? (
                      <>
                        {f.count}
                        通の競合サンプルメールと冒頭パターンが一致しています
                      </>
                    ) : (
                      <>
                        {f.count} competing sample email{f.count > 1 ? "s" : ""}{" "}
                        share
                        {f.count === 1 ? "s" : ""} your opening pattern
                      </>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: T.textSecondary,
                      marginBottom: 6,
                      lineHeight: 1.6,
                    }}
                  >
                    {lang === "ja"
                      ? "受信トレイでは、あなたのメールは他のメールと縦に並んでいます。同じ冒頭パターンの件名が複数並ぶと、あなたのメールは「その他大勢」の一つに見えてしまいます。冒頭のパターンを変えて、一目で違いが分かるようにしましょう。"
                      : "In the inbox, your email sits in a vertical stack with others. When multiple subject lines share the same opening pattern, yours blends into the crowd. Change your opening pattern so the difference is visible at a glance."}
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    {f.examples.map((ex, j) => (
                      <div
                        key={j}
                        style={{
                          fontSize: 11,
                          color: T.textMuted,
                          padding: "3px 8px",
                          background: T.surface,
                          borderRadius: 4,
                          border: `1px solid ${T.borderSubtle}`,
                        }}
                      >
                        {truncate(ex, 45)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {f.type === "shared_lead_tokens" && (
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: T.text,
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    {lang === "ja" ? (
                      <>
                        {f.count}通の競合サンプルメールとリードフレーズ「
                        <strong style={{ color: severityColor(f.severity) }}>
                          {f.tokens}
                        </strong>
                        」が重複しています
                      </>
                    ) : (
                      <>
                        {f.count} competing sample email{f.count > 1 ? "s" : ""}{" "}
                        share
                        {f.count === 1 ? "s" : ""} lead phrase "
                        <strong style={{ color: severityColor(f.severity) }}>
                          {f.tokens}
                        </strong>
                        "
                      </>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: T.textSecondary,
                      marginBottom: 6,
                      lineHeight: 1.6,
                    }}
                  >
                    {lang === "ja"
                      ? "受信者の目は件名の冒頭に最も注意を払います。冒頭の言葉が競合サンプルメールと同じ場合、あなたのメールを見分ける手がかりがありません。冒頭で差をつけましょう。"
                      : "The recipient's eye pays most attention to the opening of the subject line. When your opening words match a competitor's, there's no cue to distinguish your email. Differentiate from the start."}
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    {f.examples.map((ex, j) => (
                      <div
                        key={j}
                        style={{
                          fontSize: 11,
                          color: T.textMuted,
                          padding: "3px 8px",
                          background: T.surface,
                          borderRadius: 4,
                          border: `1px solid ${T.borderSubtle}`,
                        }}
                      >
                        {truncate(ex, 45)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {f.type === "shared_emoji_position" && (
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: T.text,
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    {lang === "ja" ? (
                      <>
                        {f.count}通の競合サンプルメールと同じ位置（
                        {f.position === "start"
                          ? "冒頭"
                          : f.position === "end"
                            ? "末尾"
                            : "中間"}
                        ）に絵文字があります
                      </>
                    ) : (
                      <>
                        {f.count} competing sample emails have emoji at the same
                        position ({f.position})
                      </>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: T.textSecondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {lang === "ja"
                      ? "絵文字は目を引く手段ですが、同じ位置に絵文字がある件名が他に複数あると、効果が薄れます。位置を変えるか、思い切って絵文字を外す方が目立つ場合もあります。"
                      : "Emoji are attention-grabbers, but when multiple emails place emoji at the same position, the effect fades. Moving it or removing it entirely may actually make your email stand out more."}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
