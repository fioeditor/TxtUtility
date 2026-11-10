import test from 'node:test';
import assert from 'node:assert/strict';
import { branchHistory, historyTarget, MAX_HISTORY_EDITS, retainHistory, restoreHistory } from '../lib/history';
import { repositoryUrl } from '../lib/project';

test('keeps the base and at most ten recent edits', () => {
  const snapshots = retainHistory(Array.from({ length: 42 }, (_, index) => `state-${index}`));
  assert.equal(MAX_HISTORY_EDITS, 10);
  assert.equal(snapshots.length, 11);
  assert.equal(snapshots[0], 'state-31');
  assert.equal(snapshots.at(-1), 'state-41');
  assert.equal(retainHistory(snapshots, NaN).length, 11);
});

test('restore picks a valid state and rejects out-of-range indexes', () => {
  const snapshots = retainHistory(['base', 'one', 'two']);
  assert.deepEqual(historyTarget(snapshots, 1), { state: 'one', index: 1 });
  assert.equal(historyTarget(snapshots, -1), null);
  assert.equal(historyTarget(snapshots, 3), null);
  assert.equal(historyTarget(snapshots, 1.2), null);
  assert.deepEqual(restoreHistory(snapshots, 2, 1), { states: snapshots, cursor: 1, state: 'one' });
});

test('restoring before the debounce keeps the pending edit available for redo', () => {
  const snapshots = ['base', 'version one', 'version two'];
  const restored = restoreHistory(snapshots, 2, 1, 'recent typing')!;
  assert.equal(restored.state, 'version one');
  assert.equal(restored.cursor, 1);
  assert.deepEqual(restored.states, [...snapshots, 'recent typing']);
  assert.deepEqual(snapshots, ['base', 'version one', 'version two']);
});

test('restoring with a full history adjusts the cursor and stays within the limit', () => {
  const snapshots = Array.from({ length: 11 }, (_, index) => ({ text: String(index) }));
  const restored = restoreHistory(snapshots, 10, 1, { text: 'pending' })!;
  assert.equal(restored.states.length, 11);
  assert.equal(restored.cursor, 0);
  assert.equal(restored.state.text, '1');
  assert.equal(restored.states.at(-1)?.text, 'pending');
  assert.equal(restoreHistory(snapshots, 10, 0, { text: 'pending' }), null);
  assert.equal(restoreHistory(snapshots, 10, -1), null);
});

test('a new edit after restoring a version ends the future branch', () => {
  const snapshots = ['base', 'edited', 'cleaned'];
  const restored = historyTarget(snapshots, 1)!;
  const next = retainHistory(branchHistory(snapshots, restored.index).concat('new edit'));
  assert.deepEqual(next, ['base', 'edited', 'new edit']);
});

test('repository URL points to the published GitHub repo', () => {
  assert.equal(new URL(repositoryUrl).hostname, 'github.com');
  assert.equal(repositoryUrl, 'https://github.com/fioeditor/TxtUtility');
});
