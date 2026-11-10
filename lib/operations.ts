export type Field = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox';
  defaultValue: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
};

export type Tool = {
  id: string;
  category: 'clean' | 'transform' | 'lines' | 'lists';
  name: string;
  description: string;
  fields: Field[];
};

export const tools: Tool[] = [
  {
    id: 'empty',
    category: 'clean',
    name: 'Empty lines',
    description: 'Removes empty lines and lines that contain only whitespace.',
    fields: [],
  },
  {
    id: 'dedupe',
    category: 'clean',
    name: 'Duplicate lines',
    description: 'Removes duplicate lines, keeping the first occurrence as written.',
    fields: [
      {
        key: 'ignoreCase',
        label: 'Ignore case',
        type: 'checkbox',
        defaultValue: 'false',
      },
    ],
  },
  {
    id: 'dedupeWords',
    category: 'clean',
    name: 'Duplicate words',
    description: 'Removes repeated words, keeping the order of their first occurrence.',
    fields: [
      {
        key: 'ignoreCase',
        label: 'Ignore case',
        type: 'checkbox',
        defaultValue: 'false',
      },
      {
        key: 'separator',
        label: 'Normalized separator',
        type: 'text',
        defaultValue: '',
        placeholder: 'Optional; leave empty to keep the original separators',
      },
      {
        key: 'normalizeSeparator',
        label: 'Normalize separator',
        type: 'checkbox',
        defaultValue: 'false',
      },
    ],
  },
  {
    id: 'trim',
    category: 'clean',
    name: 'Trim lines',
    description: 'Removes leading and trailing whitespace from each line.',
    fields: [],
  },
  {
    id: 'spaces',
    category: 'clean',
    name: 'Extra spaces',
    description: 'Collapses runs of spaces and tabs into a single space.',
    fields: [],
  },
  {
    id: 'accents',
    category: 'clean',
    name: 'Remove accents',
    description: 'Strips diacritical marks without changing the order of the text.',
    fields: [],
  },
  {
    id: 'punctuation',
    category: 'clean',
    name: 'Remove punctuation',
    description: 'Removes Unicode punctuation characters.',
    fields: [],
  },
  {
    id: 'digits',
    category: 'clean',
    name: 'Remove numbers',
    description: 'Removes Unicode numeric characters.',
    fields: [],
  },
  {
    id: 'upper',
    category: 'transform',
    name: 'Uppercase',
    description: 'Converts the text to uppercase.',
    fields: [],
  },
  {
    id: 'lower',
    category: 'transform',
    name: 'Lowercase',
    description: 'Converts the text to lowercase.',
    fields: [],
  },
  {
    id: 'title',
    category: 'transform',
    name: 'Title case',
    description: 'Capitalizes the first letter of each word.',
    fields: [],
  },
  {
    id: 'sentence',
    category: 'transform',
    name: 'Sentence case',
    description: 'Converts the text to sentence case.',
    fields: [],
  },
  {
    id: 'reverseText',
    category: 'transform',
    name: 'Reverse text',
    description: 'Reverses the Unicode characters of the text.',
    fields: [],
  },
  {
    id: 'affix',
    category: 'transform',
    name: 'Prefix and suffix',
    description: 'Adds a prefix and a suffix to each non-empty line.',
    fields: [
      {
        key: 'prefix',
        label: 'Prefix',
        type: 'text',
        defaultValue: '',
        placeholder: 'Text before each line',
      },
      {
        key: 'suffix',
        label: 'Suffix',
        type: 'text',
        defaultValue: '',
        placeholder: 'Text after each line',
      },
    ],
  },
  {
    id: 'number',
    category: 'transform',
    name: 'Number lines',
    description: 'Numbers the lines with a configurable start, step, padding and separator.',
    fields: [
      {
        key: 'start',
        label: 'Start',
        type: 'number',
        defaultValue: '1',
        placeholder: 'e.g. 1',
      },
      {
        key: 'step',
        label: 'Step',
        type: 'number',
        defaultValue: '1',
        placeholder: 'e.g. 1',
      },
      {
        key: 'padding',
        label: 'Leading zeros',
        type: 'number',
        defaultValue: '0',
        placeholder: 'e.g. 3',
      },
      {
        key: 'separator',
        label: 'Separator',
        type: 'text',
        defaultValue: '. ',
        placeholder: 'e.g. ". " or ") "',
      },
    ],
  },
  {
    id: 'sort',
    category: 'lines',
    name: 'Sort lines',
    description: 'Sorts lines alphabetically, numerically, by length or randomly.',
    fields: [
      {
        key: 'mode',
        label: 'Mode',
        type: 'select',
        defaultValue: 'az',
        options: [
          { value: 'az', label: 'A → Z' },
          { value: 'za', label: 'Z → A' },
          { value: 'numeric', label: 'Numeric' },
          { value: 'shortest', label: 'Shortest first' },
          { value: 'longest', label: 'Longest first' },
          { value: 'reverse', label: 'Reversed' },
          { value: 'shuffle', label: 'Random' },
        ],
      },
      {
        key: 'ignoreCase',
        label: 'Ignore case',
        type: 'checkbox',
        defaultValue: 'false',
      },
    ],
  },
  {
    id: 'filter',
    category: 'lines',
    name: 'Remove or keep lines',
    description: 'Removes or keeps lines that contain a term, start or end with it, or match it exactly. With regex, the expression defines the criterion.',
    fields: [
      {
        key: 'term',
        label: 'Text to find',
        type: 'text',
        defaultValue: '',
        placeholder: 'Type what to look for',
      },
      {
        key: 'mode',
        label: 'Action',
        type: 'select',
        defaultValue: 'remove',
        options: [
          { value: 'remove', label: 'Remove matching lines' },
          { value: 'keep', label: 'Keep only matching lines' },
        ],
      },
      {
        key: 'matchType',
        label: 'Match type (literal text)',
        type: 'select',
        defaultValue: 'contains',
        options: [
          { value: 'contains', label: 'Contains the text' },
          { value: 'starts', label: 'Starts with the text' },
          { value: 'ends', label: 'Ends with the text' },
          { value: 'exact', label: 'Line is exactly the text' },
        ],
      },
      {
        key: 'regex',
        label: 'Use regular expression',
        type: 'checkbox',
        defaultValue: 'false',
      },
      {
        key: 'ignoreCase',
        label: 'Ignore case',
        type: 'checkbox',
        defaultValue: 'false',
      },
    ],
  },
  {
    id: 'split',
    category: 'lines',
    name: 'Split by delimiter',
    description: 'Splits the text on a literal delimiter and turns the parts into lines.',
    fields: [
      {
        key: 'delimiter',
        label: 'Delimiter',
        type: 'text',
        defaultValue: ',',
        placeholder: 'Also accepts \\n and \\t',
      },
    ],
  },
  {
    id: 'join',
    category: 'lines',
    name: 'Join lines',
    description: 'Joins lines with a literal delimiter.',
    fields: [
      {
        key: 'delimiter',
        label: 'Delimiter',
        type: 'text',
        defaultValue: ', ',
        placeholder: 'Also accepts \\n and \\t',
      },
    ],
  },
  {
    id: 'column',
    category: 'lines',
    name: 'Extract column',
    description: 'Extracts a 1-based column from each line using a literal delimiter.',
    fields: [
      {
        key: 'delimiter',
        label: 'Delimiter',
        type: 'text',
        defaultValue: ',',
        placeholder: 'Also accepts \\n and \\t',
      },
      {
        key: 'index',
        label: 'Column index',
        type: 'number',
        defaultValue: '1',
        placeholder: 'Starts at 1',
      },
    ],
  },
  {
    id: 'compare',
    category: 'lists',
    name: 'Compare lists',
    description: 'Computes the intersection, difference or union, preserving order.',
    fields: [
      {
        key: 'other',
        label: 'Second text',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'One entry per line',
      },
      {
        key: 'mode',
        label: 'Operation',
        type: 'select',
        defaultValue: 'intersection',
        options: [
          { value: 'intersection', label: 'Intersection' },
          { value: 'difference', label: 'Difference (first text)' },
          { value: 'union', label: 'Union' },
        ],
      },
      {
        key: 'ignoreCase',
        label: 'Ignore case',
        type: 'checkbox',
        defaultValue: 'false',
      },
    ],
  },
  {
    id: 'merge',
    category: 'lists',
    name: 'Merge lists',
    description: 'Merges the first and second text line by line.',
    fields: [
      {
        key: 'other',
        label: 'Second text',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'One entry per line',
      },
      {
        key: 'separator',
        label: 'Separator',
        type: 'text',
        defaultValue: ' | ',
        placeholder: 'Also accepts \\n and \\t',
      },
    ],
  },
  {
    id: 'sample',
    category: 'lists',
    name: 'Random sample',
    description: 'Picks random lines without replacement.',
    fields: [
      {
        key: 'count',
        label: 'Count',
        type: 'number',
        defaultValue: '1',
        placeholder: 'Number of lines',
      },
    ],
  },
];

