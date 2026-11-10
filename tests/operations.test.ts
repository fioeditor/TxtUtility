import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { runOperation, tools } from '../lib/operations';

const apply = (id: string, text: string, options: Record<string, string> = {}) => runOperation(id, text, options).text;

const requiredIds = [
  'empty',
  'dedupe',
  'dedupeWords',
  'trim',
  'spaces',
  'accents',
  'punctuation',
  'digits',
  'upper',
  'lower',
  'title',
  'sentence',
  'reverseText',
  'affix',
  'number',
  'sort',
  'filter',
  'split',
  'join',
  'column',
  'compare',
  'merge',
  'sample',
] as const;

test('exposes a typed, complete catalog without duplicate IDs', () => {
  assert.deepEqual(tools.map((tool) => tool.id), requiredIds);
  assert.equal(new Set(tools.map((tool) => tool.id)).size, requiredIds.length);
  for (const tool of tools) {
    assert.ok(tool.name.length > 0);
    assert.ok(tool.description.length > 0);
    for (const field of tool.fields) {
      assert.ok(field.key.length > 0);
      assert.ok(field.label.length > 0);
      assert.equal(typeof field.defaultValue, 'string');
      if (field.type === 'select') assert.ok((field.options?.length ?? 0) > 0);
      if (field.type === 'checkbox') assert.ok(['true', 'false'].includes(field.defaultValue));
    }
  }
});

test('cleanup handles empty lines, duplicates, words, spaces, accents, punctuation and digits', () => {
  assert.equal(apply('empty', '\n  \t\nA\n\n'), 'A\n');
  assert.equal(apply('empty', '\n  \t\n'), '');
  assert.equal(apply('dedupe', ' A \na\nB\nb\n', { ignoreCase: 'true' }), ' A \nB\n');
  assert.equal(apply('dedupe', 'A\na', { ignoreCase: 'false' }), 'A\na');
  assert.equal(apply('dedupeWords', 'Olá olá mundo mundo', { ignoreCase: 'true' }), 'Olá mundo');
  assert.equal(apply('dedupeWords', 'a a b b', { separator: '\\t' }), 'a\tb');
  assert.equal(apply('trim', '  ação  \n\t fim\t\n'), 'ação\nfim\n');
  assert.equal(apply('spaces', 'a   b\t\tc\n d'), 'a b c\n d');
  assert.equal(apply('accents', 'Árvore, coração, maçã'), 'Arvore, coracao, maca');
  assert.equal(apply('punctuation', 'Olá, mundo! “Tudo bem?”'), 'Olá mundo Tudo bem');
  assert.equal(apply('digits', 'A1 ٢ B3'), 'A  B');
});

test('transformations handle case, Unicode, affixes and configurable numbering', () => {
  assert.equal(apply('upper', 'ação içá'), 'AÇÃO IÇÁ');
  assert.equal(apply('lower', 'AÇÃO IÇÁ'), 'ação içá');
  assert.equal(apply('title', 'olá, mundo! ação-é'), 'Olá, Mundo! Ação-É');
  assert.equal(apply('sentence', 'OLÁ! tudo? É BOM.'), 'Olá! Tudo? É bom.');
  assert.equal(apply('reverseText', '😀á'), 'á😀');
  assert.equal(apply('affix', 'a\n\nb', { prefix: '[', suffix: ']' }), '[a]\n\n[b]');
  assert.equal(
    apply('number', 'a\nb\n', { start: '-2', step: '0.5', padding: '3', separator: '\\t' }),
    '-002\ta\n-001.5\tb\n',
  );
  assert.equal(apply('number', '', {}), '');
});

test('sorting covers every mode, case, negative/decimal numbers and empty lines at the end', () => {
  assert.equal(apply('sort', 'b\na', { mode: 'az' }), 'a\nb');
  assert.equal(apply('sort', 'a\nb', { mode: 'za' }), 'b\na');
  assert.equal(apply('sort', '-1.5\n10\n2\n\n', { mode: 'numeric' }), '-1.5\n2\n10\n\n');
  assert.equal(apply('sort', 'bbbb\na\ncc', { mode: 'shortest' }), 'a\ncc\nbbbb');
  assert.equal(apply('sort', 'a\nbbbb\ncc', { mode: 'longest' }), 'bbbb\ncc\na');
  assert.equal(apply('sort', 'a\n\nb\n', { mode: 'reverse' }), 'b\na\n\n');
  assert.equal(apply('sort', 'B\na', { mode: 'az', ignoreCase: 'true' }), 'a\nB');

  const originalRandom = Math.random;
  try {
    Math.random = () => 0;
    const shuffled = apply('sort', 'a\nb\nc', { mode: 'shuffle' }).split('\n');
    assert.deepEqual([...shuffled].sort(), ['a', 'b', 'c']);
  } finally {
    Math.random = originalRandom;
  }
});

