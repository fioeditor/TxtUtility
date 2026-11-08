import test from 'node:test';
import assert from 'node:assert/strict';
import { branchHistory, historyTarget, MAX_HISTORY_EDITS, retainHistory, restoreHistory } from '../lib/history';
import { repositoryUrl, repositoryUrlIsPlaceholder } from '../lib/project';

test('retém a base e no máximo dez edições mais recentes', () => {
  const snapshots = retainHistory(Array.from({ length: 42 }, (_, index) => `estado-${index}`));
  assert.equal(MAX_HISTORY_EDITS, 10);
  assert.equal(snapshots.length, 11);
  assert.equal(snapshots[0], 'estado-31');
  assert.equal(snapshots.at(-1), 'estado-41');
  assert.equal(retainHistory(snapshots, NaN).length, 11);
});

test('restauração escolhe um estado válido e rejeita índices fora do histórico', () => {
  const snapshots = retainHistory(['base', 'um', 'dois']);
  assert.deepEqual(historyTarget(snapshots, 1), { state: 'um', index: 1 });
  assert.equal(historyTarget(snapshots, -1), null);
  assert.equal(historyTarget(snapshots, 3), null);
  assert.equal(historyTarget(snapshots, 1.2), null);
  assert.deepEqual(restoreHistory(snapshots, 2, 1), { states: snapshots, cursor: 1, state: 'um' });
});

test('restaurar antes do debounce conserva a edição pendente para refazer', () => {
  const snapshots = ['base', 'versão um', 'versão dois'];
  const restored = restoreHistory(snapshots, 2, 1, 'digitação recente')!;
  assert.equal(restored.state, 'versão um');
  assert.equal(restored.cursor, 1);
  assert.deepEqual(restored.states, [...snapshots, 'digitação recente']);
  assert.deepEqual(snapshots, ['base', 'versão um', 'versão dois']);
});

test('restaurar com histórico cheio ajusta o cursor e não ultrapassa o limite', () => {
  const snapshots = Array.from({ length: 11 }, (_, index) => ({ text: String(index) }));
  const restored = restoreHistory(snapshots, 10, 1, { text: 'pendente' })!;
  assert.equal(restored.states.length, 11);
  assert.equal(restored.cursor, 0);
  assert.equal(restored.state.text, '1');
  assert.equal(restored.states.at(-1)?.text, 'pendente');
  assert.equal(restoreHistory(snapshots, 10, 0, { text: 'pendente' }), null);
  assert.equal(restoreHistory(snapshots, 10, -1), null);
});

test('uma nova edição após restaurar uma versão encerra a ramificação futura', () => {
  const snapshots = ['base', 'editada', 'limpa'];
  const restored = historyTarget(snapshots, 1)!;
  const next = retainHistory(branchHistory(snapshots, restored.index).concat('nova edição'));
  assert.deepEqual(next, ['base', 'editada', 'nova edição']);
});

test('URL do repositório está centralizada e explicitamente marcada como dummy', () => {
  assert.equal(new URL(repositoryUrl).hostname, 'github.com');
  assert.match(repositoryUrl, /SEU_USUARIO/);
  assert.equal(repositoryUrlIsPlaceholder, true);
});
