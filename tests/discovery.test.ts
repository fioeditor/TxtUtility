import test from 'node:test';
import assert from 'node:assert/strict';
import {searchTools} from '../lib/discovery';

test('finds a tool by task, synonym and diacritic variation', () => {
  assert.equal(searchTools('remove lines that contain error')[0]?.tool.id, 'filter');
  assert.equal(searchTools('delete blank lines')[0]?.tool.id, 'empty');
  assert.equal(searchTools('number lines')[0]?.tool.id, 'number');
  assert.equal(searchTools('strip accents')[0]?.tool.id, 'accents');
  assert.equal(searchTools('remove lines that contáin')[0]?.tool.id, 'filter');
});
test('selects keep mode when the task says keep or preserve', () => {
  const keep = searchTools('keep lines that contain warning')[0];
  assert.equal(keep?.tool.id, 'filter');
  assert.equal(keep?.mode, 'keep');
  const remove = searchTools('remove lines that contain warning')[0];
  assert.equal(remove?.tool.id, 'filter');
  assert.equal(remove?.mode, 'remove');
});
test('empty text suggests nothing, results are limited and filterable', () => {
  assert.deepEqual(searchTools('   '), []);
  assert.ok(searchTools('lines').length > 0, 'generic terms show related actions');
  assert.deepEqual(searchTools(' the of a '), []);
  assert.ok(searchTools('sort')['length'] <= 6);
});
