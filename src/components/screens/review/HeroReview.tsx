import { useEffect, useRef, useState } from 'react';
import { CodeText, indentOf } from '~/components/code/CodeText';
import { demoPr } from '~/content/demo-pr';
import type { ReviewComment } from '~/content/types';
import { CommentCard } from './CommentCard';
import { useInView, useReducedMotion } from './hooks';
import { useReviewPlayback } from './useReviewPlayback';

/** Fired by the hero's "See it review a PR" button. */
export const REPLAY_EVENT = 'nitpick:replay-review';

// Geometry of the desktop layout, where comments sit in a rail beside the
// diff. Positions are computed from these so the server renders them in
// place and nothing moves when the page becomes interactive.
const LINE = 20;
const FILE_HEAD = 40;
const PAD_TOP = 6;
const PAD_BOTTOM = 10;
const GAP = 14;

function fileTop(index: number) {
  let top = 0;
  for (let i = 0; i < index; i++) {
    top += FILE_HEAD + PAD_TOP + demoPr.files[i].lines.length * LINE + PAD_BOTTOM;
  }
  return top;
}

function lineTop(file: number, line: number) {
  return fileTop(file) + FILE_HEAD + PAD_TOP + (line - 1) * LINE;
}

/** Estimated card height in the rail. Generous, so cards never overlap. */
function cardHeight(comment: ReviewComment) {
  const base = 16 + 20 + 10 + 22 + 6 + 60 + 16;
  // Suggestion: header, lines, padding, then the apply row.
  const suggestion = comment.suggestion
    ? 12 + 30 + comment.suggestion.length * 18 + 12 + 12 + 32
    : 0;
  return base + suggestion;
}

const sorted = [...demoPr.comments].sort(
  (a, b) => lineTop(a.file, a.lines[0]) - lineTop(b.file, b.lines[0])
);
const railLayout = (() => {
  let cursor = 0;
  const positions = new Map<string, { top: number; anchor: number }>();
  for (const comment of sorted) {
    const anchor = lineTop(comment.file, comment.lines[0]);
    const top = Math.max(anchor - 4, cursor);
    positions.set(comment.id, { top, anchor });
    cursor = top + cardHeight(comment) + GAP;
  }
  const diffHeight = fileTop(demoPr.files.length);
  return { positions, height: Math.max(diffHeight, cursor) };
})();

/**
 * On phones, the run of lines at the top of a file that is far from every
 * comment starts folded behind a button. [first, last], or null.
 */
function foldRange(file: number): [number, number] | null {
  const first = Math.min(...demoPr.comments.filter((c) => c.file === file).map((c) => c.lines[0]));
  if (!Number.isFinite(first)) return null;
  const last = first - 3;
  return last >= 3 ? [1, last] : null;
}

const suggestionIds = demoPr.comments
  .filter((c) => c.suggestion)
  .map((c) => c.id);
const labels = demoPr.labels;

function statusText(phase: string, remaining: number) {
  if (phase !== 'ready') return labels.reviewing;
  if (remaining === demoPr.comments.length) {
    return labels.found.replace('{n}', String(remaining));
  }
  if (remaining === 1) return labels.remainingOne;
  return labels.remaining.replace('{n}', String(remaining));
}

