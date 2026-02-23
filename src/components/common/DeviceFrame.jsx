export function MobileFrame({ type, screenType, dark, children }) {
  const isIphone = type === "iphone";
  const bezelColor = dark ? "#000" : "#1a1a1a";
  const screenBg = dark ? "#1a1a1a" : "#f2f2f7";
  const bezelRadius = isIphone ? 36 : 20;
  const bezelPadding = isIphone ? "0 8px 8px" : "0 6px 6px";
  const iconColor = dark ? "#aaa" : "#fff";

  return (
    <div
      style={{
        background: bezelColor,
        borderRadius: bezelRadius,
        padding: bezelPadding,
        maxWidth: 340,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Status bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: isIphone ? "8px 16px 4px" : "4px 10px 3px",
          color: iconColor,
          fontSize: 9,
          fontWeight: 600,
        }}
      >
        <span>9:41</span>
        {isIphone && screenType === "island" && (
          <div
            style={{
              width: 60,
              height: 16,
              borderRadius: 10,
              background: "#000",
            }}
          />
        )}
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          <svg width="12" height="9" viewBox="0 0 12 9">
            <rect x="0" y="6" width="2" height="3" rx="0.5" fill={iconColor} />
            <rect x="3" y="4" width="2" height="5" rx="0.5" fill={iconColor} />
            <rect x="6" y="2" width="2" height="7" rx="0.5" fill={iconColor} />
            <rect x="9" y="0" width="2" height="9" rx="0.5" fill={iconColor} />
          </svg>
          <svg width="16" height="9" viewBox="0 0 16 9">
            <rect
              x="0.5"
              y="0.5"
              width="13"
              height="8"
              rx="1.5"
              fill="none"
              stroke={iconColor}
              strokeWidth="0.8"
            />
            <rect x="2" y="2" width="9" height="5" rx="0.5" fill={iconColor} />
            <rect
              x="14"
              y="2.5"
              width="1.5"
              height="4"
              rx="0.5"
              fill={iconColor}
            />
          </svg>
        </div>
      </div>

      {/* Screen */}
      <div
        style={{
          background: screenBg,
          borderRadius: isIphone ? 28 : 14,
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      {/* Home indicator */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: isIphone ? "6px 0 2px" : "4px 0 1px",
        }}
      >
        <div
          style={{
            width: isIphone ? 80 : 40,
            height: isIphone ? 4 : 3,
            borderRadius: 2,
            background: "rgba(255,255,255,0.3)",
          }}
        />
      </div>
    </div>
  );
}

export function BrowserFrame({ title, dark, children }) {
  const bg = dark ? "#2a2a2a" : "#f0f0f0";
  const border = dark ? "#444" : "#d1d5db";
  const textColor = dark ? "#aaa" : "#666";
  const contentBg = dark ? "#1a1a1a" : "#fff";

  return (
    <div
      style={{
        borderRadius: 8,
        border: `1px solid ${border}`,
        overflow: "hidden",
        background: contentBg,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 10px",
          background: bg,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div
              key={c}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 9, color: textColor, marginLeft: 6 }}>
          {title}
        </span>
      </div>
      {/* Content */}
      <div style={{ background: contentBg }}>{children}</div>
    </div>
  );
}
