import { useState } from "react";
import { T } from "../../constants/tokens";
import SectionHeader from "../common/SectionHeader";
import SmallButton from "../common/SmallButton";
import Card from "../common/Card";

export default function CandidatesPanel({
  candidates,
  activeId,
  setActiveId,
  addCandidate,
  removeCandidate,
  lang,
}) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <Card style={{ padding: 16 }}>
      <SectionHeader
        title={lang === "ja" ? "比較候補" : "Candidates"}
        right={
          <SmallButton
            onClick={addCandidate}
            disabled={candidates.length >= 5}
            style={{ padding: "2px 8px", fontSize: 11 }}
          >
            +
          </SmallButton>
        }
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {candidates.map((c, i) => {
          const isActive = c.id === activeId;
          const isHovered = hoveredId === c.id;
          return (
            <div
              key={c.id}
              onClick={() => setActiveId(c.id)}
              onMouseOver={() => setHoveredId(c.id)}
              onMouseOut={() => setHoveredId(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 6,
                cursor: "pointer",
                background: isActive
                  ? T.accentLight
                  : isHovered
                    ? T.bg
                    : "transparent",
                border: `1px solid ${isActive ? T.accentBorder : "transparent"}`,
                transition: "all 0.12s",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: isActive ? T.accent : T.textMuted,
                  width: 14,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span
                title={c.subject || undefined}
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: c.subject ? T.text : T.textMuted,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {c.subject || (lang === "ja" ? "未入力" : "Empty")}
              </span>
              {candidates.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCandidate(c.id);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: T.textMuted,
                    cursor: "pointer",
                    fontSize: 14,
                    padding: "0 2px",
                    lineHeight: 1,
                    opacity: isHovered ? 1 : 0.4,
                    transition: "opacity 0.15s, color 0.15s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = T.danger;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = T.textMuted;
                  }}
                >
                  {"\u00d7"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