type Options = Record<string, string>;
type LineState = { lines: string[]; trailingNewline: boolean };
type Result = { text: string; detail: string };

const MAX_ITEMS = 100_000;
const MAX_PADDING = 1_000;
const WORD_PATTERN = /[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu;
const WORD_CHARACTER_PATTERN = /^[\p{L}\p{N}]$/u;

function error(message: string): never {
  throw new Error(message);
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string') error(`${label} must be a string.`);
  return value;
}

function getTool(id: string): Tool {
  const tool = tools.find((candidate) => candidate.id === id);
  if (!tool) error(`Unknown operation: ${String(id)}.`);
  return tool;
}

function prepareOptions(tool: Tool, supplied: unknown): Options {
  if (supplied === null || typeof supplied !== 'object' || Array.isArray(supplied)) {
    error('Options must be an object of strings.');
  }
  const source = supplied as Record<string, unknown>;
  const known = new Set(tool.fields.map((field) => field.key));
  for (const key of Object.keys(source)) {
    if (!known.has(key)) error(`Unknown option for ${tool.id}: ${key}.`);
    if (typeof source[key] !== 'string') error(`Option "${key}" must be a string.`);
  }
  const values: Options = {};
  for (const field of tool.fields) {
    values[field.key] = source[field.key] === undefined
      ? field.defaultValue
      : source[field.key] as string;
    if (field.type === 'checkbox') {
      if (values[field.key] !== 'true' && values[field.key] !== 'false') {
        error(`Option "${field.key}" must be true or false.`);
      }
    }
    if (field.type === 'select') {
      const allowed = field.options?.map((option) => option.value) ?? [];
      if (!allowed.includes(values[field.key])) {
        error(`Invalid value for option "${field.key}".`);
      }
    }
  }
  return values;
}

function booleanOption(options: Options, key: string): boolean {
  return options[key] === 'true';
}

function parseFiniteNumber(value: string, label: string): number {
  const normalized = value.trim().replace(',', '.');
  if (normalized.length === 0 || !/^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))$/.test(normalized)) {
    error(`${label} must be a valid number.`);
  }
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) error(`${label} must be a finite number.`);
  return parsed;
}

