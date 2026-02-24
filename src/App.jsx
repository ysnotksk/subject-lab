import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { T, linkStyle } from "./constants/tokens";
import { INDUSTRY_EMAILS } from "./constants/emails";
import { load, save } from "./utils/storage";
import InputPanel from "./components/sidebar/InputPanel";
import CandidatesPanel from "./components/sidebar/CandidatesPanel";
import Checklist from "./components/sidebar/Checklist";
import InboxSimulator from "./components/main/InboxSimulator";
import FindTest from "./components/main/FindTest";
import NotificationPreview from "./components/main/NotificationPreview";
import DevicePreview from "./components/main/DevicePreview";
import LinguisticAnalysis from "./components/main/LinguisticAnalysis";
import Card from "./components/common/Card";

const ENABLE_AI = import.meta.env.VITE_ENABLE_AI !== "false";
const AIPanel = ENABLE_AI
  ? lazy(() => import("./components/main/AIPanel"))
  : null;

export default function SubjectLab() {
  const [lang, setLang] = useState(() => load("lang", "ja"));
  const [industry, setIndustry] = useState(() => load("industry", "ec"));
  const DEFAULT_CANDIDATE = {
    id: 1,
    sender: "Subject Lab Inc.",
    senderIcon: import.meta.env.BASE_URL + "logo.svg",
    subject: "Your subject line, tested before you send",
    preview: "See how it looks on iPhone, Gmail, and Outlook in seconds",
    note: "",
  };

  const [candidates, setCandidates] = useState(() =>
    load("candidates", [DEFAULT_CANDIDATE]),
  );
  const [activeId, setActiveId] = useState(() => load("activeId", 1));
  const [highlight, setHighlight] = useState(() => load("highlight", false));
  const [activeTab, setActiveTab] = useState(() => {
    const saved = load("activeTab", "inbox");
    return saved === "analysis" ? "inbox" : saved;
  });

  useEffect(() => save("lang", lang), [lang]);
  useEffect(() => save("industry", industry), [industry]);
  useEffect(() => save("candidates", candidates), [candidates]);
  useEffect(() => save("activeId", activeId), [activeId]);
  useEffect(() => save("highlight", highlight), [highlight]);
  useEffect(() => save("activeTab", activeTab), [activeTab]);

  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const inboxRef = useRef(null);
  const notifRef = useRef(null);
  const deviceRef = useRef(null);

  const active = candidates.find((c) => c.id === activeId) || candidates[0];
  const updateActive = (field, value) =>
    setCandidates((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, [field]: value } : c)),
    );
  const addCandidate = () => {
    if (candidates.length >= 5) return;
    const newId = Math.max(...candidates.map((c) => c.id)) + 1;
    setCandidates([
      ...candidates,
      { id: newId, sender: active.sender, subject: "", preview: "", note: "" },
    ]);
    setActiveId(newId);
  };
  const addCandidateFrom = (subject, preview) => {
    if (candidates.length >= 5) return;
    const newId = Math.max(...candidates.map((c) => c.id)) + 1;
    setCandidates((prev) => [
      ...prev,
      { id: newId, sender: active.sender, subject, preview, note: "" },
    ]);
    setActiveId(newId);
  };
  const removeCandidate = (id) => {
    if (candidates.length <= 1) return;
    const next = candidates.filter((c) => c.id !== id);
    setCandidates(next);
    if (activeId === id) setActiveId(next[0].id);
  };

  const industryKeys = Object.keys(INDUSTRY_EMAILS);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        fontFamily: T.font,
        color: T.text,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html:
            linkStyle +
            `\n.tab-btn:hover:not(.tab-active) { background: ${T.bg}; }\n.inbox-row:hover { background: ${T.bg}; }`,
        }}
      />

      {/* HEADER */}
      <header
        style={{
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          padding: "0 24px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="SubjectLab"
            style={{ width: 26, height: 26, flexShrink: 0 }}
          />
          <span
            style={{
              fontFamily: T.fontDisplay,
              fontWeight: 600,
              fontSize: 18,
              color: T.text,
              letterSpacing: "-0.02em",
            }}
          >
            SubjectLab
          </span>
          <span
            style={{
              fontSize: 10,
              color: T.textMuted,
              fontWeight: 500,
              background: T.bg,
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            BETA
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {ENABLE_AI && (
            <button
              onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 12px",
                borderRadius: 6,
                border: `1px solid ${aiDrawerOpen ? T.accent : T.border}`,
                fontSize: 11,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: T.font,
                background: aiDrawerOpen ? T.accentLight : T.surface,
                color: aiDrawerOpen ? T.accentDark : T.textSecondary,
                boxShadow: T.shadow,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 13 }}>&#x2728;</span>
              AI
            </button>
          )}
          <div
            style={{
              display: "flex",
              gap: 1,
              background: T.bg,
              borderRadius: 6,
              padding: 2,
              border: `1px solid ${T.border}`,
            }}
          >
            {["ja", "en"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 5,
                  border: "none",
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: 500,
                  fontFamily: T.font,
                  background: lang === l ? T.surface : "transparent",
                  color: lang === l ? T.text : T.textMuted,
                  boxShadow: lang === l ? T.shadow : "none",
                  transition: "all 0.15s",
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* BODY */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "20px 20px",
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 20,
        }}
      >
        {/* LEFT SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "flex",
              gap: 1,
              background: T.bg,
              borderRadius: 6,
              padding: 2,
              border: `1px solid ${T.border}`,
            }}
          >
            {industryKeys.map((k) => (
              <button
                key={k}
                onClick={() => setIndustry(k)}
                style={{
                  flex: 1,
                  padding: "4px 0",
                  borderRadius: 5,
                  border: "none",
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: 500,
                  fontFamily: T.font,
                  background: industry === k ? T.surface : "transparent",
                  color: industry === k ? T.text : T.textMuted,
                  boxShadow: industry === k ? T.shadow : "none",
                  transition: "all 0.15s",
                }}
              >
                {INDUSTRY_EMAILS[k].label[lang]}
              </button>
            ))}
          </div>
          <InputPanel active={active} updateActive={updateActive} lang={lang} />
          <CandidatesPanel
            candidates={candidates}
            activeId={activeId}
            setActiveId={setActiveId}
            addCandidate={addCandidate}
            removeCandidate={removeCandidate}
            lang={lang}
          />

          <Card style={{ padding: 14 }}>
            <Checklist lang={lang} />
          </Card>
        </div>

        {/* CENTER MAIN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              gap: 1,
              background: T.bg,
              borderRadius: T.radius,
              padding: 3,
              border: `1px solid ${T.border}`,
            }}
          >
            {[
              { key: "inbox", icon: "\u2709", ja: "受信トレイ", en: "Inbox" },
              {
                key: "device",
                icon: "\u25E7",
                ja: "デバイス別",
                en: "Devices",
              },
              {
                key: "notification",
                icon: "\uD83D\uDD14",
                ja: "通知画面",
                en: "Notifications",
              },
              {
                key: "findtest",
                icon: "\u23F1",
                ja: "3秒テスト",
                en: "3s Test",
              },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`tab-btn${activeTab === t.key ? " tab-active" : ""}`}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "none",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: T.font,
                  background: activeTab === t.key ? T.surface : "transparent",
                  color: activeTab === t.key ? T.text : T.textMuted,
                  boxShadow: activeTab === t.key ? T.shadow : "none",
                  transition: "all 0.15s",
                }}
              >
                {t.icon} {lang === "ja" ? t.ja : t.en}
              </button>
            ))}
          </div>

          <Card style={{ padding: 20 }}>
            {activeTab === "inbox" && (
              <>
                <InboxSimulator
                  sender={active.sender}
                  senderIcon={active.senderIcon}
                  subject={active.subject}
                  preview={active.preview}
                  lang={lang}
                  industry={industry}
                  highlight={highlight}
                  setHighlight={setHighlight}
                  exportRef={inboxRef}
                />
                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 20,
                    borderTop: `1px solid ${T.borderSubtle}`,
                  }}
                >
                  <LinguisticAnalysis
                    sender={active.sender}
                    subject={active.subject}
                    preview={active.preview}
                    lang={lang}
                    industry={industry}
                  />
                </div>
              </>
            )}
            {activeTab === "device" && (
              <DevicePreview
                sender={active.sender}
                senderIcon={active.senderIcon}
                subject={active.subject}
                preview={active.preview}
                lang={lang}
                exportRef={deviceRef}
              />
            )}
            {activeTab === "notification" && (
              <NotificationPreview
                sender={active.sender}
                subject={active.subject}
                preview={active.preview}
                lang={lang}
                exportRef={notifRef}
              />
            )}
            {activeTab === "findtest" && (
              <FindTest
                sender={active.sender}
                subject={active.subject}
                preview={active.preview}
                lang={lang}
                industry={industry}
              />
            )}
          </Card>
        </div>
      </div>

      {/* AI Drawer — slide in from right */}
      {ENABLE_AI && aiDrawerOpen && (
        <div
          onClick={() => setAiDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.2)",
            zIndex: 100,
            transition: "opacity 0.2s",
          }}
        />
      )}
      {ENABLE_AI && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: 360,
            maxWidth: "90vw",
            background: T.surface,
            borderLeft: `1px solid ${T.border}`,
            boxShadow: aiDrawerOpen ? "-4px 0 24px rgba(0,0,0,0.08)" : "none",
            transform: aiDrawerOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.25s ease",
            zIndex: 101,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: `1px solid ${T.border}`,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: T.text,
              }}
            >
              &#x2728; {lang === "ja" ? "AI分析" : "AI Analysis"}
            </span>
            <button
              onClick={() => setAiDrawerOpen(false)}
              aria-label={
                lang === "ja" ? "AI分析を閉じる" : "Close AI Analysis"
              }
              style={{
                background: "none",
                border: "none",
                fontSize: 16,
                color: T.textMuted,
                cursor: "pointer",
                padding: "2px 6px",
                borderRadius: 4,
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </div>
          <div style={{ padding: 16, flex: 1 }}>
            <Suspense
              fallback={
                <div
                  style={{
                    textAlign: "center",
                    padding: 20,
                    color: T.textMuted,
                    fontSize: 12,
                  }}
                >
                  Loading...
                </div>
              }
            >
              <AIPanel
                sender={active.sender}
                subject={active.subject}
                preview={active.preview}
                lang={lang}
                candidates={candidates}
                industry={industry}
                updateActive={updateActive}
                addCandidateFrom={addCandidateFrom}
                candidatesCount={candidates.length}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px 16px 20px",
          fontSize: 11,
          color: T.textMuted,
          borderTop: `1px solid ${T.borderSubtle}`,
          marginTop: 32,
        }}
      >
        <span>
          Built by{" "}
          <a
            href="https://github.com/ysnotksk"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: T.accent, textDecoration: "none" }}
          >
            Yoshinao Takisaka
          </a>
        </span>
      </footer>
    </div>
  );
}
