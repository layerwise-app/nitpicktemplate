import { useCallback, useEffect, useReducer, useRef } from 'react';

export type Phase = 'waiting' | 'reviewing' | 'ready';

type State = {
  phase: Phase;
  /** How many comments have streamed in. */
  arrived: number;
  /** Suggestion ids whose rewrite animation is running. */
  applying: string[];
  applied: string[];
  /** The visitor applied something, so the demo stops applying on its own. */
  userTookOver: boolean;
};

type Action =
  | { type: 'reset'; final: boolean; suggestionIds: string[]; total: number }
  | { type: 'review' }
  | { type: 'arrive'; total: number }
  | { type: 'apply'; id: string; byUser: boolean }
  | { type: 'applied'; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'reset':
      return action.final
        ? {
            phase: 'ready',
            arrived: action.total,
            applying: [],
            applied: action.suggestionIds,
            userTookOver: true
          }
        : {
            phase: 'waiting',
            arrived: 0,
            applying: [],
            applied: [],
            userTookOver: false
          };
    case 'review':
      return { ...state, phase: 'reviewing' };
    case 'arrive': {
      const arrived = Math.min(state.arrived + 1, action.total);
      return {
        ...state,
        arrived,
        phase: arrived === action.total ? 'ready' : 'reviewing'
      };
    }
    case 'apply':
      if (state.applied.includes(action.id) || state.applying.includes(action.id)) {
        return state;
      }
      if (!action.byUser && state.userTookOver) return state;
      return {
        ...state,
        applying: [...state.applying, action.id],
        userTookOver: state.userTookOver || action.byUser
      };
    case 'applied':
      return {
        ...state,
        applying: state.applying.filter((id) => id !== action.id),
        applied: state.applied.includes(action.id)
          ? state.applied
          : [...state.applied, action.id]
      };
  }
}

/** Milliseconds from the start of a run. */
const SCRIPT = {
  review: 500,
  arrivals: [1900, 3100, 4200],
  autoApply: [6900, 8800]
};

const APPLY_MS = 1100;

/**
 * Plays the hero review: Reviewing → comments stream in → suggestions are
 * applied. The clock only runs while `active` (on screen, tab visible), so
 * the demo waits for the visitor instead of finishing unseen.
 */
export function useReviewPlayback({
  total,
  suggestionIds,
  active,
  reducedMotion
}: {
  total: number;
  suggestionIds: string[];
  active: boolean;
  reducedMotion: boolean | null;
}) {
  const [state, dispatch] = useReducer(reducer, {
    phase: 'waiting',
    arrived: 0,
    applying: [],
    applied: [],
    userTookOver: false
  });

  const elapsed = useRef(0);
  const startedAt = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const step = useRef(0);
  const [runId, bumpRun] = useReducer((n: number) => n + 1, 0);

  const events = useRef<{ at: number; run: () => void }[]>([]);

  const apply = useCallback(
    (id: string, byUser: boolean) => {
      dispatch({ type: 'apply', id, byUser });
      const done = setTimeout(
        () => dispatch({ type: 'applied', id }),
        reducedMotion ? 0 : APPLY_MS
      );
      applyTimers.current.push(done);
    },
    [reducedMotion]
  );

  // Build the run's script whenever a run starts.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runId restarts the script
  useEffect(() => {
    events.current = [
      { at: SCRIPT.review, run: () => dispatch({ type: 'review' }) },
      ...SCRIPT.arrivals.slice(0, total).map((at) => ({
        at,
        run: () => dispatch({ type: 'arrive', total })
      })),
      ...suggestionIds.map((id, index) => ({
        at: SCRIPT.autoApply[index] ?? SCRIPT.autoApply[0] + index * 1900,
        run: () => apply(id, false)
      }))
    ];
    step.current = 0;
    elapsed.current = 0;
  }, [runId]);

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const pause = useCallback(() => {
    if (startedAt.current !== null) {
      elapsed.current += performance.now() - startedAt.current;
      startedAt.current = null;
    }
    clear();
  }, [clear]);

  const schedule = useCallback(() => {
    clear();
    const next = events.current[step.current];
    if (!next) {
      startedAt.current = null;
      return;
    }
    startedAt.current = performance.now();
    timer.current = setTimeout(
      () => {
        elapsed.current = next.at;
        startedAt.current = null;
        next.run();
        step.current += 1;
        schedule();
      },
      Math.max(0, next.at - elapsed.current)
    );
  }, [clear]);

  // Reduced motion shows the finished review; otherwise start from the top.
  useEffect(() => {
    if (reducedMotion === null) return;
    if (reducedMotion) {
      events.current = [];
      dispatch({ type: 'reset', final: true, suggestionIds, total });
    }
  }, [reducedMotion, suggestionIds, total]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: runId restarts the clock
  useEffect(() => {
    if (reducedMotion !== false) return;
    if (active) schedule();
    else pause();
    return pause;
  }, [active, reducedMotion, runId, schedule, pause]);

  useEffect(
    () => () => {
      clear();
      for (const t of applyTimers.current) clearTimeout(t);
    },
    [clear]
  );

  const replay = useCallback(() => {
    clear();
    for (const t of applyTimers.current) clearTimeout(t);
    applyTimers.current = [];
    startedAt.current = null;
    if (reducedMotion) {
      // Show every comment at once and let the visitor apply them.
      events.current = [];
      dispatch({ type: 'reset', final: false, suggestionIds, total });
      for (let i = 0; i < total; i++) dispatch({ type: 'arrive', total });
      return;
    }
    dispatch({ type: 'reset', final: false, suggestionIds, total });
    bumpRun();
  }, [reducedMotion, suggestionIds, total, clear]);

  return {
    ...state,
    apply: (id: string) => apply(id, true),
    replay
  };
}