function parseInteger(value: string, label: string, maximum = MAX_ITEMS): number {
  const parsed = parseFiniteNumber(value, label);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > maximum) {
    error(`${label} must be an integer between 0 and ${maximum}.`);
  }
  return parsed;
}

function decodeEscapes(value: string): string {
  let decoded = '';
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character !== '\\' || index + 1 >= value.length) {
      decoded += character;
      continue;
    }
    const next = value[index + 1];
    if (next === 'n') decoded += '\n';
    else if (next === 't') decoded += '\t';
    else if (next === 'r') decoded += '\r';
    else if (next === '\\') decoded += '\\';
    else {
      decoded += character + next;
    }
    index += 1;
  }
  return decoded;
}

function delimiterOption(options: Options): string {
  const delimiter = decodeEscapes(options.delimiter);
  if (delimiter.length === 0) error('The delimiter cannot be empty.');
  return delimiter;
}

function splitLines(text: string): LineState {
  if (text.length === 0) return { lines: [], trailingNewline: false };
  const trailingNewline = /(?:\r\n|\n)$/.test(text);
  const body = trailingNewline ? text.replace(/(?:\r\n|\n)$/, '') : text;
  return { lines: body.split(/\r?\n/), trailingNewline };
}

function joinLines(lines: string[], trailingNewline: boolean): string {
  if (lines.length === 0) return '';
  return lines.join('\n') + (trailingNewline ? '\n' : '');
}

