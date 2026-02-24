import { describe, it, expect } from "vitest";
import {
  tokenizeSubject,
  analyzeTokenTruncation,
  detectSyntagmaticRedundancy,
  detectPreviewRedundancy,
  detectParadigmaticSimilarity,
  extractOpeningPattern,
  extractLeadTokens,
  getEmojiPosition,
} from "../linguistic.js";

// ── tokenizeSubject ──────────────────────────────────────────────

describe("tokenizeSubject", () => {
  it("splits English text on whitespace", () => {
    expect(tokenizeSubject("Hello World", "en")).toEqual([
      "Hello",
      " ",
      "World",
    ]);
  });

  it("preserves Japanese bracketed content as single tokens", () => {
    const tokens = tokenizeSubject("【速報】新商品のご案内", "ja");
    expect(tokens[0]).toBe("【速報】");
    expect(tokens.length).toBeGreaterThanOrEqual(2);
  });

  it("splits on Japanese punctuation", () => {
    const tokens = tokenizeSubject("お知らせ！新商品", "ja");
    expect(tokens).toEqual(["お知らせ！", "新商品"]);
  });

  it("handles multiple bracket types in Japanese", () => {
    const tokens = tokenizeSubject("「重要」お知らせ", "ja");
    expect(tokens[0]).toBe("「重要」");
  });

  it("returns empty array for empty string", () => {
    expect(tokenizeSubject("", "en")).toEqual([]);
  });

  it("returns empty array for null/undefined", () => {
    expect(tokenizeSubject(null, "en")).toEqual([]);
    expect(tokenizeSubject(undefined, "ja")).toEqual([]);
  });
});

// ── analyzeTokenTruncation ───────────────────────────────────────

describe("analyzeTokenTruncation", () => {
  it("marks all tokens visible when within limit", () => {
    const result = analyzeTokenTruncation(["Hi", " ", "there"], 20);
    expect(result.every((t) => t.status === "visible")).toBe(true);
  });

  it("marks partial token at boundary", () => {
    const result = analyzeTokenTruncation(["Hello", " ", "World"], 7);
    expect(result[0].status).toBe("visible"); // "Hello" 0-5
    expect(result[1].status).toBe("visible"); // " " 5-6
    expect(result[2].status).toBe("partial"); // "World" 6-11, boundary at 7
  });

  it("marks tokens beyond limit as cut", () => {
    // "Hello"=0-5, " "=5-6, "World"=6-11; maxChars=5
    // " " starts at 5 which >= maxChars → cut
    const result = analyzeTokenTruncation(["Hello", " ", "World"], 5);
    expect(result[0].status).toBe("visible");
    expect(result[1].status).toBe("cut");
    expect(result[2].status).toBe("cut");
  });

  it("handles empty tokens array", () => {
    expect(analyzeTokenTruncation([], 10)).toEqual([]);
  });

  it("marks everything cut at zero maxChars", () => {
    const result = analyzeTokenTruncation(["Hello"], 0);
    expect(result[0].status).toBe("cut");
  });

  it("records correct start/end positions", () => {
    const result = analyzeTokenTruncation(["AB", "CD", "EF"], 100);
    expect(result[0]).toMatchObject({ start: 0, end: 2 });
    expect(result[1]).toMatchObject({ start: 2, end: 4 });
    expect(result[2]).toMatchObject({ start: 4, end: 6 });
  });
});

// ── detectSyntagmaticRedundancy ──────────────────────────────────

describe("detectSyntagmaticRedundancy", () => {
  it("detects EN sender word in subject", () => {
    const result = detectSyntagmaticRedundancy(
      "Acme Corp",
      "Acme Weekly Newsletter",
      "en",
    );
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("sender_in_subject");
    expect(result[0].shared).toContain("acme");
  });

  it("returns empty when EN sender and subject have no overlap", () => {
    const result = detectSyntagmaticRedundancy(
      "Acme Corp",
      "Weekly Newsletter Update",
      "en",
    );
    expect(result).toEqual([]);
  });

  it("detects JA company name overlap", () => {
    const result = detectSyntagmaticRedundancy(
      "テスト株式会社",
      "テストからのお知らせ",
      "ja",
    );
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe("high");
  });

  it("returns empty for null inputs", () => {
    expect(detectSyntagmaticRedundancy(null, "subject", "en")).toEqual([]);
    expect(detectSyntagmaticRedundancy("sender", null, "en")).toEqual([]);
  });
});

// ── detectPreviewRedundancy ──────────────────────────────────────

