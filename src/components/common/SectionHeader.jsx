import { T } from "../../constants/tokens";

export default function SectionHeader({ title, right }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          color: T.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontFamily: T.font,
        }}
      >
        {title}
      </h3>
      {right && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {right}
        </div>
      )}
    </div>
  );
}
