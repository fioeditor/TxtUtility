export const MAX_HISTORY_EDITS = 10;
export const MAX_HISTORY_STATES = MAX_HISTORY_EDITS + 1;

/** Retains a rolling base state plus at most ten recent edits. */
export function retainHistory<T>(states: readonly T[], editLimit = MAX_HISTORY_EDITS): T[] {
  const safeLimit = Number.isFinite(editLimit) ? Math.max(1, Math.floor(editLimit)) : MAX_HISTORY_EDITS;
  const stateLimit = safeLimit === MAX_HISTORY_EDITS ? MAX_HISTORY_STATES : safeLimit + 1;
  return states.slice(-stateLimit);
}

export function branchHistory<T>(states: readonly T[], cursor: number): T[] {
  const index = Number.isInteger(cursor) ? Math.max(-1, Math.min(cursor, states.length - 1)) : states.length - 1;
  return states.slice(0, index + 1);
}

export function historyTarget<T>(states: readonly T[], index: number): { state: T; index: number } | null {
  if (!Number.isInteger(index) || index < 0 || index >= states.length) return null;
  return { state: states[index], index };
}

/** A fast restore must not drop typing still waiting for the editor's debounce. */
export function restoreHistory<T>(
  states: readonly T[],
  cursor: number,
  targetIndex: number,
  pending?: T,
): { states: T[]; cursor: number; state: T } | null {
  const target = historyTarget(states, targetIndex);
  if (!target) return null;
  const next = pending === undefined
    ? states.slice()
    : retainHistory(branchHistory(states, cursor).concat(pending));
  const index = next.indexOf(target.state);
  // Invalid/stale targets must never discard the current draft.
  if (index < 0) return null;
  return { states: next, cursor: index, state: target.state };
}
