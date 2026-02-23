import { T } from "../../constants/tokens";
import { truncate } from "../../utils/helpers";
import SectionHeader from "../common/SectionHeader";
import ExportButtons from "../common/ExportButtons";

export default function NotificationPreview({
  sender,
  subject,
  preview,
  lang,
  exportRef,
}) {
  const s = sender || (lang === "ja" ? "送信者" : "Sender");
  const sub = subject || (lang === "ja" ? "件名未入力" : "No subject");

  return (
    <div>
      <SectionHeader
        title={lang === "ja" ? "ロック画面プレビュー" : "Lock Screen Preview"}
        right={
          <ExportButtons
            targetRef={exportRef}
            filename="notification"
            lang={lang}
          />
        }
      />
      <div
        ref={exportRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {/* iPhone */}
        <div
          style={{
            borderRadius: 20,
            background: "#0c0c0e",
            padding: 24,
            minHeight: 270,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(30,58,95,0.5), transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              <span>9:41</span>
              <span style={{ fontSize: 11 }}>
                {"\u25cf\u25cf\u25cf"} {"\u258c\u2588"}
              </span>
            </div>
            <div style={{ textAlign: "center", margin: "20px 0 28px" }}>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 200,
                  color: "#fff",
                  letterSpacing: "-3px",
                  lineHeight: 1,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                9:41
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 6,
                  fontWeight: 400,
                }}
              >
                {lang === "ja" ? "2月21日 土曜日" : "Saturday, February 21"}
              </div>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(30px)",
                borderRadius: 14,
                padding: "11px 14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 5,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: "#3478f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    color: "#fff",
                  }}
                >
                  {"\u2709"}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.45)",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {lang === "ja" ? "メール" : "Mail"}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.3)",
                    marginLeft: "auto",
                  }}
                >
                  {lang === "ja" ? "今" : "now"}
                </span>
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#fff",
                  marginBottom: 2,
                }}
              >
                {truncate(s, 20)}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 400,
                  marginBottom: 2,
                }}
              >
                {truncate(sub, lang === "ja" ? 22 : 44)}
              </div>
              {preview && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  {truncate(preview, lang === "ja" ? 28 : 56)}
                </div>
              )}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 96,
              height: 4,
              background: "rgba(255,255,255,0.2)",
              borderRadius: 2,
            }}
          />
        </div>

        {/* Android */}
        <div
          style={{
            borderRadius: 20,
            background: "#121212",
            padding: 24,
            minHeight: 270,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              fontWeight: 500,
              marginBottom: 6,
            }}
          >
            <span>9:41</span>
            <span style={{ fontSize: 11 }}>
              {"\u258c\u258c\u258c"} {"\u2588"} 85%
            </span>
          </div>
          <div style={{ textAlign: "center", margin: "20px 0 28px" }}>
            <div
              style={{
                fontSize: 56,
                fontWeight: 200,
                color: "#fff",
                letterSpacing: "-2px",
                lineHeight: 1,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              9:41
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.35)",
                marginTop: 6,
              }}
            >
              {lang === "ja" ? "2月21日（土）" : "Sat, Feb 21"}
            </div>
          </div>
          <div
            style={{
              background: "rgba(40,40,40,0.95)",
              borderRadius: 16,
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: "#ea4335",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  color: "#fff",
                }}
              >
                {"\u2709"}
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  fontWeight: 500,
                }}
              >
                Gmail
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.25)",
                  marginLeft: "auto",
                }}
              >
                {lang === "ja" ? "たった今" : "Just now"}
              </span>
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: "#fff",
                marginBottom: 3,
              }}
            >
              {truncate(s, 22)}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "rgba(255,255,255,0.75)",
                marginBottom: 2,
              }}
            >
              {truncate(sub, lang === "ja" ? 24 : 48)}
            </div>
            {preview && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                {truncate(preview, lang === "ja" ? 30 : 60)}
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: 16,
                marginTop: 10,
                paddingTop: 8,
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ fontSize: 11, color: "#8ab4f8", fontWeight: 500 }}>
                {lang === "ja" ? "返信" : "Reply"}
              </span>
              <span style={{ fontSize: 11, color: "#8ab4f8", fontWeight: 500 }}>
                {lang === "ja" ? "アーカイブ" : "Archive"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
