export type TextRange = { start: number; end: number };
export function clampRange(range: TextRange, length: number): TextRange {
  const start = Math.min(Math.max(0, range.start), length);
  return { start, end: Math.min(Math.max(start, range.end), length) };
}
export function replaceRange(text: string, range: TextRange, replacement: string): string {
  const safe = clampRange(range, text.length);
  return text.slice(0, safe.start) + replacement + text.slice(safe.end);
}
export function findMatches(text: string, query: string, regex: boolean, matchCase: boolean): { matches: TextRange[]; error: string } {
  if (!query) return { matches: [], error: '' };
  try {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(regex ? query : escaped, matchCase ? 'gu' : 'giu');
    const matches: TextRange[] = [];
    for (const match of text.matchAll(pattern)) {
      if (!match[0].length) throw new Error('The expression matches empty strings. Use a pattern with content.');
      matches.push({ start: match.index, end: match.index + match[0].length });
    }
    return { matches, error: '' };
  } catch (error) {
    return { matches: [], error: error instanceof Error ? error.message : 'Invalid expression.' };
  }
}
export function replaceLiteralMatches(text: string, matches: TextRange[], replacement: string): string {
  let output = text;
  for (const match of [...matches].reverse()) output = replaceRange(output, match, replacement);
  return output;
}
export function lineWindow(total: number, scrollTop: number): { first: number; count: number; offset: number } {
  const first = Math.max(0, Math.floor(scrollTop / 24) - 5);
  return { first, count: Math.max(0, Math.min(300, Math.max(1, total) - first)), offset: first * 24 - scrollTop };
}
