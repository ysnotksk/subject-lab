import { useState, useEffect, useRef, useCallback } from "react";
import { T } from "../../constants/tokens";
import { DEVICES } from "../../constants/devices";
import { truncate, senderColor } from "../../utils/helpers";
import {
  tokenizeSubject,
  analyzeTokenTruncation,
} from "../../utils/linguistic";
import { load, save } from "../../utils/storage";
import SectionHeader from "../common/SectionHeader";
import ExportButtons from "../common/ExportButtons";

// Average character width at 11px font (px per char)
const AVG_CHAR_W = { ja: 11, en: 6.5 };
// Fixed-width elements in Gmail horizontal row: checkbox(14) + star(14) + gap(4) + sender(130) + gaps(24) + date(40) + padding(20)
const GMAIL_ROW_FIXED_W = 246;

function Avatar({ name, size = 22, radius = "50%" }) {
  const c = senderColor(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: c,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.45,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {(name || "?").charAt(0)}
    </div>
  );
}

function UnreadIndicator({ style: unreadStyle }) {
  if (unreadStyle === "dot") {
    return (
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#007aff",
          flexShrink: 0,
        }}
      />
    );
  }
  if (unreadStyle === "bar") {
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: "#0078d4",
          borderRadius: "0 2px 2px 0",
        }}
      />
    );
  }
  return null;
}

