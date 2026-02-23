import { useState, useCallback, useEffect, useRef } from "react";
import { T } from "../../constants/tokens";
import { DEVICES } from "../../constants/devices";
import { INDUSTRY_EMAILS } from "../../constants/emails";
import { shuffleArray, truncate, senderColor } from "../../utils/helpers";
import { load, save } from "../../utils/storage";
import { MobileFrame, BrowserFrame } from "../common/DeviceFrame";
import SectionHeader from "../common/SectionHeader";
import SmallButton from "../common/SmallButton";
import ExportButtons from "../common/ExportButtons";

const FRAME_MAP = {
  "iphone-mail": { type: "iphone", screenType: "island" },
  "iphone-gmail": { type: "iphone", screenType: "island" },
  "android-gmail": { type: "android" },
  "desktop-mail": { type: "browser" },
  "desktop-gmail": { type: "browser" },
  "desktop-outlook": { type: "browser" },
};

// Width threshold: above this → horizontal row, below → vertical stack
const HORIZONTAL_THRESHOLD = 550;

export default function InboxSimulator({
  sender,
  senderIcon,
  subject,
  preview,
  lang,
  industry,
  highlight,
  exportRef,
}) {
  const pool = INDUSTRY_EMAILS[industry]?.[lang] || INDUSTRY_EMAILS.ec[lang];
  const [shuffled, setShuffled] = useState([]);
  const [insertIdx, setInsertIdx] = useState(4);
  const [posMode, setPosMode] = useState("random");
  const [dark, setDark] = useState(() => load("inboxDark", false));
  const [deviceId, setDeviceId] = useState(() =>
    load("inboxDevice", "iphone-mail"),
  );
  const [browserWidth, setBrowserWidth] = useState(() =>
    load("inboxBrowserWidth", 700),
  );
  const timesRef = useRef([]);

  useEffect(() => save("inboxDark", dark), [dark]);
  useEffect(() => save("inboxDevice", deviceId), [deviceId]);
  useEffect(() => save("inboxBrowserWidth", browserWidth), [browserWidth]);

  const generateTimes = (count) => {
    const times = [0];
    for (let i = 1; i < count; i++) {
      times.push(times[i - 1] + 2 + Math.floor(Math.random() * 8));
    }
    return times;
  };

  const doShuffle = useCallback(() => {
    setShuffled(shuffleArray(pool).slice(0, 9));
    if (posMode === "random") setInsertIdx(Math.floor(Math.random() * 10));
    timesRef.current = generateTimes(10);
  }, [pool, posMode]);

  useEffect(() => {
    doShuffle();
  }, [lang, industry]);

  const userEmail = {
    sender: sender || (lang === "ja" ? "あなた" : "You"),
    subject:
      subject ||
      (lang === "ja" ? "件名を入力してください" : "Enter your subject line"),
    preview: preview || "",
    isUser: true,
  };
  const all = [
    ...shuffled.slice(0, insertIdx),
    userEmail,
    ...shuffled.slice(insertIdx),
  ];

  const frame = FRAME_MAP[deviceId];
  const device = DEVICES.find((d) => d.id === deviceId);
  const chrome = device?.chrome || {};
  const isMobile = device?.type === "mobile";
  const isHorizontal = chrome.layoutAuto
    ? browserWidth >= HORIZONTAL_THRESHOLD
    : false;

  const sliderStyle = `
    input[type=range].pos-slider { -webkit-appearance: none; appearance: none; height: 3px; background: ${T.border}; border-radius: 2px; outline: none; width: 100%; }
    input[type=range].pos-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${T.accent}; cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
    input[type=range].pos-slider::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: ${T.accent}; cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
  `;

  const inboxList = (
    <div
      style={{
        borderRadius: frame?.type === "browser" ? 0 : isMobile ? 0 : T.radius,
        overflow: "hidden",
        background: dark ? "#1a1a1a" : T.surface,
        transition: "background 0.2s",
      }}
    >
      {all.map((email, i) => {
        const u = email.isUser;
        const c = senderColor(email.sender);
        const highlightBg =
          u && highlight
            ? dark
              ? "rgba(13,148,136,0.15)"
              : T.accentLight
            : "transparent";
        const timeLabel = (() => {
          const mins = (timesRef.current || [])[i] || 0;
          if (mins === 0) return lang === "ja" ? "今" : "Now";
          return lang === "ja" ? `${mins}分前` : `${mins}m`;
        })();

        /* ── Horizontal layout (Gmail Desktop) ── */
        if (isHorizontal) {
          return (
            <div
              key={i}
              className={dark ? undefined : "inbox-row"}
              style={{
                display: "flex",
                alignItems: "center",
                padding: chrome.rowPadding || "8px 10px",
                gap: chrome.contentGap || 8,
                borderBottom:
                  i < all.length - 1
                    ? `1px solid ${dark ? "#2a2a2a" : T.borderSubtle}`
                    : "none",
                background: highlightBg,
                position: "relative",
                transition: "background 0.15s",
              }}
            >
              {u && highlight && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: T.accent,
                  }}
                />
              )}
              {/* Checkbox */}
              {chrome.checkbox && (
                <div
                  style={{
                    width: 13,
                    height: 13,
                    border: `1.5px solid ${dark ? "#555" : "#bbb"}`,
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
              )}
              {/* Star */}
              {chrome.star && (
                <span
                  style={{
                    fontSize: 12,
                    color: dark ? "#555" : "#ccc",
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  &#9734;
                </span>
              )}
              {/* Sender — fixed width */}
              <span
                style={{
                  fontSize: chrome.senderFont || 12,
                  fontWeight: u ? 700 : 400,
                  color: dark ? "#e0e0e0" : T.text,
                  width: 120,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {truncate(email.sender, device?.senderChars || 20)}
              </span>
              {/* Subject — fills remaining space */}
              <span
                style={{
                  fontSize: chrome.subjectFont || 11,
                  fontWeight: u ? 600 : 400,
                  color: dark ? "#ccc" : T.text,
                  flex: 1,
                  minWidth: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {email.subject}
                {email.preview && (
                  <span
                    style={{
                      color: dark ? "#666" : T.textMuted,
                      fontWeight: 400,
                    }}
                  >
                    {" — "}
                    {email.preview}
                  </span>
                )}
              </span>
              {/* Time */}
              <span
                style={{
                  fontSize: 10,
                  color: dark ? "#666" : T.textMuted,
                  flexShrink: 0,
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                }}
              >
                {timeLabel}
              </span>
            </div>
          );
        }

        /* ── Vertical layout (mobile + Outlook) ── */
        const showAvatar = chrome.avatar !== false;
        return (
          <div
            key={i}
            className={dark ? undefined : "inbox-row"}
            style={{
              display: "flex",
              alignItems: "center",
              padding:
                chrome.rowPadding || (isMobile ? "8px 12px" : "8px 16px"),
              gap: chrome.contentGap || 8,
              borderBottom:
                i < all.length - 1
                  ? `1px solid ${dark ? "#2a2a2a" : T.borderSubtle}`
                  : "none",
              background: highlightBg,
              position: "relative",
              transition: "background 0.15s",
            }}
          >
            {u && highlight && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: T.accent,
                }}
              />
            )}
            {/* Outlook unread bar */}
            {chrome.unread === "bar" && u && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 4,
                  bottom: 4,
                  width: 3,
                  borderRadius: 2,
                  background: T.accent,
                }}
              />
            )}
            {/* Avatar */}
            {showAvatar &&
              (u && senderIcon ? (
                <img
                  src={senderIcon}
                  alt=""
                  style={{
                    width: chrome.avatarSize || (isMobile ? 26 : 28),
                    height: chrome.avatarSize || (isMobile ? 26 : 28),
                    borderRadius: chrome.avatarRadius || "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: chrome.avatarSize || (isMobile ? 26 : 28),
                    height: chrome.avatarSize || (isMobile ? 26 : 28),
                    borderRadius: chrome.avatarRadius || "50%",
                    background: u ? T.accent : dark ? c + "22" : c + "14",
                    color: u ? "#fff" : c,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMobile ? 10 : 11,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {email.sender.charAt(0)}
                </div>
              ))}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: chrome.senderFont || (isMobile ? 11 : 12),
                  fontWeight: u ? 700 : 500,
                  color: dark ? "#e0e0e0" : T.text,
                }}
              >
                {truncate(
                  email.sender,
                  device?.senderChars || (isMobile ? 14 : 18),
                )}
              </div>
              <div
                style={{
                  fontSize: chrome.subjectFont || (isMobile ? 11 : 12),
                  color: dark ? "#ccc" : T.text,
                  fontWeight: u ? 600 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {email.subject}
              </div>
              {email.preview && (
                <div
                  style={{
                    fontSize: chrome.previewFont || (isMobile ? 10 : 11),
                    color: dark ? "#777" : T.textMuted,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginTop: 1,
                  }}
                >
                  {email.preview}
                </div>
              )}
            </div>
            {/* Star (Gmail mobile) */}
            {chrome.star && (
              <span
                style={{
                  fontSize: 13,
                  color: dark ? "#555" : "#ccc",
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                &#9734;
              </span>
            )}
            {/* Flag (Outlook) */}
            {chrome.flag && (
              <span
                style={{
                  fontSize: 12,
                  color: dark ? "#555" : "#ccc",
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                &#9873;
              </span>
            )}
            {/* Chevron (iPhone Mail) */}
            {chrome.chevron && (
              <span
                style={{
                  fontSize: 10,
                  color: dark ? "#555" : "#ccc",
                  flexShrink: 0,
                }}
              >
                &#8250;
              </span>
            )}
            <span
              style={{
                fontSize: isMobile ? 9 : 10,
                color: dark ? "#666" : T.textMuted,
                flexShrink: 0,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {timeLabel}
            </span>
          </div>
        );
      })}
    </div>
  );

  const wrappedInbox =
    frame?.type === "iphone" || frame?.type === "android" ? (
      <MobileFrame type={frame.type} screenType={frame.screenType} dark={dark}>
        {inboxList}
      </MobileFrame>
    ) : frame?.type === "browser" ? (
      <BrowserFrame title={device?.name || "Desktop"} dark={dark}>
        {inboxList}
      </BrowserFrame>
    ) : (
      <div
        style={{
          border: `1px solid ${dark ? "#333" : T.border}`,
          borderRadius: T.radius,
          overflow: "hidden",
        }}
      >
        {inboxList}
      </div>
    );

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: sliderStyle }} />
      <SectionHeader
        title={lang === "ja" ? "受信トレイ" : "Inbox Simulator"}
        right={
          <>
            <ExportButtons targetRef={exportRef} filename="inbox" lang={lang} />
            <SmallButton
              onClick={() => setDark(!dark)}
              active={dark}
              style={{ padding: "4px 8px", fontSize: 11 }}
            >
              {dark
                ? lang === "ja"
                  ? "ライト"
                  : "Light"
                : lang === "ja"
                  ? "ダーク"
                  : "Dark"}
            </SmallButton>
            <SmallButton onClick={doShuffle}>
              {lang === "ja" ? "シャッフル" : "Shuffle"}
            </SmallButton>
          </>
        }
      />

      {/* Device selector */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        {DEVICES.map((d) => {
          const active = d.id === deviceId;
          return (
            <button
              key={d.id}
              onClick={() => setDeviceId(d.id)}
              style={{
                padding: "4px 10px",
                borderRadius: 5,
                border: `1px solid ${active ? T.accent : T.border}`,
                fontSize: 10,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: T.font,
                background: active ? T.accentLight : T.surface,
                color: active ? T.accentDark : T.textMuted,
                transition: "all 0.15s",
              }}
            >
              {d.type === "mobile" ? "\u25c9" : "\u25fb"} {d.name}
            </button>
          );
        })}
      </div>

      {/* Browser width slider (desktop devices only) */}
      {!isMobile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
            padding: "8px 12px",
            background: T.bg,
            borderRadius: T.radius,
            border: `1px solid ${T.borderSubtle}`,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: T.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              flexShrink: 0,
            }}
          >
            {lang === "ja" ? "横幅" : "Width"}
          </span>
          <input
            type="range"
            className="pos-slider"
            min={400}
            max={900}
            step={10}
            value={browserWidth}
            onChange={(e) => setBrowserWidth(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: T.text,
              fontVariantNumeric: "tabular-nums",
              minWidth: 44,
              textAlign: "right",
            }}
          >
            {browserWidth}px
          </span>
          {chrome.layoutAuto && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: isHorizontal ? T.accent : T.warning,
                background: isHorizontal ? T.accentLight : T.warningLight,
                padding: "2px 6px",
                borderRadius: 4,
                flexShrink: 0,
                transition: "all 0.2s",
              }}
            >
              {isHorizontal
                ? lang === "ja"
                  ? "横並び"
                  : "Row"
                : lang === "ja"
                  ? "縦積み"
                  : "Stack"}
            </span>
          )}
        </div>
      )}

      {/* Position slider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          padding: "8px 12px",
          background: T.bg,
          borderRadius: T.radius,
          border: `1px solid ${T.borderSubtle}`,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: T.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            flexShrink: 0,
          }}
        >
          {lang === "ja" ? "位置" : "Position"}
        </span>
        <input
          type="range"
          className="pos-slider"
          min={0}
          max={9}
          value={insertIdx}
          onChange={(e) => {
            setInsertIdx(Number(e.target.value));
            setPosMode("manual");
          }}
          style={{ flex: 1 }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: T.text,
            fontVariantNumeric: "tabular-nums",
            minWidth: 44,
            textAlign: "right",
          }}
        >
          {insertIdx + 1} / 10
        </span>
        <button
          onClick={() => {
            setPosMode(posMode === "random" ? "manual" : "random");
            if (posMode === "manual") {
              setInsertIdx(Math.floor(Math.random() * 10));
              setPosMode("random");
            }
          }}
          style={{
            background: "none",
            border: "none",
            fontSize: 10,
            fontWeight: 500,
            color: posMode === "random" ? T.accent : T.textMuted,
            cursor: "pointer",
            padding: "2px 6px",
            borderRadius: 4,
            flexShrink: 0,
            transition: "color 0.15s",
          }}
          title={
            posMode === "random"
              ? lang === "ja"
                ? "シャッフル時にランダム配置"
                : "Random on shuffle"
              : lang === "ja"
                ? "位置を固定中"
                : "Position locked"
          }
        >
          {posMode === "random"
            ? lang === "ja"
              ? "自動"
              : "Auto"
            : lang === "ja"
              ? "固定"
              : "Locked"}
        </button>
      </div>

      <div
        ref={exportRef}
        style={
          !isMobile
            ? {
                maxWidth: browserWidth,
                margin: "0 auto",
                transition: "max-width 0.15s",
              }
            : undefined
        }
      >
        {wrappedInbox}
      </div>
    </div>
  );
}