function checkItemLimit(count: number, label = 'The operation'): void {
  if (count > MAX_ITEMS) error(`${label} supports at most ${MAX_ITEMS.toLocaleString('en-US')} items.`);
}

function result(text: string, detail: string): Result {
  return { text, detail };
}

function localeLower(value: string): string {
  return value.toLocaleLowerCase();
}

function localeUpper(value: string): string {
  return value.toLocaleUpperCase();
}

function removeBlankLines(text: string): Result {
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'Cleanup');
  const lines = state.lines.filter((line) => line.trim().length > 0);
  const removed = state.lines.length - lines.length;
  return result(joinLines(lines, state.trailingNewline && lines.length > 0), `${removed} ${removed === 1 ? 'empty line removed' : 'empty lines removed'}.`);
}

function dedupeLines(text: string, ignoreCase: boolean): Result {
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'Cleanup');
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const line of state.lines) {
    const comparison = line.trim();
    const key = ignoreCase ? localeLower(comparison) : comparison;
    if (!seen.has(key)) {
      seen.add(key);
      lines.push(line);
    }
  }
  const removed = state.lines.length - lines.length;
  return result(joinLines(lines, state.trailingNewline && lines.length > 0), `${removed} ${removed === 1 ? 'duplicate line removed' : 'duplicate lines removed'}.`);
}

function dedupeWords(text: string, ignoreCase: boolean, separator: string, normalizeSeparator: boolean): Result {
  const matches = Array.from(text.matchAll(WORD_PATTERN));
  const seen = new Set<string>();
  const kept: RegExpMatchArray[] = [];
  const duplicateRanges: { start: number; end: number }[] = [];
  for (const match of matches) {
    const word = match[0];
    const key = ignoreCase ? localeLower(word) : word;
    if (seen.has(key)) {
      const start = match.index ?? 0;
      let end = start + word.length;
      while (end < text.length && /[ \t]/.test(text[end])) end += 1;
      duplicateRanges.push({ start, end });
    } else {
      seen.add(key);
      kept.push(match);
    }
  }
  if (duplicateRanges.length === 0) return result(text, 'No duplicate words found.');
  const decodedSeparator = decodeEscapes(separator);
  if (normalizeSeparator || decodedSeparator.length > 0) {
    return result(kept.map((match) => match[0]).join(decodedSeparator || ' '), `${duplicateRanges.length} ${duplicateRanges.length === 1 ? 'duplicate word removed' : 'duplicate words removed'}.`);
  }
  let output = text;
  for (let index = duplicateRanges.length - 1; index >= 0; index -= 1) {
    const range = duplicateRanges[index];
    output = output.slice(0, range.start) + output.slice(range.end);
  }
  output = output
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+$/g, '');
  return result(output, `${duplicateRanges.length} ${duplicateRanges.length === 1 ? 'duplicate word removed' : 'duplicate words removed'}.`);
}