export default function DevicePreview({
  sender,
  senderIcon,
  subject,
  preview,
  lang,
  exportRef,
}) {
  const [activeDevices, setActiveDevices] = useState(() =>
    load(
      "activeDevices",
      DEVICES.map((d) => d.id),
    ),
  );

  const [cardWidths, setCardWidths] = useState({});
  const cardRefs = useRef({});

  const setCardRef = useCallback((id, el) => {
    if (el) cardRefs.current[id] = el;
  }, []);

  useEffect(() => {
    const entries = Object.entries(cardRefs.current);
    if (!entries.length) return;
    const ro = new ResizeObserver((obs) => {
      const next = {};
      for (const entry of obs) {
        const id = entry.target.dataset.deviceId;
        if (id) next[id] = entry.contentRect.width;
      }
      setCardWidths((prev) => ({ ...prev, ...next }));
    });
    for (const [, el] of entries) ro.observe(el);
    return () => ro.disconnect();
  }, [activeDevices]);

  useEffect(() => save("activeDevices", activeDevices), [activeDevices]);

  const toggleDevice = (id) => {
    setActiveDevices((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  };

  const filtered = DEVICES.filter((d) => activeDevices.includes(d.id));

  return (
    <div>
      <SectionHeader
        title={lang === "ja" ? "デバイス別プレビュー" : "Device Previews"}
        right={
          <ExportButtons targetRef={exportRef} filename="devices" lang={lang} />
        }
      />

      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        {DEVICES.map((d) => {
          const active = activeDevices.includes(d.id);
          return (
            <button
              key={d.id}
              onClick={() => toggleDevice(d.id)}
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

      <div
        ref={exportRef}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit, minmax(${filtered.length <= 2 ? "280px" : "210px"}, 1fr))`,
          gap: 12,
        }}
      >
        {filtered.map((d) => {
          // For responsive devices (Gmail Desktop), compute subMax from card width
          let subMax = lang === "ja" ? d.subjectCharsJa : d.subjectCharsEn;
          const isResponsive = !!d.chrome?.layoutAuto;
          if (isResponsive && cardWidths[d.id]) {
            const availW = cardWidths[d.id] - GMAIL_ROW_FIXED_W;
            subMax = Math.max(10, Math.floor(availW / AVG_CHAR_W[lang]));
          }
          const isCut = (subject || "").length > subMax;
          const truncPrev = truncate(
            preview || "",
            lang === "ja" ? d.previewCharsJa : d.previewCharsEn,
          );
          const truncSender = truncate(
            sender || (lang === "ja" ? "送信者" : "Sender"),
            d.senderChars,
          );
          const senderName = sender || (lang === "ja" ? "送信者" : "Sender");
          const tokens = tokenizeSubject(subject || "", lang);
          const analysis = analyzeTokenTruncation(tokens, subMax);
          const ch = d.chrome || {};
          const isUnreadBold = ch.unread === "bold";

          return (
            <div
              key={d.id}
              ref={(el) => setCardRef(d.id, el)}
              data-device-id={d.id}
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: T.radius,
                padding: 12,
                background: T.bg,
              }}
            >
              {/* Device label + CUT badge */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: T.textMuted,
                    letterSpacing: "0.03em",
                  }}
                >
                  {d.type === "mobile" ? "\u25c9" : "\u25fb"} {d.name}
                </span>
                {isCut && (
                  <span
                    style={{
                      fontSize: 9,
                      background: T.dangerLight,
                      color: T.danger,
                      padding: "1px 5px",
                      borderRadius: 3,
                      fontWeight: 600,
                    }}
                  >
                    CUT
                  </span>
                )}
              </div>

              {/* Email row mockup */}
              <div
                style={{
                  background: T.surface,
                  borderRadius: 6,
                  padding: ch.rowPadding || "8px 10px",
                  border: `1px solid ${T.borderSubtle}`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Outlook unread bar */}
                {ch.unread === "bar" && <UnreadIndicator style="bar" />}

                {ch.layoutAuto ? (
                  /* Desktop horizontal single-row layout */
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ch.contentGap || 8,
                    }}
                  >
                    {/* Chrome icons (checkbox/star/flag) */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                        color: T.textMuted,
                        opacity: 0.5,
                        fontSize: 11,
                      }}
                    >
                      {ch.checkbox && <span>{"☐"}</span>}
                      {ch.star && <span>{"☆"}</span>}
                      {ch.flag && <span>{"⚑"}</span>}
                    </div>

                    {/* Avatar (Outlook) */}
                    {ch.avatar &&
                      (senderIcon ? (
                        <img
                          src={senderIcon}
                          alt=""
                          style={{
                            width: ch.avatarSize || 28,
                            height: ch.avatarSize || 28,
                            borderRadius: ch.avatarRadius || "50%",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: ch.avatarSize || 28,
                            height: ch.avatarSize || 28,
                            borderRadius: ch.avatarRadius || "50%",
                            background: T.accent + "18",
                            color: T.accent,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {senderName.charAt(0)}
                        </div>
                      ))}

                    {/* Sender — fixed width */}
                    <div
                      style={{
                        fontWeight: isUnreadBold ? 700 : 600,
                        fontSize: ch.senderFont || 12,
                        color: T.text,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: 130,
                        flexShrink: 0,
                      }}
                    >
                      {truncSender}
                    </div>

                    {/* Subject + optional preview */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: ch.subjectFont || 11,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: 1.4,
                      }}
                    >
                      {subject ? (
                        <>
                          {analysis.map((a, i) => (
                            <span
                              key={i}
                              style={{
                                fontWeight:
                                  a.status === "partial"
                                    ? 700
                                    : isUnreadBold
                                      ? 600
                                      : 500,
                                color:
                                  a.status === "visible"
                                    ? T.text
                                    : a.status === "partial"
                                      ? T.warning
                                      : T.textMuted,
                                textDecoration:
                                  a.status === "cut" ? "line-through" : "none",
                                background:
                                  a.status === "partial"
                                    ? T.warningLight
                                    : "transparent",
                                borderRadius: a.status === "partial" ? 2 : 0,
                                padding: a.status === "partial" ? "0 1px" : 0,
                              }}
                            >
                              {a.token}
                            </span>
                          ))}
                          {isCut && (
                            <span style={{ color: T.danger, fontWeight: 700 }}>
                              {"\u2026"}
                            </span>
                          )}
                          {truncPrev && (
                            <span
                              style={{ color: T.textMuted, fontWeight: 400 }}
                            >
                              {" — "}
                              {truncPrev}
                            </span>
                          )}
                        </>
                      ) : (
                        <span style={{ color: T.textMuted }}>
                          {lang === "ja" ? "件名未入力" : "No subject"}
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <span
                      style={{
                        fontSize: 10,
                        color: T.textMuted,
                        flexShrink: 0,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      22 Feb
                    </span>
                  </div>
                ) : (
                  /* Standard stacked layout — mobile clients + Outlook */
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: ch.contentGap || 8,
                      paddingLeft: ch.unread === "bar" ? 4 : 0,
                    }}
                  >
                    {/* Unread dot (iPhone Mail) */}
                    {ch.unread === "dot" && (
                      <div style={{ paddingTop: 5, flexShrink: 0 }}>
                        <UnreadIndicator style="dot" />
                      </div>
                    )}

                    {/* Avatar */}
                    {ch.avatar && (
                      <div style={{ paddingTop: 1, flexShrink: 0 }}>
                        {senderIcon ? (
                          <img
                            src={senderIcon}
                            alt=""
                            style={{
                              width: ch.avatarSize || 24,
                              height: ch.avatarSize || 24,
                              borderRadius: ch.avatarRadius || "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Avatar
                            name={senderName}
                            size={ch.avatarSize || 24}
                            radius={ch.avatarRadius || "50%"}
                          />
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Sender row with time */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 4,
                          marginBottom: 1,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: isUnreadBold ? 700 : 600,
                            fontSize: ch.senderFont || 11,
                            color: T.text,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {truncSender}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 9,
                              color: T.textMuted,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            9:41
                          </span>
                          {ch.chevron && (
                            <span style={{ fontSize: 10, color: T.textMuted }}>
                              {"\u203a"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Subject with truncation analysis */}
                      <div
                        style={{
                          fontSize: ch.subjectFont || 11,
                          fontWeight: isUnreadBold ? 600 : 500,
                          lineHeight: 1.4,
                        }}
                      >
                        {ch.subjectIcon && (
                          <span
                            style={{
                              fontSize: (ch.subjectFont || 11) - 1,
                              marginRight: 3,
                              opacity: 0.6,
                            }}
                          >
                            {ch.subjectIcon}
                          </span>
                        )}
                        {subject ? (
                          analysis.map((a, i) => (
                            <span
                              key={i}
                              style={{
                                color:
                                  a.status === "visible"
                                    ? T.text
                                    : a.status === "partial"
                                      ? T.warning
                                      : T.textMuted,
                                textDecoration:
                                  a.status === "cut" ? "line-through" : "none",
                                fontWeight:
                                  a.status === "partial" ? 700 : undefined,
                                background:
                                  a.status === "partial"
                                    ? T.warningLight
                                    : "transparent",
                                borderRadius: a.status === "partial" ? 2 : 0,
                                padding: a.status === "partial" ? "0 1px" : 0,
                              }}
                            >
                              {a.token}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: T.textMuted }}>
                            {lang === "ja" ? "件名未入力" : "No subject"}
                          </span>
                        )}
                        {isCut && (
                          <span style={{ color: T.danger, fontWeight: 700 }}>
                            {"\u2026"}
                          </span>
                        )}
                      </div>

                      {/* Preview text */}
                      {truncPrev && (
                        <div
                          style={{
                            fontSize: ch.previewFont || 10,
                            color: T.textMuted,
                            marginTop: 1,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {truncPrev}
                        </div>
                      )}
                    </div>

                    {/* Star / Flag — aligned to top of sender row */}
                    {(ch.star || ch.flag) && (
                      <div
                        style={{
                          flexShrink: 0,
                          alignSelf: "flex-start",
                          paddingTop: 1,
                          lineHeight: 1,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            color: T.textMuted,
                            opacity: 0.4,
                          }}
                        >
                          {ch.flag ? "\u2691" : "\u2606"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Character count */}
              <div
                style={{
                  marginTop: 4,
                  fontSize: 10,
                  color: T.textMuted,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {(subject || "").length}/{subMax}
                {isResponsive && (
                  <span style={{ fontSize: 9, marginLeft: 4, opacity: 0.6 }}>
                    ↔
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {subject &&
        DEVICES.some(
          (d) =>
            (subject || "").length >
            (lang === "ja" ? d.subjectCharsJa : d.subjectCharsEn),
        ) && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 16,
              fontSize: 10,
              color: T.textMuted,
              alignItems: "center",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: T.warningLight,
                  border: `1px solid ${T.warning}`,
                }}
              />
              {lang === "ja" ? "途中で切れる語" : "Broken word"}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: T.bg,
                  border: `1px solid ${T.textMuted}`,
                  textDecoration: "line-through",
                }}
              />
              {lang === "ja" ? "消失する語" : "Lost"}
            </span>
          </div>
        )}
    </div>
  );
}
