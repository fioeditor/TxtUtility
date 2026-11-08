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
    name: 'Linhas vazias',
    description: 'Remove linhas vazias ou formadas apenas por espaços.',
    fields: [],
  },
  {
    id: 'dedupe',
    category: 'clean',
    name: 'Linhas repetidas',
    description: 'Remove linhas repetidas, mantendo a primeira ocorrência original.',
    fields: [
      {
        key: 'ignoreCase',
        label: 'Ignorar maiúsculas/minúsculas',
        type: 'checkbox',
        defaultValue: 'false',
      },
    ],
  },
  {
    id: 'dedupeWords',
    category: 'clean',
    name: 'Palavras repetidas',
    description: 'Remove palavras repetidas preservando a ordem da primeira ocorrência.',
    fields: [
      {
        key: 'ignoreCase',
        label: 'Ignorar maiúsculas/minúsculas',
        type: 'checkbox',
        defaultValue: 'false',
      },
      {
        key: 'separator',
        label: 'Separador normalizado',
        type: 'text',
        defaultValue: '',
        placeholder: 'Opcional; deixe vazio para preservar os separadores',
      },
      {
        key: 'normalizeSeparator',
        label: 'Normalizar separador',
        type: 'checkbox',
        defaultValue: 'false',
      },
    ],
  },
  {
    id: 'trim',
    category: 'clean',
    name: 'Aparar linhas',
    description: 'Remove espaços no início e no fim de cada linha.',
    fields: [],
  },
  {
    id: 'spaces',
    category: 'clean',
    name: 'Espaços extras',
    description: 'Converte sequências de espaços e tabulações em um único espaço.',
    fields: [],
  },
  {
    id: 'accents',
    category: 'clean',
    name: 'Remover acentos',
    description: 'Remove marcas de acentuação sem alterar a ordem do texto.',
    fields: [],
  },
  {
    id: 'punctuation',
    category: 'clean',
    name: 'Remover pontuação',
    description: 'Remove caracteres de pontuação Unicode.',
    fields: [],
  },
  {
    id: 'digits',
    category: 'clean',
    name: 'Remover números',
    description: 'Remove caracteres numéricos Unicode.',
    fields: [],
  },
  {
    id: 'upper',
    category: 'transform',
    name: 'Maiúsculas',
    description: 'Converte o texto para maiúsculas usando a localidade pt-BR.',
    fields: [],
  },
  {
    id: 'lower',
    category: 'transform',
    name: 'Minúsculas',
    description: 'Converte o texto para minúsculas usando a localidade pt-BR.',
    fields: [],
  },
  {
    id: 'title',
    category: 'transform',
    name: 'Título',
    description: 'Coloca a inicial de cada palavra em maiúscula.',
    fields: [],
  },
  {
    id: 'sentence',
    category: 'transform',
    name: 'Frases',
    description: 'Converte o texto para caixa de frase.',
    fields: [],
  },
  {
    id: 'reverseText',
    category: 'transform',
    name: 'Inverter texto',
    description: 'Inverte caracteres Unicode do texto.',
    fields: [],
  },
  {
    id: 'affix',
    category: 'transform',
    name: 'Prefixo e sufixo',
    description: 'Adiciona prefixo e sufixo a cada linha não vazia.',
    fields: [
      {
        key: 'prefix',
        label: 'Prefixo',
        type: 'text',
        defaultValue: '',
        placeholder: 'Texto antes de cada linha',
      },
      {
        key: 'suffix',
        label: 'Sufixo',
        type: 'text',
        defaultValue: '',
        placeholder: 'Texto depois de cada linha',
      },
    ],
  },
  {
    id: 'number',
    category: 'transform',
    name: 'Numerar linhas',
    description: 'Numera as linhas com início, passo, preenchimento e separador configuráveis.',
    fields: [
      {
        key: 'start',
        label: 'Início',
        type: 'number',
        defaultValue: '1',
        placeholder: 'Ex.: 1',
      },
      {
        key: 'step',
        label: 'Passo',
        type: 'number',
        defaultValue: '1',
        placeholder: 'Ex.: 1',
      },
      {
        key: 'padding',
        label: 'Zeros à esquerda',
        type: 'number',
        defaultValue: '0',
        placeholder: 'Ex.: 3',
      },
      {
        key: 'separator',
        label: 'Separador',
        type: 'text',
        defaultValue: '. ',
        placeholder: 'Ex.: ". " ou ") "',
      },
    ],
  },
  {
    id: 'sort',
    category: 'lines',
    name: 'Ordenar linhas',
    description: 'Ordena linhas em ordem alfabética, numérica, por tamanho ou aleatoriamente.',
    fields: [
      {
        key: 'mode',
        label: 'Modo',
        type: 'select',
        defaultValue: 'az',
        options: [
          { value: 'az', label: 'A → Z' },
          { value: 'za', label: 'Z → A' },
          { value: 'numeric', label: 'Numérica' },
          { value: 'shortest', label: 'Menores primeiro' },
          { value: 'longest', label: 'Maiores primeiro' },
          { value: 'reverse', label: 'Inversa' },
          { value: 'shuffle', label: 'Aleatória' },
        ],
      },
      {
        key: 'ignoreCase',
        label: 'Ignorar maiúsculas/minúsculas',
        type: 'checkbox',
        defaultValue: 'false',
      },
    ],
  },
  {
    id: 'filter',
    category: 'lines',
    name: 'Remover ou manter linhas',
    description: 'Remove ou mantém linhas que contêm um termo, começam ou terminam com ele, ou são iguais. Em regex, a expressão define o critério.',
    fields: [
      {
        key: 'term',
        label: 'Texto a procurar',
        type: 'text',
        defaultValue: '',
        placeholder: 'Digite o que procurar',
      },
      {
        key: 'mode',
        label: 'Ação',
        type: 'select',
        defaultValue: 'remove',
        options: [
          { value: 'remove', label: 'Remover linhas correspondentes' },
          { value: 'keep', label: 'Manter apenas correspondentes' },
        ],
      },
      {
        key: 'matchType',
        label: 'Critério para texto literal',
        type: 'select',
        defaultValue: 'contains',
        options: [
          { value: 'contains', label: 'Contém o texto' },
          { value: 'starts', label: 'Começa com o texto' },
          { value: 'ends', label: 'Termina com o texto' },
          { value: 'exact', label: 'Linha exatamente igual' },
        ],
      },
      {
        key: 'regex',
        label: 'Usar expressão regular',
        type: 'checkbox',
        defaultValue: 'false',
      },
      {
        key: 'ignoreCase',
        label: 'Ignorar maiúsculas/minúsculas',
        type: 'checkbox',
        defaultValue: 'false',
      },
    ],
  },
  {
    id: 'split',
    category: 'lines',
    name: 'Dividir por delimitador',
    description: 'Divide o texto por um delimitador literal e transforma as partes em linhas.',
    fields: [
      {
        key: 'delimiter',
        label: 'Delimitador',
        type: 'text',
        defaultValue: ',',
        placeholder: 'Também aceita \\n e \\t',
      },
    ],
  },
  {
    id: 'join',
    category: 'lines',
    name: 'Juntar linhas',
    description: 'Junta linhas usando um delimitador literal.',
    fields: [
      {
        key: 'delimiter',
        label: 'Delimitador',
        type: 'text',
        defaultValue: ', ',
        placeholder: 'Também aceita \\n e \\t',
      },
    ],
  },
  {
    id: 'column',
    category: 'lines',
    name: 'Extrair coluna',
    description: 'Extrai uma coluna 1-based de cada linha usando um delimitador literal.',
    fields: [
      {
        key: 'delimiter',
        label: 'Delimitador',
        type: 'text',
        defaultValue: ',',
        placeholder: 'Também aceita \\n e \\t',
      },
      {
        key: 'index',
        label: 'Índice da coluna',
        type: 'number',
        defaultValue: '1',
        placeholder: 'Começa em 1',
      },
    ],
  },
  {
    id: 'compare',
    category: 'lists',
    name: 'Comparar listas',
    description: 'Calcula interseção, diferença ou união preservando a ordem.',
    fields: [
      {
        key: 'other',
        label: 'Segundo texto',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'Uma entrada por linha',
      },
      {
        key: 'mode',
        label: 'Operação',
        type: 'select',
        defaultValue: 'intersection',
        options: [
          { value: 'intersection', label: 'Interseção' },
          { value: 'difference', label: 'Diferença (primeiro texto)' },
          { value: 'union', label: 'União' },
        ],
      },
      {
        key: 'ignoreCase',
        label: 'Ignorar maiúsculas/minúsculas',
        type: 'checkbox',
        defaultValue: 'false',
      },
    ],
  },
  {
    id: 'merge',
    category: 'lists',
    name: 'Mesclar listas',
    description: 'Mescla o primeiro e o segundo texto linha a linha.',
    fields: [
      {
        key: 'other',
        label: 'Segundo texto',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'Uma entrada por linha',
      },
      {
        key: 'separator',
        label: 'Separador',
        type: 'text',
        defaultValue: ' | ',
        placeholder: 'Também aceita \\n e \\t',
      },
    ],
  },
  {
    id: 'sample',
    category: 'lists',
    name: 'Amostra aleatória',
    description: 'Seleciona linhas aleatórias sem reposição.',
    fields: [
      {
        key: 'count',
        label: 'Quantidade',
        type: 'number',
        defaultValue: '1',
        placeholder: 'Número de linhas',
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
  if (typeof value !== 'string') error(`${label} deve ser um texto.`);
  return value;
}

function getTool(id: string): Tool {
  const tool = tools.find((candidate) => candidate.id === id);
  if (!tool) error(`Operação desconhecida: ${String(id)}.`);
  return tool;
}

function prepareOptions(tool: Tool, supplied: unknown): Options {
  if (supplied === null || typeof supplied !== 'object' || Array.isArray(supplied)) {
    error('As opções devem ser um objeto de textos.');
  }
  const source = supplied as Record<string, unknown>;
  const known = new Set(tool.fields.map((field) => field.key));
  for (const key of Object.keys(source)) {
    if (!known.has(key)) error(`Opção desconhecida para ${tool.id}: ${key}.`);
    if (typeof source[key] !== 'string') error(`A opção "${key}" deve ser um texto.`);
  }
  const values: Options = {};
  for (const field of tool.fields) {
    values[field.key] = source[field.key] === undefined
      ? field.defaultValue
      : source[field.key] as string;
    if (field.type === 'checkbox') {
      if (values[field.key] !== 'true' && values[field.key] !== 'false') {
        error(`A opção "${field.key}" deve ser true ou false.`);
      }
    }
    if (field.type === 'select') {
      const allowed = field.options?.map((option) => option.value) ?? [];
      if (!allowed.includes(values[field.key])) {
        error(`Valor inválido para a opção "${field.key}".`);
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
    error(`${label} deve ser um número válido.`);
  }
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) error(`${label} deve ser um número finito.`);
  return parsed;
}

function parseInteger(value: string, label: string, maximum = MAX_ITEMS): number {
  const parsed = parseFiniteNumber(value, label);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > maximum) {
    error(`${label} deve ser um inteiro entre 0 e ${maximum}.`);
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
  if (delimiter.length === 0) error('O delimitador não pode ser vazio.');
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

function checkItemLimit(count: number, label = 'A operação'): void {
  if (count > MAX_ITEMS) error(`${label} aceita no máximo ${MAX_ITEMS.toLocaleString('pt-BR')} itens.`);
}

function result(text: string, detail: string): Result {
  return { text, detail };
}

function localeLower(value: string): string {
  return value.toLocaleLowerCase('pt-BR');
}

function localeUpper(value: string): string {
  return value.toLocaleUpperCase('pt-BR');
}

function removeBlankLines(text: string): Result {
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'A limpeza');
  const lines = state.lines.filter((line) => line.trim().length > 0);
  const removed = state.lines.length - lines.length;
  return result(joinLines(lines, state.trailingNewline && lines.length > 0), `${removed} ${removed === 1 ? 'linha vazia removida' : 'linhas vazias removidas'}.`);
}

function dedupeLines(text: string, ignoreCase: boolean): Result {
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'A limpeza');
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
  return result(joinLines(lines, state.trailingNewline && lines.length > 0), `${removed} ${removed === 1 ? 'linha repetida removida' : 'linhas repetidas removidas'}.`);
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
  if (duplicateRanges.length === 0) return result(text, 'Nenhuma palavra repetida encontrada.');
  const decodedSeparator = decodeEscapes(separator);
  if (normalizeSeparator || decodedSeparator.length > 0) {
    return result(kept.map((match) => match[0]).join(decodedSeparator || ' '), `${duplicateRanges.length} ${duplicateRanges.length === 1 ? 'palavra repetida removida' : 'palavras repetidas removidas'}.`);
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
  return result(output, `${duplicateRanges.length} ${duplicateRanges.length === 1 ? 'palavra repetida removida' : 'palavras repetidas removidas'}.`);
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
  checkItemLimit(state.lines.length, 'A aplicação de prefixo e sufixo');
  const lines = state.lines.map((line) => line.length > 0 ? prefix + line + suffix : line);
  return result(joinLines(lines, state.trailingNewline), `${lines.filter((line) => line.length > 0).length} ${lines.filter((line) => line.length > 0).length === 1 ? 'linha ajustada' : 'linhas ajustadas'}.`);
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
  checkItemLimit(state.lines.length, 'A numeração');
  const start = parseFiniteNumber(options.start, 'Início');
  const step = parseFiniteNumber(options.step, 'Passo');
  const padding = parseInteger(options.padding, 'Zeros à esquerda', MAX_PADDING);
  const separator = decodeEscapes(options.separator);
  const lines: string[] = [];
  for (let index = 0; index < state.lines.length; index += 1) {
    const number = start + step * index;
    if (!Number.isFinite(number)) error('A numeração gerou um valor não finito.');
    lines.push(`${padNumber(number, padding)}${separator}${state.lines[index]}`);
  }
  return result(joinLines(lines, state.trailingNewline), `${lines.length} ${lines.length === 1 ? 'linha numerada' : 'linhas numeradas'}.`);
}

function numericValue(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function sortLines(text: string, options: Options): Result {
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'A ordenação');
  const mode = options.mode;
  const ignoreCase = booleanOption(options, 'ignoreCase');
  const empty = state.lines.filter((line) => line.trim().length === 0);
  const values = state.lines.filter((line) => line.trim().length > 0);
  if (mode === 'numeric') {
    const parsed = values.map((line) => numericValue(line));
    if (parsed.some((value) => value === null)) {
      error('Todas as linhas não vazias devem conter números válidos para a ordenação numérica.');
    }
    values.sort((left, right) => (numericValue(left) as number) - (numericValue(right) as number));
  } else if (mode === 'az' || mode === 'za') {
    const collator = new Intl.Collator('pt-BR', {
      numeric: true,
      sensitivity: ignoreCase ? 'base' : 'variant',
    });
    values.sort((left, right) => mode === 'az' ? collator.compare(left, right) : collator.compare(right, left));
  } else if (mode === 'shortest') {
    const collator = new Intl.Collator('pt-BR', { numeric: true, sensitivity: ignoreCase ? 'base' : 'variant' });
    values.sort((left, right) => Array.from(left).length - Array.from(right).length || collator.compare(left, right));
  } else if (mode === 'longest') {
    const collator = new Intl.Collator('pt-BR', { numeric: true, sensitivity: ignoreCase ? 'base' : 'variant' });
    values.sort((left, right) => Array.from(right).length - Array.from(left).length || collator.compare(left, right));
  } else if (mode === 'reverse') {
    values.reverse();
  } else if (mode === 'shuffle') {
    for (let index = values.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
    }
  } else {
    error('Modo de ordenação inválido.');
  }
  const output = joinLines([...values, ...empty], state.trailingNewline && values.length + empty.length > 0);
  return result(output, `${values.length} ${values.length === 1 ? 'linha organizada' : 'linhas organizadas'}${empty.length > 0 ? `; ${empty.length} ${empty.length === 1 ? 'linha vazia' : 'linhas vazias'} ao final` : ''}.`);
}

function filterLines(text: string, options: Options): Result {
  const term = options.term;
  if (term.length === 0) error('O termo do filtro é obrigatório.');
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'O filtro');
  const useRegex = booleanOption(options, 'regex');
  const ignoreCase = booleanOption(options, 'ignoreCase');
  let matches: (line: string) => boolean;
  if (useRegex) {
    let expression: RegExp;
    try {
      expression = new RegExp(term, ignoreCase ? 'iu' : 'u');
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'sintaxe inválida';
      error(`Expressão regular inválida: ${message}.`);
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
  return result(joinLines(lines, state.trailingNewline && lines.length > 0), `${removed} ${removed === 1 ? 'linha removida' : 'linhas removidas'} · ${lines.length} ${lines.length === 1 ? 'linha mantida' : 'linhas mantidas'}.`);
}

function splitText(text: string, options: Options): Result {
  const delimiter = delimiterOption(options);
  if (text.length === 0) return result('', 'O texto está vazio.');
  const parts = text.split(delimiter);
  checkItemLimit(parts.length, 'A divisão');
  return result(parts.join('\n'), `${parts.length} ${parts.length === 1 ? 'parte encontrada' : 'partes encontradas'}.`);
}

function joinText(text: string, options: Options): Result {
  const delimiter = delimiterOption(options);
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'A junção');
  if (state.lines.length === 0) return result('', 'O texto está vazio.');
  return result(state.lines.join(delimiter), `${state.lines.length} ${state.lines.length === 1 ? 'linha juntada' : 'linhas juntadas'}.`);
}

function columnText(text: string, options: Options): Result {
  const delimiter = delimiterOption(options);
  const index = parseInteger(options.index, 'Índice da coluna');
  if (index < 1) error('Índice da coluna deve ser um inteiro entre 1 e 100000.');
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'A extração de coluna');
  const lines = state.lines.map((line) => line.split(delimiter)[index - 1] ?? '');
  return result(joinLines(lines, state.trailingNewline), `${lines.length} ${lines.length === 1 ? 'linha processada' : 'linhas processadas'}.`);
}

function compareLists(text: string, options: Options): Result {
  const left = splitLines(text);
  const right = splitLines(options.other);
  checkItemLimit(left.lines.length + right.lines.length, 'A comparação');
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
    error('Modo de comparação inválido.');
  }
  const trailing = output.length > 0 && (left.trailingNewline || (left.lines.length === 0 && right.trailingNewline));
  return result(joinLines(output, trailing), `${output.length} ${output.length === 1 ? 'linha no resultado' : 'linhas no resultado'}.`);
}

function mergeLists(text: string, options: Options): Result {
  const left = splitLines(text);
  const right = splitLines(options.other);
  checkItemLimit(Math.max(left.lines.length, right.lines.length), 'A mesclagem');
  const separator = decodeEscapes(options.separator);
  const length = Math.max(left.lines.length, right.lines.length);
  const lines: string[] = [];
  for (let index = 0; index < length; index += 1) {
    lines.push(`${left.lines[index] ?? ''}${separator}${right.lines[index] ?? ''}`);
  }
  const trailing = lines.length > 0 && (left.trailingNewline || (left.lines.length === 0 && right.trailingNewline));
  return result(joinLines(lines, trailing), `${lines.length} ${lines.length === 1 ? 'linha mesclada' : 'linhas mescladas'}.`);
}

function sampleLines(text: string, options: Options): Result {
  const state = splitLines(text);
  checkItemLimit(state.lines.length, 'A amostra');
  const count = parseInteger(options.count, 'Quantidade');
  if (count > state.lines.length) error(`A quantidade da amostra não pode exceder ${state.lines.length}.`);
  const pool = state.lines.slice();
  const chosen: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    chosen.push(pool[randomIndex]);
    pool.splice(randomIndex, 1);
  }
  return result(joinLines(chosen, chosen.length > 0 && state.trailingNewline), `${chosen.length} ${chosen.length === 1 ? 'linha selecionada' : 'linhas selecionadas'} sem reposição.`);
}

