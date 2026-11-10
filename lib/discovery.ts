import { tools, type Tool } from './operations';

export type OperationResult = { tool: Tool; label: string; mode?: 'remove' | 'keep' };
const aliases: Record<string, string[]> = {
  empty: ['remove empty lines', 'delete empty lines', 'delete blank lines', 'remove blank lines', 'blank lines', 'strip empty lines'],
  dedupe: ['remove repeated lines', 'remove duplicate lines', 'delete duplicates', 'unique lines', 'dedupe', 'deduplicate'],
  dedupeWords: ['remove repeated words', 'duplicate words'],
  trim: ['trim spaces', 'strip whitespace', 'trim edges'],
  spaces: ['remove extra spaces', 'collapse spaces', 'double spaces'],
  accents: ['strip accents', 'remove accents', 'remove diacritics'],
  punctuation: ['strip punctuation', 'remove symbols'],
  digits: ['remove numbers', 'remove digits'],
  upper: ['convert uppercase', 'all caps', 'capital letters'],
  lower: ['convert lowercase', 'small letters'],
  title: ['capitalize words', 'initial caps'],
  sentence: ['sentence case'],
  reverseText: ['reverse text', 'flip characters', 'mirror text'],
  affix: ['add prefix', 'add suffix', 'wrap lines'],
  number: ['number lines', 'add line numbers'],
  sort: ['organize list', 'sort list', 'sort lines', 'alphabetize'],
  filter: ['filter line content', 'search lines', 'remove lines containing', 'remove lines that contain', 'delete lines containing', 'keep lines containing', 'keep lines that contain', 'remove lines starting with', 'remove lines ending with'],
  split: ['separate text', 'split columns'],
  join: ['merge lines', 'combine lines into one'],
  column: ['extract column', 'pick csv column'],
  compare: ['compare lists', 'list intersection', 'list difference'],
  merge: ['combine lists', 'merge two lists'],
  sample: ['pick random lines', 'random picker', 'draw items'],
};
const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
const stopWords = new Set(['the', 'an', 'of', 'that', 'with', 'by', 'for', 'my', 'to', 'in', 'on', 'at', 'all', 'from', 'lines', 'line', 'text']);

export function searchTools(query: string, limit = 6): OperationResult[] {
  const normalized = normalize(query);
  if (!normalized) return [];
  const tokens = normalized.split(' ').filter(token => token.length > 1 && !stopWords.has(token));
  const results: { result: OperationResult; score: number; order: number }[] = [];
  tools.forEach((tool, order) => {
    const title = tool.id === 'filter' ? 'Remove lines that contain' : tool.name;
    const base: OperationResult = { tool, label: title, ...(tool.id === 'filter' ? { mode: 'remove' as const } : {}) };
    const phrases = [tool.name, tool.description, ...tool.fields.map(field => field.label), ...(aliases[tool.id] ?? [])].map(normalize);
    const phraseMatch = phrases.some(phrase => phrase === normalized);
    const prefixMatch = phrases.some(phrase => phrase.startsWith(normalized) || normalized.startsWith(phrase));
    const coverage = tokens.length ? tokens.filter(token => phrases.some(phrase => phrase.includes(token))).length / tokens.length : 0;
    const direct = normalize(tool.name).includes(normalized) || phrases.some(phrase => phrase.includes(normalized));
    const score = phraseMatch ? 100 : prefixMatch ? 80 : direct ? 65 : coverage * 50;
    if (score > 0 && (direct || coverage >= 0.5)) results.push({ result: base, score, order });
  });
  const wantsKeep = /\b(keep|preserve|retain|include)\b/.test(normalized);
  if (wantsKeep && results[0]?.result.tool.id === 'filter') results[0].result = { ...results[0].result, mode: 'keep', label: 'Keep lines that contain' };
  return results.sort((a, b) => b.score - a.score || a.order - b.order).slice(0, limit).map(item => item.result);
}
