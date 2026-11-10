import test from 'node:test';
import assert from 'node:assert/strict';
import { clampRange, replaceRange, findMatches, replaceLiteralMatches, lineWindow } from '../lib/editor';

test('literal search escapes regex characters and respects case', () => {
  assert.equal(findMatches('a.b aXb A.B', 'a.b', false, false).matches.length, 2);
  assert.equal(findMatches('a.b A.B', 'a.b', false, true).matches.length, 1);
});
test('regex search finds matches and flags empty-match or invalid patterns', () => {
  assert.equal(findMatches('AB12 CD34', '[A-Z]+\\d+', true, true).matches.length, 2);
  assert.ok(findMatches('abc', '[', true, false).error);
  assert.ok(findMatches('abc', '.*?', true, false).error);
  assert.deepEqual(findMatches('abc', '', false, false).matches, []);
});
test('replacement is always literal, including dollar signs and removal', () => {
  const text = 'ab ab';
  const matches = findMatches(text, '(ab)', true, false).matches;
  assert.equal(replaceLiteralMatches(text, matches, '$1-$1'), '$1-$1 $1-$1');
  assert.equal(replaceLiteralMatches(text, [matches[1]], ''), 'ab ');
});
test('selection stays within the document and applies only to its range', () => {
  assert.deepEqual(clampRange({start:10,end:20},3), {start:3,end:3});
  assert.deepEqual(clampRange({start:-1,end:2},3), {start:0,end:2});
  assert.equal(replaceRange('one two three', {start:4,end:7}, 'TWO'), 'one TWO three');
});
test('virtual line gutter numbers long documents without rendering every line', () => {
  const window = lineWindow(20_000, 10_000 * 24);
  assert.equal(window.first, 9_995);
  assert.equal(window.count, 300);
  assert.equal(window.offset, -120);
  assert.equal(lineWindow(1,0).count,1);
  assert.equal(lineWindow(0,0).count,1);
});
