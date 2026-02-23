export function tokenizeSubject(text, lang) {
  if (!text) return [];
  if (lang === "ja") {
    const segments = [];
    let current = "";
    const bracketPairs = {
      "\u3010": "\u3011",
      "\u300c": "\u300d",
      "\u300e": "\u300f",
      "(": ")",
      "\uff08": "\uff09",
    };
    let i = 0;
    while (i < text.length) {
      const ch = text[i];
      if (bracketPairs[ch]) {
        if (current) {
          segments.push(current);
          current = "";
        }
        const closer = bracketPairs[ch];
        let bracket = ch;
        i++;
        while (i < text.length && text[i] !== closer) {
          bracket += text[i];
          i++;
        }
        if (i < text.length) {
          bracket += text[i];
          i++;
        }
        segments.push(bracket);
      } else if (
        "\u3001\u3002\uff01\uff1f!? \u30fb\uff1a:\uff0f/".includes(ch)
      ) {
        current += ch;
        segments.push(current);
        current = "";
        i++;
      } else {
        current += ch;
        i++;
      }
    }
    if (current) segments.push(current);
    return segments.filter((s) => s.length > 0);
  } else {
    return text.split(/(\s+)/).filter((s) => s.length > 0);
  }
}

export function analyzeTokenTruncation(tokens, maxChars) {
  let pos = 0;
  return tokens.map((token) => {
    const start = pos;
    const end = pos + token.length;
    pos = end;
    let status = "visible";
    if (start >= maxChars) {
      status = "cut";
    } else if (end > maxChars) {
      status = "partial";
    }
    return { token, start, end, status };
  });
}

export function detectSyntagmaticRedundancy(sender, subject, lang) {
  if (!sender || !subject) return [];
  const findings = [];

  if (lang === "ja") {
    const senderClean = sender
      .replace(/[.co.jp|.com|\u682a\u5f0f\u4f1a\u793e|\u516c\u5f0f]/g, "")
      .trim();
    if (senderClean.length >= 2 && subject.includes(senderClean)) {
      findings.push({
        type: "sender_in_subject",
        shared: senderClean,
        severity: "high",
      });
    }
  } else {
    const senderTokens = sender
      .toLowerCase()
      .split(/[\s.\-_@]+/)
      .filter((t) => t.length > 2);
    const subjectTokens = subject
      .toLowerCase()
      .split(/[\s.\-_@!?:]+/)
      .filter((t) => t.length > 2);
    const shared = senderTokens.filter((t) => subjectTokens.includes(t));
    if (shared.length > 0) {
      findings.push({
        type: "sender_in_subject",
        shared: shared.join(", "),
        severity: shared.length > 1 ? "high" : "medium",
      });
    }
  }

  return findings;
}

export function detectPreviewRedundancy(subject, preview, lang) {
  if (!subject || !preview) return [];
  const findings = [];

  if (lang === "ja") {
    const subChars = new Set(subject.split(""));
    const prevChars = preview.split("");
    const overlap = prevChars.filter(
      (c) => subChars.has(c) && c.match(/[\u3040-\u9fff]/),
    ).length;
    const ratio =
      overlap /
      Math.max(prevChars.filter((c) => c.match(/[\u3040-\u9fff]/)).length, 1);
    if (ratio > 0.5) {
      findings.push({
        type: "preview_echoes_subject",
        ratio: Math.round(ratio * 100),
        severity: ratio > 0.7 ? "high" : "medium",
      });
    }
  } else {
    const subWords = new Set(
      subject
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3),
    );
    const prevWords = preview
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const overlap = prevWords.filter((w) => subWords.has(w));
    const ratio = overlap.length / Math.max(prevWords.length, 1);
    if (ratio > 0.4) {
      findings.push({
        type: "preview_echoes_subject",
        ratio: Math.round(ratio * 100),
        severity: ratio > 0.6 ? "high" : "medium",
      });
    }
  }
  return findings;
}

export function detectParadigmaticSimilarity(subject, pool, lang) {
  if (!subject || !pool || pool.length === 0) return [];
  const findings = [];

  const userOpening = extractOpeningPattern(subject, lang);
  const similarOpeners = pool.filter((email) => {
    const emailOpening = extractOpeningPattern(email.subject, lang);
    return emailOpening && userOpening && emailOpening === userOpening;
  });
  if (similarOpeners.length > 0) {
    findings.push({
      type: "shared_opening_pattern",
      pattern: userOpening,
      count: similarOpeners.length,
      examples: similarOpeners.slice(0, 3).map((e) => e.subject),
      severity:
        similarOpeners.length >= 3
          ? "high"
          : similarOpeners.length >= 2
            ? "medium"
            : "low",
    });
  }

  const userLeadTokens = extractLeadTokens(subject, lang);
  if (userLeadTokens) {
    const similarLeads = pool.filter((email) => {
      const emailLead = extractLeadTokens(email.subject, lang);
      return emailLead && emailLead === userLeadTokens;
    });
    if (similarLeads.length > 0) {
      findings.push({
        type: "shared_lead_tokens",
        tokens: userLeadTokens,
        count: similarLeads.length,
        examples: similarLeads.slice(0, 3).map((e) => e.subject),
        severity: similarLeads.length >= 2 ? "high" : "medium",
      });
    }
  }

  const userEmojiPos = getEmojiPosition(subject);
  if (userEmojiPos !== null) {
    const sameEmojiPos = pool.filter(
      (email) => getEmojiPosition(email.subject) === userEmojiPos,
    );
    if (sameEmojiPos.length >= 2) {
      findings.push({
        type: "shared_emoji_position",
        position: userEmojiPos,
        count: sameEmojiPos.length,
        severity: "low",
      });
    }
  }

  return findings;
}

export function extractOpeningPattern(subject, lang) {
  if (!subject) return null;
  const bracketMatch = subject.match(
    /^[\[【「『（(][^\]】」』）)]*[\]】」』）)]/,
  );
  if (bracketMatch)
    return bracketMatch[0].replace(/[^\[【「『（(\]】」』）)]/g, "\u25a1");
  const emojiMatch = subject.match(
    /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u,
  );
  if (emojiMatch) return "EMOJI_START";
  return null;
}

export function extractLeadTokens(subject, lang) {
  if (!subject) return null;
  if (lang === "ja") {
    const bracket = subject.match(/^【([^】]+)】/);
    if (bracket) return bracket[1];
    return null;
  } else {
    const words = subject.toLowerCase().split(/\s+/).slice(0, 2).join(" ");
    return words || null;
  }
}

export function getEmojiPosition(text) {
  if (!text) return null;
  const match = text.match(
    /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u,
  );
  if (!match) return null;
  const idx = text.indexOf(match[0]);
  if (idx < text.length * 0.3) return "start";
  if (idx > text.length * 0.7) return "end";
  return "middle";
}
