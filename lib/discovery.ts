import { tools, type Tool } from './operations';

export type OperationResult = { tool: Tool; label: string; mode?: 'remove' | 'keep' };
const aliases: Record<string, string[]> = {
  empty: ['remove linhas vazias', 'apagar linhas vazias', 'apagar linhas em branco', 'linhas em branco', 'tirar linhas em branco', 'blank lines', 'delete empty lines'],
  dedupe: ['remove linhas repetidas', 'remover linhas duplicadas', 'tirar duplicadas', 'linhas unicas', 'unique lines'],
  dedupeWords: ['remover palavras repetidas', 'palavras duplicadas'],
  trim: ['aparar espaços', 'tirar espaços das bordas', 'trimming'],
  spaces: ['remover espaços extras', 'reduzir espaços', 'double spaces'],
  accents: ['tirar acentos', 'remover acentos', 'desacentuar'],
  punctuation: ['tirar pontuação', 'remover sinais'],
  digits: ['remover números', 'tirar dígitos'],
  upper: ['converter maiúsculas', 'caixa alta'],
  lower: ['converter minúsculas', 'caixa baixa'],
  title: ['capitalizar palavras', 'iniciais maiúsculas'],
  sentence: ['caixa de frase', 'sentence case'],
  reverseText: ['texto ao contrário', 'inverter caracteres'],
  affix: ['adicionar prefixo', 'adicionar sufixo'],
  number: ['numerar linhas', 'colocar números nas linhas'],
  sort: ['organizar lista', 'ordenar lista', 'sort lines'],
  filter: ['filtrar conteúdo das linhas', 'buscar linhas', 'remove lines containing', 'remover linhas que contêm', 'remove lines that contain', 'remover linhas contendo', 'remover linhas que começam com', 'remover linhas que terminam com'],
  split: ['separar texto', 'dividir colunas'],
  join: ['juntar linhas', 'mesclar linhas em uma'],
  column: ['extrair coluna', 'escolher coluna csv'],
  compare: ['comparar listas', 'interseção de listas', 'diferença entre listas'],
  merge: ['combinar listas', 'mesclar duas listas'],
  sample: ['escolher linhas aleatórias', 'sortear itens', 'random picker'],
};
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
const stopWords = new Set(['as','a','o','os','de','da','do','das','dos','que','com','por','para','meu','minha','linhas','linha','texto','em','no','na','nos','nas']);

export function searchTools(query: string, limit = 6): OperationResult[] {
  const normalized = normalize(query);
  if (!normalized) return [];
  const tokens = normalized.split(' ').filter(token => token.length > 1 && !stopWords.has(token));
  const results: { result: OperationResult; score: number; order: number }[] = [];
  tools.forEach((tool, order) => {
    const title = tool.id === 'filter' ? 'Remover linhas que contêm' : tool.name;
    const base: OperationResult = { tool, label: title, ...(tool.id === 'filter' ? { mode: 'remove' as const } : {}) };
    const phrases = [tool.name, tool.description, ...tool.fields.map(field => field.label), ...(aliases[tool.id] ?? [])].map(normalize);
    const phraseMatch = phrases.some(phrase => phrase === normalized);
    const prefixMatch = phrases.some(phrase => phrase.startsWith(normalized) || normalized.startsWith(phrase));
    const coverage = tokens.length ? tokens.filter(token => phrases.some(phrase => phrase.includes(token))).length / tokens.length : 0;
    const direct = normalize(tool.name).includes(normalized) || phrases.some(phrase => phrase.includes(normalized));
    const score = phraseMatch ? 100 : prefixMatch ? 80 : direct ? 65 : coverage * 50;
    if (score > 0 && (direct || coverage >= 0.5)) results.push({ result: base, score, order });
  });
  const wantsKeep = /\b(manter|preservar|keep|incluir)\b/.test(normalized);
  if (wantsKeep && results[0]?.result.tool.id === 'filter') results[0].result = { ...results[0].result, mode: 'keep', label: 'Manter linhas que contêm' };
  return results.sort((a, b) => b.score - a.score || a.order - b.order).slice(0, limit).map(item => item.result);
}