export function runOperation(id: string, text: string, options: Record<string, string>): { text: string; detail: string } {
  const tool = getTool(id);
  requireString(text, 'O texto de entrada');
  const config = prepareOptions(tool, options);
  switch (id) {
    case 'empty':
      return removeBlankLines(text);
    case 'dedupe':
      return dedupeLines(text, booleanOption(config, 'ignoreCase'));
    case 'dedupeWords':
      return dedupeWords(text, booleanOption(config, 'ignoreCase'), config.separator, booleanOption(config, 'normalizeSeparator'));
    case 'trim':
      return result(joinLines(splitLines(text).lines.map((line) => line.trim()), splitLines(text).trailingNewline), 'Espaços das linhas aparados.');
    case 'spaces':
      return result(text.replace(/[^\S\r\n]+/gu, ' '), 'Espaços consecutivos normalizados.');
    case 'accents':
      return result(text.normalize('NFD').replace(/[\p{M}]/gu, ''), 'Acentos removidos.');
    case 'punctuation':
      return result(text.replace(/[\p{P}]/gu, ''), 'Pontuação removida.');
    case 'digits':
      return result(text.replace(/[\p{N}]/gu, ''), 'Números removidos.');
    case 'upper':
      return result(localeUpper(text), 'Texto convertido para maiúsculas.');
    case 'lower':
      return result(localeLower(text), 'Texto convertido para minúsculas.');
    case 'title':
      return result(titleCase(text), 'Texto convertido para caixa de título.');
    case 'sentence':
      return result(sentenceCase(text), 'Texto convertido para caixa de frase.');
    case 'reverseText':
      return result(Array.from(text).reverse().join(''), 'Texto invertido.');
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
      return error(`Operação desconhecida: ${id}.`);
  }
}