describe("detectPreviewRedundancy", () => {
  it("detects high EN overlap (>60%)", () => {
    const subject = "Save money today with great deals";
    const preview = "Save money today with great deals and more";
    const result = detectPreviewRedundancy(subject, preview, "en");
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe("high");
  });

  it("detects medium EN overlap (40-60%)", () => {
    // Words >3 chars: subject {"save","money","today"}, preview has 5 words >3 chars
    // 3 overlap out of 5 = 0.6 → triggers medium (>0.4 but <=0.6)
    const subject = "Save money today with extras";
    const preview = "Save money today with some other content here";
    const result = detectPreviewRedundancy(subject, preview, "en");
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe("medium");
  });

  it("returns empty for low EN overlap", () => {
    const subject = "Breaking news today";
    const preview = "Check out these amazing deals on electronics";
    const result = detectPreviewRedundancy(subject, preview, "en");
    expect(result).toEqual([]);
  });

  it("detects JA CJK character overlap", () => {
    const subject = "新商品のご案内です";
    const preview = "新商品のご案内をお届けします";
    const result = detectPreviewRedundancy(subject, preview, "ja");
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("preview_echoes_subject");
  });

  it("returns empty for empty preview", () => {
    expect(detectPreviewRedundancy("subject", "", "en")).toEqual([]);
  });

  it("returns empty for null inputs", () => {
    expect(detectPreviewRedundancy(null, "preview", "en")).toEqual([]);
  });
});

// ── detectParadigmaticSimilarity ─────────────────────────────────

describe("detectParadigmaticSimilarity", () => {
  it("detects shared opening pattern", () => {
    const subject = "[NEWS] Breaking story";
    const pool = [
      { subject: "[NEWS] Another story" },
      { subject: "[NEWS] Third story" },
    ];
    const result = detectParadigmaticSimilarity(subject, pool, "en");
    const opening = result.find((f) => f.type === "shared_opening_pattern");
    expect(opening).toBeDefined();
    expect(opening.count).toBe(2);
  });

  it("detects shared lead tokens", () => {
    const subject = "Weekly update from us";
    const pool = [
      { subject: "Weekly update on products" },
      { subject: "Weekly update for members" },
    ];
    const result = detectParadigmaticSimilarity(subject, pool, "en");
    const leads = result.find((f) => f.type === "shared_lead_tokens");
    expect(leads).toBeDefined();
  });

  it("detects shared emoji position", () => {
    const subject = "🔥 Hot deals";
    const pool = [{ subject: "🎉 Big sale" }, { subject: "🚀 Launch day" }];
    const result = detectParadigmaticSimilarity(subject, pool, "en");
    const emoji = result.find((f) => f.type === "shared_emoji_position");
    expect(emoji).toBeDefined();
    expect(emoji.position).toBe("start");
  });

  it("returns empty when no similarity found", () => {
    const subject = "Hello world";
    const pool = [{ subject: "Goodbye everyone" }];
    const result = detectParadigmaticSimilarity(subject, pool, "en");
    expect(result).toEqual([]);
  });

  it("returns empty for empty pool", () => {
    expect(detectParadigmaticSimilarity("test", [], "en")).toEqual([]);
  });

  it("returns empty for null inputs", () => {
    expect(detectParadigmaticSimilarity(null, [], "en")).toEqual([]);
  });
});

// ── extractOpeningPattern ────────────────────────────────────────

describe("extractOpeningPattern", () => {
  it("detects [] bracket pattern", () => {
    expect(extractOpeningPattern("[NEWS] Hello", "en")).toBe("[□□□□]");
  });

  it("detects 【】bracket pattern", () => {
    expect(extractOpeningPattern("【速報】ニュース", "ja")).toBe("【□□】");
  });

  it("detects 「」bracket pattern", () => {
    expect(extractOpeningPattern("「重要」お知らせ", "ja")).toBe("「□□」");
  });

  it("detects emoji start", () => {
    expect(extractOpeningPattern("🔥 Hot deals", "en")).toBe("EMOJI_START");
  });

  it("returns null for no pattern", () => {
    expect(extractOpeningPattern("Hello world", "en")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(extractOpeningPattern(null, "en")).toBeNull();
  });
});

// ── extractLeadTokens ────────────────────────────────────────────

describe("extractLeadTokens", () => {
  it("extracts JA content inside 【】", () => {
    expect(extractLeadTokens("【速報】ニュース", "ja")).toBe("速報");
  });

  it("extracts EN first 2 words lowercased", () => {
    expect(extractLeadTokens("Breaking News Today", "en")).toBe(
      "breaking news",
    );
  });

  it("returns null for JA without 【】 brackets", () => {
    expect(extractLeadTokens("お知らせです", "ja")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(extractLeadTokens(null, "en")).toBeNull();
  });
});

// ── getEmojiPosition ─────────────────────────────────────────────

describe("getEmojiPosition", () => {
  it("detects emoji at start", () => {
    expect(getEmojiPosition("🔥 Hot deals")).toBe("start");
  });

  it("detects emoji at end", () => {
    expect(getEmojiPosition("Check this out 🔥")).toBe("end");
  });

  it("detects emoji in middle", () => {
    // Emoji needs to be between 30%-70% of text length
    expect(getEmojiPosition("Here is some text 🔥 and more text")).toBe(
      "middle",
    );
  });

  it("returns null for no emoji", () => {
    expect(getEmojiPosition("Hello World")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(getEmojiPosition(null)).toBeNull();
  });
});
