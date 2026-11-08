import test from 'node:test';
import assert from 'node:assert/strict';
import { clampRange, replaceRange, findMatches, replaceLiteralMatches, lineWindow } from '../lib/editor';

test('busca literal escapa caracteres regex e respeita caixa', () => {
  assert.equal(findMatches('a.b aXb A.B', 'a.b', false, false).matches.length, 2);
  assert.equal(findMatches('a.b A.B', 'a.b', false, true).matches.length, 1);
});
test('regex encontra e invalida padrões com resultados vazios ou sintaxe inválida', () => {
  assert.equal(findMatches('AB12 CD34', '[A-Z]+\\d+', true, true).matches.length, 2);
  assert.ok(findMatches('abc', '[', true, false).error);
  assert.ok(findMatches('abc', '.*?', true, false).error);
  assert.deepEqual(findMatches('abc', '', false, false).matches, []);
});
test('substituição é sempre literal, inclusive dólar e remoção', () => {
  const text = 'ab ab';
  const matches = findMatches(text, '(ab)', true, false).matches;
  assert.equal(replaceLiteralMatches(text, matches, '$1-$1'), '$1-$1 $1-$1');
  assert.equal(replaceLiteralMatches(text, [matches[1]], ''), 'ab ');
});
test('seleção não extrapola documento e aplica só ao intervalo', () => {
  assert.deepEqual(clampRange({start:10,end:20},3), {start:3,end:3});
  assert.deepEqual(clampRange({start:-1,end:2},3), {start:0,end:2});
  assert.equal(replaceRange('antes meio depois', {start:6,end:10}, 'MEIO'), 'antes MEIO depois');
});
test('régua virtual numera documentos longos sem renderizar toda a lista', () => {
  const window = lineWindow(20_000, 10_000 * 24);
  assert.equal(window.first, 9_995);
  assert.equal(window.count, 300);
  assert.equal(window.offset, -120);
  assert.equal(lineWindow(1,0).count,1);
  assert.equal(lineWindow(0,0).count,1);
});
