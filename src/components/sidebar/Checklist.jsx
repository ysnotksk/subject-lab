import { useState, useEffect } from "react";
import { T } from "../../constants/tokens";
import { CHECKLIST_JA, CHECKLIST_EN } from "../../constants/checklist";
import SectionHeader from "../common/SectionHeader";

export default function Checklist({ lang }) {
  const items = lang === "ja" ? CHECKLIST_JA : CHECKLIST_EN;
  const [checks, setChecks] = useState(items.map(() => false));
  useEffect(() => {
    setChecks(items.map(() => false));
  }, [lang]);
  const toggle = (i) => {
    const c = [...checks];
    c[i] = !c[i];
    setChecks(c);
  };
  const done = checks.filter(Boolean).length;

  return (
    <div>
      <SectionHeader
        title={lang === "ja" ? "送信前チェック" : "Pre-send checklist"}
        right={
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: done === items.length ? T.success : T.textMuted,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {done}/{items.length}
          </span>
        }
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((item, i) => (
          <label
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "7px 10px",
              borderRadius: 6,
              cursor: "pointer",
              background: checks[i] ? T.successLight : "transparent",
              border: `1px solid ${checks[i] ? T.successBorder : "transparent"}`,
              transition: "all 0.15s",
            }}
          >
            <input
              type="checkbox"
              checked={checks[i]}
              onChange={() => toggle(i)}
              style={{
                marginTop: 2,
                accentColor: T.success,
                width: 14,
                height: 14,
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: checks[i] ? T.success : T.textSecondary,
                textDecoration: checks[i] ? "line-through" : "none",
                lineHeight: 1.5,
              }}
            >
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