function titleCase(text: string): string {
  const lower = localeLower(text);
  let capitalize = true;
  let output = '';
  for (const character of Array.from(lower)) {
    const isWordCharacter = WORD_CHARACTER_PATTERN.test(character);
    if (capitalize && isWordCharacter) {
      output += localeUpper(character);
      capitalize = false;
    } else {
      output += character;
      if (isWordCharacter) capitalize = false;
    }
    if (!isWordCharacter) capitalize = true;
  }
  return output;
}

function sentenceCase(text: string): string {
  const lower = localeLower(text);
  let capitalize = true;
  let output = '';
  for (const character of Array.from(lower)) {
    const isLetter = /^\p{L}$/u.test(character);
    if (capitalize && isLetter) {
      output += localeUpper(character);
      capitalize = false;
    } else {
      output += character;
      if (isLetter) capitalize = false;
    }
    if (/[.!?]/u.test(character)) capitalize = true;
  }
  return output;
}

function affixLines(text: string, prefix: string, suffix: string): Result {
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'Prefix and suffix');
  const lines = state.lines.map((line) => line.length > 0 ? prefix + line + suffix : line);
  return result(joinLines(lines, state.trailingNewline), `${lines.filter((line) => line.length > 0).length} ${lines.filter((line) => line.length > 0).length === 1 ? 'line updated' : 'lines updated'}.`);
}

function padNumber(value: number, padding: number): string {
  const raw = String(value);
  const sign = raw.startsWith('-') ? '-' : '';
  const body = sign ? raw.slice(1) : raw;
  const decimalIndex = body.search(/[.,]/);
  const integerPart = decimalIndex >= 0 ? body.slice(0, decimalIndex) : body;
  const decimalPart = decimalIndex >= 0 ? body.slice(decimalIndex) : '';
  return sign + (padding > 0 ? integerPart.padStart(padding, '0') : integerPart) + decimalPart;
}

function numberLines(text: string, options: Options): Result {
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'Numbering');
  const start = parseFiniteNumber(options.start, 'Start');
  const step = parseFiniteNumber(options.step, 'Step');
  const padding = parseInteger(options.padding, 'Leading zeros', MAX_PADDING);
  const separator = decodeEscapes(options.separator);
  const lines: string[] = [];
  for (let index = 0; index < state.lines.length; index += 1) {
    const number = start + step * index;
    if (!Number.isFinite(number)) error('Numbering produced a non-finite value.');
    lines.push(`${padNumber(number, padding)}${separator}${state.lines[index]}`);
  }
  return result(joinLines(lines, state.trailingNewline), `${lines.length} ${lines.length === 1 ? 'line numbered' : 'lines numbered'}.`);
}

function numericValue(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function sortLines(text: string, options: Options): Result {
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'Sorting');
  const mode = options.mode;
  const ignoreCase = booleanOption(options, 'ignoreCase');
  const empty = state.lines.filter((line) => line.trim().length === 0);
  const values = state.lines.filter((line) => line.trim().length > 0);
  if (mode === 'numeric') {
    const parsed = values.map((line) => numericValue(line));
    if (parsed.some((value) => value === null)) {
      error('All non-empty lines must be valid numbers for numeric sorting.');
    }
    values.sort((left, right) => (numericValue(left) as number) - (numericValue(right) as number));
  } else if (mode === 'az' || mode === 'za') {
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: ignoreCase ? 'base' : 'variant',
    });
    values.sort((left, right) => mode === 'az' ? collator.compare(left, right) : collator.compare(right, left));
  } else if (mode === 'shortest') {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: ignoreCase ? 'base' : 'variant' });
    values.sort((left, right) => Array.from(left).length - Array.from(right).length || collator.compare(left, right));
  } else if (mode === 'longest') {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: ignoreCase ? 'base' : 'variant' });
    values.sort((left, right) => Array.from(right).length - Array.from(left).length || collator.compare(left, right));
  } else if (mode === 'reverse') {
    values.reverse();
  } else if (mode === 'shuffle') {
    for (let index = values.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
    }
  } else {
    error('Invalid sort mode.');
  }
  const output = joinLines([...values, ...empty], state.trailingNewline && values.length + empty.length > 0);
  return result(output, `${values.length} ${values.length === 1 ? 'line sorted' : 'lines sorted'}${empty.length > 0 ? `; ${empty.length} ${empty.length === 1 ? 'empty line' : 'empty lines'} moved to the end` : ''}.`);
}