test('filter accepts literal text and regex, rejecting invalid expressions', () => {
  assert.equal(apply('filter', 'Água\nÁGUA\nsol', { term: 'água', ignoreCase: 'true', mode: 'keep' }), 'Água\nÁGUA');
  assert.equal(apply('filter', 'um1\num2\ndois', { term: '^um\\d$', regex: 'true', mode: 'remove' }), 'dois');
  assert.throws(
    () => apply('filter', 'a\nb', { term: '[', regex: 'true', mode: 'keep' }),
    /Invalid regular expression/,
  );
  assert.throws(() => apply('filter', 'a', { mode: 'keep' }), /filter term is required/);
});

test('split, join and column use literal delimiters with escapes', () => {
  assert.equal(apply('split', 'a.b.c', { delimiter: '.' }), 'a\nb\nc');
  assert.equal(apply('split', 'a\tb', { delimiter: '\\t' }), 'a\nb');
  assert.equal(apply('join', 'a\nb\nc', { delimiter: '\\t' }), 'a\tb\tc');
  assert.equal(apply('column', 'a,b\nc,d', { delimiter: ',', index: '2' }), 'b\nd');
  assert.equal(apply('column', 'a\tb\nc\td', { delimiter: '\\t', index: '1' }), 'a\nc');
  assert.equal(apply('split', '', { delimiter: ',' }), '');
});

test('compare, merge and sample preserve order and honor options', () => {
  assert.equal(
    apply('compare', 'A\nb\nc', { other: 'a\nC', mode: 'intersection', ignoreCase: 'true' }),
    'A\nc',
  );
  assert.equal(apply('compare', 'a\nb\na', { other: 'b', mode: 'difference' }), 'a');
  assert.equal(apply('compare', 'a\nb', { other: 'b\nc', mode: 'union' }), 'a\nb\nc');
  assert.equal(apply('merge', 'a\nb', { other: '1\n2\n3', separator: ' => ' }), 'a => 1\nb => 2\n => 3');

  const originalRandom = Math.random;
  try {
    Math.random = () => 0;
    assert.equal(apply('sample', 'a\nb\nc', { count: '2' }), 'a\nb');
  } finally {
    Math.random = originalRandom;
  }
});

test('validates inputs, delimiters, numbers, modes, limits and options', () => {
  assert.throws(() => runOperation('does-not-exist', 'text', {}), /Unknown operation/);
  assert.throws(() => runOperation('upper', 42 as unknown as string, {}), /input text/);
  assert.throws(() => runOperation('upper', 'text', null as unknown as Record<string, string>), /Options must be an object/);
  assert.throws(() => runOperation('dedupe', 'a', { ignoreCase: 'yes' }), /must be true or false/);
  assert.throws(() => runOperation('upper', 'a', { unknown: 'x' }), /Unknown option/);
  assert.throws(() => apply('split', 'a,b', { delimiter: '' }), /delimiter cannot be empty/);
  assert.throws(() => apply('join', 'a\nb', { delimiter: '' }), /delimiter cannot be empty/);
  assert.throws(() => apply('column', 'a,b', { delimiter: ',', index: '0' }), /Column index/);
  assert.throws(() => apply('number', 'a', { start: 'infinity' }), /Start must be a valid number/);
  assert.throws(() => apply('number', 'a', { padding: '1001' }), /Leading zeros/);
  assert.throws(() => apply('sort', '2\nnot a number', { mode: 'numeric' }), /All non-empty lines/);
  assert.throws(() => apply('sort', 'a', { mode: 'missing' }), /Invalid value/);
  assert.throws(() => apply('sample', 'a\nb', { count: '3' }), /cannot exceed/);
  assert.throws(() => apply('sample', 'a', { count: '-1' }), /Count/);
});
