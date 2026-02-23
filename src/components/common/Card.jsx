import { T } from "../../constants/tokens";

const VARIANTS = {
  default: {},
  analysis: { background: T.bg },
  ai: { borderLeft: `4px solid ${T.accent}` },
};

export default function Card({ children, style, variant = "default" }) {
  return (
    <div
      style={{
        background: T.surface,
        borderRadius: T.radiusLg,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadow,
        ...VARIANTS[variant],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