function filterLines(text: string, options: Options): Result {
  const term = options.term;
  if (term.length === 0) error('The filter term is required.');
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'The filter');
  const useRegex = booleanOption(options, 'regex');
  const ignoreCase = booleanOption(options, 'ignoreCase');
  let matches: (line: string) => boolean;
  if (useRegex) {
    let expression: RegExp;
    try {
      expression = new RegExp(term, ignoreCase ? 'iu' : 'u');
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'invalid syntax';
      error(`Invalid regular expression: ${message}.`);
    }
    matches = (line: string) => expression.test(line);
  } else {
    const needle = ignoreCase ? localeLower(term) : term;
    matches = (line: string) => {
      const value = ignoreCase ? localeLower(line) : line;
      switch (options.matchType) {
        case 'starts': return value.startsWith(needle);
        case 'ends': return value.endsWith(needle);
        case 'exact': return value === needle;
        default: return value.includes(needle);
      }
    };
  }
  const keepMode = options.mode === 'keep';
  const lines = state.lines.filter((line) => keepMode ? matches(line) : !matches(line));
  const removed = state.lines.length - lines.length;
  return result(joinLines(lines, state.trailingNewline && lines.length > 0), `${removed} ${removed === 1 ? 'line removed' : 'lines removed'} · ${lines.length} ${lines.length === 1 ? 'line kept' : 'lines kept'}.`);
}

function splitText(text: string, options: Options): Result {
  const delimiter = delimiterOption(options);
  if (text.length === 0) return result('', 'The text is empty.');
  const parts = text.split(delimiter);
  checkItemLimit(parts.length, 'Splitting');
  return result(parts.join('\n'), `${parts.length} ${parts.length === 1 ? 'part found' : 'parts found'}.`);
}

function joinText(text: string, options: Options): Result {
  const delimiter = delimiterOption(options);
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'Joining');
  if (state.lines.length === 0) return result('', 'The text is empty.');
  return result(state.lines.join(delimiter), `${state.lines.length} ${state.lines.length === 1 ? 'line joined' : 'lines joined'}.`);
}

function columnText(text: string, options: Options): Result {
  const delimiter = delimiterOption(options);
  const index = parseInteger(options.index, 'Column index');
  if (index < 1) error('Column index must be an integer between 1 and 100000.');
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'Column extraction');
  const lines = state.lines.map((line) => line.split(delimiter)[index - 1] ?? '');
  return result(joinLines(lines, state.trailingNewline), `${lines.length} ${lines.length === 1 ? 'line processed' : 'lines processed'}.`);
}

function compareLists(text: string, options: Options): Result {
  const left = splitLines(text);
  const right = splitLines(options.other);
  checkItemLimit(left.lines.length + right.lines.length, 'Comparison');
  const ignoreCase = booleanOption(options, 'ignoreCase');
  const keyOf = (value: string) => ignoreCase ? localeLower(value) : value;
  const rightSet = new Set(right.lines.map(keyOf));
  const output: string[] = [];
  const added = new Set<string>();
  if (options.mode === 'intersection') {
    for (const line of left.lines) {
      const key = keyOf(line);
      if (rightSet.has(key) && !added.has(key)) {
        added.add(key);
        output.push(line);
      }
    }
  } else if (options.mode === 'difference') {
    for (const line of left.lines) {
      const key = keyOf(line);
      if (!rightSet.has(key) && !added.has(key)) {
        added.add(key);
        output.push(line);
      }
    }
  } else if (options.mode === 'union') {
    for (const line of left.lines) {
      const key = keyOf(line);
      if (!added.has(key)) {
        added.add(key);
        output.push(line);
      }
    }
    for (const line of right.lines) {
      const key = keyOf(line);
      if (!added.has(key)) {
        added.add(key);
        output.push(line);
      }
    }
  } else {
    error('Invalid comparison mode.');
  }
  const trailing = output.length > 0 && (left.trailingNewline || (left.lines.length === 0 && right.trailingNewline));
  return result(joinLines(output, trailing), `${output.length} ${output.length === 1 ? 'line in result' : 'lines in result'}.`);
}

