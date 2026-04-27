const CYRILLIC_NORMALIZE_MAP: Record<string, string> = {
  ё: "е",
  й: "и",
};

const LATIN_HINTS: Array<[RegExp, string]> = [
  [/zadv/gi, "задв"],
  [/kran/gi, "кран"],
  [/shar/gi, "шар"],
  [/zatvor/gi, "затвор"],
  [/klapan/gi, "клапан"],
  [/armatur/gi, "арматур"],
];

export function isFuzzyCatalogMatch(query: string, haystack: string): boolean {
  const q = normalize(query);
  if (!q) return true;

  const directNeedles = new Set([q, withLatinHints(q)]);
  const normalizedHay = normalize(haystack);
  for (const needle of directNeedles) {
    if (needle && normalizedHay.includes(needle)) return true;
  }

  const queryTokens = tokenize(q);
  if (!queryTokens.length) return true;
  const hayTokens = tokenize(normalizedHay);
  if (!hayTokens.length) return false;

  return queryTokens.every((qToken) => {
    if (qToken.length <= 2) {
      return hayTokens.some((h) => h.includes(qToken));
    }
    if (hayTokens.some((h) => h.includes(qToken) || qToken.includes(h))) {
      return true;
    }
    if (qToken.length < 4) return false;

    const maxDistance = qToken.length <= 5 ? 1 : 2;
    return hayTokens.some((h) => {
      if (Math.abs(h.length - qToken.length) > maxDistance) return false;
      return levenshteinDistanceBounded(qToken, h, maxDistance) <= maxDistance;
    });
  });
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[ёй]/g, (char) => CYRILLIC_NORMALIZE_MAP[char] ?? char)
    .replace(/\s+/g, " ");
}

function tokenize(value: string): string[] {
  return value
    .split(/[^a-zа-я0-9]+/i)
    .map((v) => v.trim())
    .filter(Boolean);
}

function withLatinHints(query: string): string {
  let out = query;
  for (const [pattern, replacement] of LATIN_HINTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function levenshteinDistanceBounded(a: string, b: string, maxDistance: number): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost,
      );
      rowMin = Math.min(rowMin, curr[j]);
    }
    if (rowMin > maxDistance) return maxDistance + 1;
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}