export function HeroReview() {
  const rootRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const inView = useInView(rootRef);
  const [unfolded, setUnfolded] = useState<number[]>([]);
  const [focused, setFocused] = useState<string | null>(null);

  const playback = useReviewPlayback({
    total: demoPr.comments.length,
    suggestionIds,
    active: inView,
    reducedMotion
  });

  const replayRef = useRef(playback.replay);
  replayRef.current = playback.replay;
  useEffect(() => {
    const onReplay = () => replayRef.current();
    window.addEventListener(REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_EVENT, onReplay);
  }, []);

  const arrivedIds = new Set(demoPr.comments.slice(0, playback.arrived).map((c) => c.id));
  const remaining = demoPr.comments.length - playback.applied.length;
  const status = statusText(playback.phase, remaining);
  const reviewing = playback.phase !== 'ready';

  const stateOf = (id: string) =>
    playback.applied.includes(id)
      ? 'applied'
      : playback.applying.includes(id)
        ? 'applying'
        : 'open';

  const cardProps = (comment: ReviewComment) => ({
    comment,
    arrived: arrivedIds.has(comment.id),
    state: stateOf(comment.id) as 'open' | 'applying' | 'applied',
    onApply: () => playback.apply(comment.id),
    onFocusChange: (on: boolean) => setFocused(on ? comment.id : null),
    labels
  });

  return (
    <section
      ref={rootRef}
      className='panel overflow-hidden text-left'
      data-paused={inView ? undefined : ''}
      aria-label={`Pull request #${demoPr.number} being reviewed by Nitpick`}
    >
      {/* Window bar */}
      <div className='flex h-11 items-center gap-3 border-b border-line bg-background/40 px-4 font-mono text-[12px] text-subtle'>
        <span className='flex gap-1.5' aria-hidden='true'>
          <span className='size-2.5 rounded-full bg-surface-4' />
          <span className='size-2.5 rounded-full bg-surface-4' />
          <span className='size-2.5 rounded-full bg-surface-4' />
        </span>
        <span className='ml-2 truncate'>
          {demoPr.repo} <span className='px-1 opacity-60'>/</span> pull/{demoPr.number}
          <span className='px-1 opacity-60'>/</span>files
        </span>
      </div>

      {/* Pull request header */}
      <div className='flex flex-col gap-4 border-b border-line px-4 pb-4 pt-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between'>
        <div className='min-w-0'>
          <h2 className='text-[18px] font-medium leading-snug tracking-[-0.015em] text-foreground sm:text-[21px]'>
            {demoPr.title} <span className='font-normal text-subtle'>#{demoPr.number}</span>
          </h2>
          <p className='mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-muted-foreground'>
            <span className='inline-flex h-6 items-center gap-1.5 rounded-full bg-surface-4 px-2.5 text-[12px] text-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]'>
              <span className='size-1.5 rounded-full bg-added' />
              Open
            </span>
            <span>
              <span className='text-foreground'>{demoPr.author.handle}</span> wants to merge{' '}
              {demoPr.commits} commit into
            </span>
            <code className='rounded-md bg-surface-3 px-1.5 py-0.5 font-mono text-[12px] text-foreground'>
              {demoPr.base}
            </code>
            <span>from</span>
            <code className='rounded-md bg-surface-3 px-1.5 py-0.5 font-mono text-[12px] text-foreground'>
              {demoPr.branch}
            </code>
          </p>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          <div
            className='flex h-9 items-center gap-2.5 rounded-full bg-surface-2 pl-3 pr-3.5 text-[13px] shadow-[inset_0_0_0_1px_rgb(198_243_154/0.22)]'
            aria-hidden='true'
          >
            {reviewing ? (
              <span className='spinner' />
            ) : (
              <span className='size-2 rounded-full bg-brand shadow-[0_0_10px_rgb(198_243_154/0.6)]' />
            )}
            <span className='text-muted-foreground'>
              <span className='sm:hidden'>{demoPr.reviewer.name}</span>
              <span className='hidden sm:inline'>{labels.check}</span>
            </span>
            <span className='h-3.5 w-px bg-line-strong' />
            <span className='min-w-[86px] font-medium text-brand tabular'>{status}</span>
          </div>
          <button
            type='button'
            onClick={playback.replay}
            className='btn btn-ghost h-9 px-3.5 text-[13px]'
          >
            {labels.replay}
          </button>
        </div>
      </div>
      <p className='sr-only' aria-live='polite'>
        {reviewing
          ? 'Nitpick is reviewing the pull request.'
          : `${labels.check}: ${status}.`}
      </p>

      {/* Tabs */}
      <div
        className='flex h-11 items-center gap-5 overflow-x-auto whitespace-nowrap border-b border-line px-4 text-[13px] text-subtle sm:px-6'
        aria-hidden='true'
      >
        <span>Conversation</span>
        <span>
          Commits <span className='tabular'>{demoPr.commits}</span>
        </span>
        <span>
          Checks <span className='tabular'>3</span>
        </span>
        <span className='relative flex h-full items-center text-foreground'>
          Files changed <span className='ml-1.5 text-subtle tabular'>{demoPr.files.length}</span>
          <span className='absolute inset-x-0 -bottom-px h-px bg-foreground' />
        </span>
        <span className='ml-auto shrink-0 pl-2 font-mono text-[12px] text-added tabular'>
          +{demoPr.files.reduce((sum, f) => sum + f.lines.length, 0)} −0
        </span>
      </div>

      {/* Diff and review rail */}
      <div className='relative grid rail:grid-cols-[minmax(0,1fr)_500px]'>
        <div className='relative min-w-0 wrap-code'>
          <div
            className='scan'
            data-on={reviewing && playback.phase === 'reviewing' ? '' : undefined}
            style={{ ['--scan-to' as string]: `${railLayout.height}px` }}
            aria-hidden='true'
          />
          {demoPr.files.map((file, fileIndex) => (
            <div key={file.path} className={fileIndex > 0 ? 'border-t border-line' : ''}>
              <div className='flex h-10 items-center gap-3 border-b border-line bg-surface-1 px-4 font-mono text-[12px] sm:px-5'>
                <span className='truncate text-muted-foreground'>{file.path}</span>
                <span className='ml-auto shrink-0 rounded bg-surface-3 px-1.5 py-0.5 text-[11px] text-muted-foreground'>
                  New file
                </span>
                <span className='shrink-0 text-added tabular'>+{file.lines.length}</span>
              </div>
              <div className='code pb-2.5 pt-1.5' role='presentation'>
                {(() => {
                  const fold = foldRange(fileIndex);
                  if (!fold || unfolded.includes(fileIndex)) return null;
                  return (
                    <button
                      type='button'
                      onClick={() => setUnfolded((list) => [...list, fileIndex])}
                      className='flex min-h-11 w-full items-center gap-3 bg-surface-2/60 px-4 font-sans text-[13px] text-muted-foreground sm:hidden'
                    >
                      <span aria-hidden='true' className='font-mono text-subtle'>⋯</span>
                      Show lines {fold[0]}–{fold[1]}
                    </button>
                  );
                })()}
                {file.lines.map((line, lineIndex) => {
                  const number = lineIndex + 1;
                  const fold = foldRange(fileIndex);
                  const folded =
                    fold && !unfolded.includes(fileIndex) && number >= fold[0] && number <= fold[1];
                  const flagging = demoPr.comments.find(
                    (c) => c.file === fileIndex && number >= c.lines[0] && number <= c.lines[1]
                  );
                  const fixState = flagging?.suggestion ? stateOf(flagging.id) : 'open';
                  const replacement =
                    flagging?.suggestion?.[number - flagging.lines[0]] ?? null;
                  const flag = !flagging
                    ? undefined
                    : !arrivedIds.has(flagging.id) || fixState !== 'open'
                      ? 'off'
                      : focused === flagging.id
                        ? 'focus'
                        : 'on';
                  const slotAfter = demoPr.comments.find(
                    (c) => c.file === fileIndex && c.lines[1] === number
                  );
                  const delay = flagging ? `${(number - flagging.lines[0]) * 55}ms` : undefined;
                  return (
                    <div key={number} className={folded ? 'max-sm:hidden' : undefined}>
                      <div
                        className={`diff-row ${replacement !== null ? 'applied-row' : ''}`}
                        data-kind='add'
                        data-flag={flag}
                        data-state={replacement !== null ? fixState : undefined}
                        style={
                          {
                            '--d': delay,
                            '--indent': indentOf(line.text)
                          } as React.CSSProperties
                        }
                      >
                        <span className='diff-num tabular'>{number}</span>
                        <span className='diff-sign'>+</span>
                        {replacement !== null ? (
                          <span className='diff-code rewrite' data-state={fixState}>
                            <span className='old' aria-hidden={fixState !== 'open'}>
                              <CodeText text={line.text} language={file.language} />
                            </span>
                            <span className='new' aria-hidden={fixState === 'open'}>
                              <CodeText text={replacement} language={file.language} />
                            </span>
                          </span>
                        ) : (
                          <span className='diff-code'>
                            <CodeText text={line.text} language={file.language} />
                          </span>
                        )}
                      </div>
                      {slotAfter && (
                        <div className='relative px-3 py-3 font-sans sm:px-5 rail:hidden'>
                          <InlineGhost comment={slotAfter} arrived={arrivedIds.has(slotAfter.id)} />
                          <CommentCard {...cardProps(slotAfter)} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div
          className='relative hidden border-l border-line bg-background/30 rail:block'
          style={{ minHeight: railLayout.height + 16 }}
        >
          {sorted.map((comment) => {
            const position = railLayout.positions.get(comment.id);
            if (!position) return null;
            const arrived = arrivedIds.has(comment.id);
            const resolved = stateOf(comment.id) !== 'open';
            const anchorY = position.anchor + LINE / 2;
            const cardY = position.top + 22;
            return (
              <div key={comment.id}>
                <span
                  aria-hidden='true'
                  className='arrive absolute left-0 w-4 border-t'
                  data-in={arrived ? '' : undefined}
                  style={{
                    top: anchorY,
                    borderColor: resolved ? 'rgb(255 255 255 / 0.12)' : 'rgb(198 243 154 / 0.5)'
                  }}
                />
                <span
                  aria-hidden='true'
                  className='arrive absolute left-4 border-l'
                  data-in={arrived ? '' : undefined}
                  style={{
                    top: Math.min(anchorY, cardY),
                    height: Math.abs(cardY - anchorY),
                    borderColor: resolved ? 'rgb(255 255 255 / 0.12)' : 'rgb(198 243 154 / 0.5)'
                  }}
                />
                <span
                  aria-hidden='true'
                  className='arrive absolute left-4 w-3 border-t'
                  data-in={arrived ? '' : undefined}
                  style={{
                    top: cardY,
                    borderColor: resolved ? 'rgb(255 255 255 / 0.12)' : 'rgb(198 243 154 / 0.5)'
                  }}
                />
                <div className='absolute left-7 right-4' style={{ top: position.top }}>
                  <CommentCard {...cardProps(comment)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Placeholder in the reserved space under a hunk until its comment arrives. */
function InlineGhost({ comment, arrived }: { comment: ReviewComment; arrived: boolean }) {
  return (
    <div
      className='ghost-card pointer-events-none absolute inset-x-3 inset-y-3 flex items-center justify-center gap-2.5 rounded-xl border border-dashed border-line-strong px-4 font-mono text-[12px] text-subtle sm:inset-x-5'
      data-out={arrived ? '' : undefined}
      aria-hidden='true'
    >
      {!arrived && <span className='spinner' />}
      Nitpick is reading lines {comment.lines[0]}–{comment.lines[1]}
    </div>
  );
}
