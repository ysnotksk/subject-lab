import { useState, useCallback, useEffect, useRef } from "react";
import { T } from "../../constants/tokens";
import { INDUSTRY_EMAILS } from "../../constants/emails";
import { shuffleArray, truncate, senderColor } from "../../utils/helpers";
import SectionHeader from "../common/SectionHeader";
import SmallButton from "../common/SmallButton";

export default function FindTest({ sender, subject, preview, lang, industry }) {
  const [phase, setPhase] = useState("idle");
  const [elapsed, setElapsed] = useState(0);
  const [foundIdx, setFoundIdx] = useState(null);
  const [emails, setEmails] = useState([]);
  const timerRef = useRef(null);
  const startRef = useRef(null);

  const startTest = useCallback(() => {
    const pool = INDUSTRY_EMAILS[industry]?.[lang] || INDUSTRY_EMAILS.ec[lang];
    const picked = shuffleArray(pool).slice(0, 9);
    const idx = Math.floor(Math.random() * 10);
    const user = {
      sender: sender || (lang === "ja" ? "送信者" : "Sender"),
      subject: subject || "",
      preview: preview || "",
      isUser: true,
    };
    setEmails([...picked.slice(0, idx), user, ...picked.slice(idx)]);
    setFoundIdx(null);
    setElapsed(0);
    setPhase("running");
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const e = (Date.now() - startRef.current) / 1000;
      setElapsed(e);
      if (e >= 3) {
        clearInterval(timerRef.current);
        setPhase("missed");
      }
    }, 50);
  }, [sender, subject, preview, lang, industry]);

  const handleClick = (idx) => {
    if (phase !== "running") return;
    clearInterval(timerRef.current);
    setFoundIdx(idx);
    setPhase(emails[idx]?.isUser ? "found" : "missed");
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  return (
    <div>
      <SectionHeader
        title={lang === "ja" ? "3秒チャレンジ" : "3-Second Challenge"}
        right={
          phase === "idle" ? (
            <SmallButton onClick={startTest} disabled={!subject} active>
              {lang === "ja" ? "開始" : "Start"}
            </SmallButton>
          ) : (
            <SmallButton
              onClick={() => {
                clearInterval(timerRef.current);
                setPhase("idle");
                setElapsed(0);
              }}
            >
              {lang === "ja" ? "リセット" : "Reset"}
            </SmallButton>
          )
        }
      />

      {phase === "idle" && (
        <div
          style={{
            padding: "32px 20px",
            textAlign: "center",
            border: `1px dashed ${T.border}`,
            borderRadius: T.radius,
          }}
        >
          <div
            style={{
              fontFamily: T.fontDisplay,
              fontSize: 18,
              fontWeight: 500,
              color: T.text,
              marginBottom: 6,
            }}
          >
            {lang === "ja"
              ? "あなたのメールを3秒で見つけられますか？"
              : "Can you spot your email in 3 seconds?"}
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 16 }}>
            {lang === "ja"
              ? "受信トレイからタップしてください"
              : "Tap your email in the inbox below"}
          </div>
          <div
            style={{
              background: T.bg,
              borderRadius: 6,
              padding: "12px 16px",
              textAlign: "left",
              fontSize: 11,
              color: T.textSecondary,
              lineHeight: 1.7,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: T.text,
                marginBottom: 4,
                fontSize: 11,
              }}
            >
              {lang === "ja" ? "なぜ3秒？" : "Why 3 seconds?"}
            </div>
            {lang === "ja"
              ? "Nielsen Norman Groupの視線追跡研究によると、ユーザーは送信者名と件名だけで2〜3秒以内にメールを開くか無視するかを決定します。Litmusの調査ではメール1通の平均閲覧時間はわずか9秒ですが、受信トレイのスキャンは1行あたり3秒未満。3秒で見つからない件名は、事実上「見えない」メールです。"
              : "Nielsen Norman Group's eye-tracking studies show users decide to open or skip an email in 2\u20133 seconds based on sender and subject line alone. Litmus reports the average email gets just 9 seconds of attention, but inbox scanning happens in under 3 seconds per row. If your subject isn't spotted in 3 seconds, it's effectively invisible."}
          </div>
        </div>
      )}

      {phase !== "idle" && (
        <>
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
                fontSize: 12,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span
                style={{
                  color:
                    elapsed > 2
                      ? T.danger
                      : elapsed > 1
                        ? T.warning
                        : T.success,
                }}
              >
                {elapsed.toFixed(1)}s
              </span>
              <span style={{ color: T.textMuted }}>3.0s</span>
            </div>
            <div
              style={{
                height: 3,
                background: T.borderSubtle,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 2,
                  width: `${Math.min((elapsed / 3) * 100, 100)}%`,
                  background:
                    elapsed > 2
                      ? T.danger
                      : elapsed > 1
                        ? T.warning
                        : T.success,
                  transition: "width 0.05s linear",
                }}
              />
            </div>
          </div>

          <div
            style={{
              border: `1px solid ${phase === "found" ? T.successBorder : phase === "missed" ? T.dangerBorder : T.border}`,
              borderRadius: T.radius,
              overflow: "hidden",
              transition: "border-color 0.3s",
            }}
          >
            {emails.map((email, i) => {
              const isCorrect = email.isUser;
              const show = phase === "found" || phase === "missed";
              const bg =
                show && isCorrect
                  ? T.successLight
                  : foundIdx === i && !isCorrect
                    ? T.dangerLight
                    : "transparent";
              return (
                <div
                  key={i}
                  onClick={() => handleClick(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "9px 14px",
                    gap: 10,
                    borderBottom:
                      i < emails.length - 1
                        ? `1px solid ${T.borderSubtle}`
                        : "none",
                    cursor: phase === "running" ? "pointer" : "default",
                    background: bg,
                    transition: "background 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: senderColor(email.sender) + "14",
                      color: senderColor(email.sender),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {email.sender.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{ fontSize: 12, fontWeight: 600, color: T.text }}
                    >
                      {truncate(email.sender, 18)}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: T.text,
                        fontWeight: 400,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {email.subject}
                    </div>
                  </div>
                  {show && isCorrect && (
                    <span
                      style={{
                        color: T.success,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {"\u25cf"}
                    </span>
                  )}
                  {show && foundIdx === i && !isCorrect && (
                    <span
                      style={{ color: T.danger, fontSize: 13, fontWeight: 700 }}
                    >
                      {"\u00d7"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {(phase === "found" || phase === "missed") && (
            <>
              <div
                style={{
                  marginTop: 14,
                  padding: 16,
                  borderRadius: T.radius,
                  background:
                    phase === "found" ? T.successLight : T.dangerLight,
                  border: `1px solid ${phase === "found" ? T.successBorder : T.dangerBorder}`,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: T.fontDisplay,
                    fontSize: 16,
                    fontWeight: 600,
                    color: phase === "found" ? T.success : T.danger,
                    marginBottom: 4,
                  }}
                >
                  {phase === "found"
                    ? lang === "ja"
                      ? `${elapsed.toFixed(1)}秒で発見`
                      : `Found in ${elapsed.toFixed(1)}s`
                    : lang === "ja"
                      ? "見つけられませんでした"
                      : "Not found in time"}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: phase === "found" ? T.success : T.danger,
                  }}
                >
                  {phase === "found"
                    ? elapsed < 1
                      ? lang === "ja"
                        ? "一瞬で目を引く件名です"
                        : "Instantly eye-catching"
                      : elapsed < 2
                        ? lang === "ja"
                          ? "もう少し目立たせる余地があります"
                          : "Room to stand out more"
                        : lang === "ja"
                          ? "ギリギリです。埋もれやすいかもしれません"
                          : "Barely found — might get lost"
                    : lang === "ja"
                      ? "この件名は受信トレイで埋もれています"
                      : "This subject line is getting buried"}
                </div>
              </div>
              <details
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: T.textSecondary,
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    color: T.textMuted,
                    fontWeight: 500,
                    padding: "4px 0",
                  }}
                >
                  {lang === "ja"
                    ? "なぜ3秒？ — 研究背景"
                    : "Why 3 seconds? — Research"}
                </summary>
                <div
                  style={{
                    marginTop: 4,
                    padding: "8px 12px",
                    background: T.bg,
                    borderRadius: 6,
                    lineHeight: 1.7,
                  }}
                >
                  {lang === "ja"
                    ? "Nielsen Norman Groupの視線追跡研究によると、ユーザーは送信者名と件名だけで2〜3秒以内にメールを開くか無視するかを決定します。Litmusの調査ではメール1通の平均閲覧時間はわずか9秒ですが、受信トレイのスキャンは1行あたり3秒未満。3秒で見つからない件名は、事実上「見えない」メールです。"
                    : "Nielsen Norman Group's eye-tracking studies show users decide to open or skip an email in 2\u20133 seconds based on sender and subject line alone. Litmus reports the average email gets just 9 seconds of attention, but inbox scanning happens in under 3 seconds per row. If your subject isn't spotted in 3 seconds, it's effectively invisible."}
                </div>
              </details>
            </>
          )}
        </>
      )}
    </div>
  );
}
