import { useState } from "react";
import { T } from "../../constants/tokens";

export default function SmallButton({
  children,
  onClick,
  disabled,
  active,
  style: s,
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      style={{
        background: active
          ? hovered && !disabled
            ? T.accentDark
            : T.accent
          : hovered && !disabled
            ? T.bg
            : "none",
        color: active ? "#fff" : T.textMuted,
        border: active ? "none" : `1px solid ${T.border}`,
        borderRadius: 6,
        padding: "5px 12px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 12,
        fontWeight: 500,
        transition: "all 0.15s",
        opacity: disabled ? 0.4 : 1,
        letterSpacing: "0.01em",
        ...s,
      }}
    >
      {children}
    </button>
  );
}