function mergeLists(text: string, options: Options): Result {
  const left = splitLines(text);
  const right = splitLines(options.other);
  checkItemLimit(Math.max(left.lines.length, right.lines.length), 'Merging');
  const separator = decodeEscapes(options.separator);
  const length = Math.max(left.lines.length, right.lines.length);
  const lines: string[] = [];
  for (let index = 0; index < length; index += 1) {
    lines.push(`${left.lines[index] ?? ''}${separator}${right.lines[index] ?? ''}`);
  }
  const trailing = lines.length > 0 && (left.trailingNewline || (left.lines.length === 0 && right.trailingNewline));
  return result(joinLines(lines, trailing), `${lines.length} ${lines.length === 1 ? 'line merged' : 'lines merged'}.`);
}

function sampleLines(text: string, options: Options): Result {
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'Sampling');
  const count = parseInteger(options.count, 'Count');
  if (count > state.lines.length) error(`The sample size cannot exceed ${state.lines.length}.`);
  const pool = state.lines.slice();
  const chosen: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    chosen.push(pool[randomIndex]);
    pool.splice(randomIndex, 1);
  }
  return result(joinLines(chosen, chosen.length > 0 && state.trailingNewline), `${chosen.length} ${chosen.length === 1 ? 'line selected' : 'lines selected'} without replacement.`);
}

export function runOperation(id: string, text: string, options: Record<string, string>): { text: string; detail: string } {
  const tool = getTool(id);
  requireString(text, 'The input text');
  const config = prepareOptions(tool, options);
  switch (id) {
    case 'empty':
      return removeBlankLines(text);
    case 'dedupe':
      return dedupeLines(text, booleanOption(config, 'ignoreCase'));
    case 'dedupeWords':
      return dedupeWords(text, booleanOption(config, 'ignoreCase'), config.separator, booleanOption(config, 'normalizeSeparator'));
    case 'trim':
      return result(joinLines(splitLines(text).lines.map((line) => line.trim()), splitLines(text).trailingNewline), 'Whitespace trimmed from lines.');
    case 'spaces':
      return result(text.replace(/[^\S\r\n]+/gu, ' '), 'Consecutive spaces collapsed.');
    case 'accents':
      return result(text.normalize('NFD').replace(/[\p{M}]/gu, ''), 'Accents removed.');
    case 'punctuation':
      return result(text.replace(/[\p{P}]/gu, ''), 'Punctuation removed.');
    case 'digits':
      return result(text.replace(/[\p{N}]/gu, ''), 'Numbers removed.');
    case 'upper':
      return result(localeUpper(text), 'Text converted to uppercase.');
    case 'lower':
      return result(localeLower(text), 'Text converted to lowercase.');
    case 'title':
      return result(titleCase(text), 'Text converted to title case.');
    case 'sentence':
      return result(sentenceCase(text), 'Text converted to sentence case.');
    case 'reverseText':
      return result(Array.from(text).reverse().join(''), 'Text reversed.');
    case 'affix':
      return affixLines(text, config.prefix, config.suffix);
    case 'number':
      return numberLines(text, config);
    case 'sort':
      return sortLines(text, config);
    case 'filter':
      return filterLines(text, config);
    case 'split':
      return splitText(text, config);
    case 'join':
      return joinText(text, config);
    case 'column':
      return columnText(text, config);
    case 'compare':
      return compareLists(text, config);
    case 'merge':
      return mergeLists(text, config);
    case 'sample':
      return sampleLines(text, config);
    default:
      return error(`Unknown operation: ${id}.`);
  }
}
