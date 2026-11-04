import { useEffect, useRef, useState } from 'react';
import { CodeText } from '~/components/code/CodeText';
import { LogoMark } from '~/components/site/Logo';
import { demoPr } from '~/content/demo-pr';
import { type TimelineState, timeline } from '~/content/home';
import { SeverityBadge } from './review/CommentCard';

const steps = timeline.steps;
const order: TimelineState[] = ['opened', 'reviewed', 'fixed', 'approved', 'merged'];
const rank = (state: TimelineState) => order.indexOf(state);

const toSeconds = (time: string) => {
  const [h, m, s] = time.split(':').map(Number);
  return h * 3600 + m * 60 + s;
};
const formatClock = (total: number) => {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
};
const formatElapsed = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `+${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
const times = steps.map((step) => toSeconds(step.time));

/** Clock time and active step for a scroll progress between 0 and 1. */
export function timelineAt(progress: number) {
  const t = Math.min(1, Math.max(0, progress / 0.94)) * (steps.length - 1);
  const index = Math.min(steps.length - 1, Math.floor(t));
  const fraction = t - index;
  // Each step holds for a moment before the clock runs to the next one.
  const run = Math.max(0, (fraction - 0.3) / 0.7);
  const eased = run < 0.5 ? 2 * run * run : 1 - (-2 * run + 2) ** 2 / 2;
  const next = times[index + 1] ?? times[index];
  return { index, seconds: times[index] + (next - times[index]) * eased };
}

export function PrTimeline() {
  return (
    <>
      <TimelineScrubber />
      <TimelineList />
    </>
  );
}

/** Desktop: the panel stays put while scrolling moves the clock. */
function TimelineScrubber() {
  const trackRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const elapsedRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const desktop = window.matchMedia('(min-width: 1024px)');
    let frame = 0;
    let listening = false;

    const update = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      const progress = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0;
      const { index, seconds } = timelineAt(progress);
      if (clockRef.current) clockRef.current.textContent = formatClock(seconds);
      if (elapsedRef.current) elapsedRef.current.textContent = formatElapsed(seconds - times[0]);
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress})`;
      setActive((current) => (current === index ? current : index));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const start = () => {
      if (listening) return;
      listening = true;
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      update();
    };
    const stop = () => {
      listening = false;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    // Listen only while the section is on screen.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && desktop.matches) start();
      else stop();
    });
    observer.observe(track);
    return () => {
      observer.disconnect();
      stop();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const step = steps[active];

  return (
    <div ref={trackRef} className='timeline-track relative hidden lg:block'>
      <div className='sticky top-16 flex h-[calc(100dvh-4rem)] items-center'>
        <div className='mx-auto grid w-full max-w-[1240px] grid-cols-[minmax(0,340px)_minmax(0,1fr)] items-center gap-14 px-8'>
          <div>
            <div className='flex items-baseline gap-3'>
              <span
                ref={clockRef}
                className='font-mono text-[56px] font-[440] leading-none tracking-[-0.04em] text-foreground tabular'
              >
                {steps[0].time}
              </span>
            </div>
            <p className='mt-3 font-mono text-[13px] text-subtle tabular'>
              <span ref={elapsedRef}>+00:00</span> since opened
            </p>
            <ol className='relative mt-10 grid gap-1'>
              <span
                aria-hidden='true'
                className='absolute bottom-4 left-[5px] top-4 w-px bg-line-strong'
              />
              <span
                ref={fillRef}
                aria-hidden='true'
                className='absolute bottom-4 left-[5px] top-4 w-px origin-top bg-brand/70'
                style={{ transform: 'scaleY(0)' }}
              />
              {steps.map((s, index) => {
                const state = index < active ? 'done' : index === active ? 'now' : 'next';
                return (
                  <li
                    key={s.time}
                    className='relative grid grid-cols-[11px_76px_1fr] items-center gap-4 py-2.5'
                    aria-current={state === 'now' ? 'step' : undefined}
                  >
                    <span
                      className={`relative size-[11px] rounded-full border transition-colors duration-300 ${
                        state === 'next'
                          ? 'border-line-strong bg-background'
                          : 'border-brand bg-brand'
                      } ${state === 'now' ? 'shadow-[0_0_12px_rgb(198_243_154/0.6)]' : ''}`}
                    />
                    <span
                      className={`font-mono text-[13px] tabular transition-colors ${state === 'next' ? 'text-subtle' : 'text-muted-foreground'}`}
                    >
                      {s.time}
                    </span>
                    <span
                      className={`text-[15px] transition-colors ${state === 'now' ? 'font-medium text-foreground' : state === 'done' ? 'text-muted-foreground' : 'text-subtle'}`}
                    >
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className='relative mt-8 h-[92px]'>
              {steps.map((s, index) => (
                <div
                  key={s.time}
                  className='fade-swap absolute inset-0'
                  data-hidden={index === active ? undefined : ''}
                  aria-hidden={index !== active}
                >
                  <h3 className='text-[19px] font-medium tracking-[-0.015em] text-foreground'>
                    {s.title}
                  </h3>
                  <p className='mt-2 text-[15px] leading-6 text-muted-foreground'>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
          <TimelinePanel state={step.state} active={active} />
        </div>
      </div>
    </div>
  );
}

const file = demoPr.files[0];
const firstLine = 5;
const lastLine = 19;
const fixes = demoPr.comments.filter((c) => c.file === 0 && c.suggestion);

function TimelinePanel({ state, active }: { state: TimelineState; active: number }) {
  const at = rank(state);
  const reviewed = at >= rank('reviewed');
  const fixed = at >= rank('fixed');
  const merged = state === 'merged';

  const statusChip = merged
    ? { label: 'Merged', tone: 'bg-brand/15 text-brand shadow-[inset_0_0_0_1px_rgb(198_243_154/0.35)]' }
    : state === 'approved'
      ? { label: 'Approved', tone: 'bg-surface-4 text-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14)]' }
      : { label: 'Open', tone: 'bg-surface-4 text-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]' };

  const check = !reviewed
    ? 'Reviewing'
    : fixed
      ? '1 low-severity issue'
      : `${demoPr.comments.length} issues`;

  const mergeBox = merged
    ? `Merged into ${demoPr.base} as ${timeline.mergeCommit}`
    : state === 'approved'
      ? 'Approved. Ready to merge.'
      : fixed
        ? 'Checks pass. Waiting for a human approval.'
        : reviewed
          ? 'Merging is blocked: 2 high-severity issues.'
          : 'Waiting for checks to finish.';

  return (
    <div className='panel overflow-hidden' aria-live='polite'>
      <div className='flex items-center gap-3 border-b border-line px-5 py-4'>
        <span
          className={`inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-[12px] font-medium transition-colors duration-300 ${statusChip.tone}`}
        >
          {statusChip.label}
        </span>
        <span className='min-w-0 truncate text-[15px] text-foreground'>
          {demoPr.title} <span className='text-subtle'>#{demoPr.number}</span>
        </span>
        <span className='ml-auto flex h-7 shrink-0 items-center gap-2 rounded-full bg-surface-2 px-3 text-[12px] shadow-[inset_0_0_0_1px_rgb(198_243_154/0.2)]'>
          {reviewed ? (
            <span className='size-1.5 rounded-full bg-brand' />
          ) : (
            <span className='size-1.5 rounded-full border border-brand' />
          )}
          <span className='text-muted-foreground'>Nitpick</span>
          <span className='w-[128px] font-medium text-brand'>{check}</span>
        </span>
      </div>

      <ol className='grid gap-0 border-b border-line px-5 py-3'>
        {steps.map((s, index) => (
          <li
            key={s.time}
            className='fade-swap grid h-7 grid-cols-[70px_1fr] items-center gap-3 text-[12.5px]'
            data-hidden={index <= active ? undefined : ''}
          >
            <span className='font-mono text-subtle tabular'>{s.time}</span>
            <span className={`truncate ${index === active ? 'text-foreground' : 'text-muted-foreground'}`}>
              {s.event}
            </span>
          </li>
        ))}
      </ol>

      <div className='flex h-9 items-center border-b border-line bg-surface-1 px-5 font-mono text-[12px] text-muted-foreground'>
        {file.path}
      </div>
      <div className={`code relative py-2 transition-opacity duration-500 ${merged ? 'opacity-60' : ''}`}>
        {file.lines.slice(firstLine - 1, lastLine).map((line, offset) => {
          const number = firstLine + offset;
          const comment = fixes.find((c) => number >= c.lines[0] && number <= c.lines[1]);
          const replacement = comment?.suggestion?.[number - comment.lines[0]];
          const showFix = fixed && replacement !== undefined;
          const isFirst = comment && number === comment.lines[0];
          return (
            <div
              key={number}
              className={`diff-row ${comment ? 'applied-row' : ''}`}
              data-kind='add'
              data-flag={comment && reviewed && !fixed ? 'on' : 'off'}
              data-state={showFix ? 'applied' : undefined}
            >
              <span className='diff-num tabular'>{number}</span>
              <span className='diff-sign'>+</span>
              <span className='diff-code rewrite' data-state={showFix ? 'applied' : 'open'}>
                <span className='old' aria-hidden={showFix}>
                  <CodeText text={line.text} language={file.language} />
                </span>
                <span className='new' aria-hidden={!showFix}>
                  <CodeText text={replacement ?? line.text} language={file.language} />
                </span>
              </span>
              {isFirst && comment && (
                <span
                  className='fade-swap absolute right-3 top-0 flex h-5 items-center gap-2 rounded-full bg-surface-3 pl-1 pr-2.5 font-sans text-[11.5px] shadow-[inset_0_0_0_1px_rgb(198_243_154/0.25)]'
                  data-hidden={reviewed && !fixed ? undefined : ''}
                  aria-hidden={!(reviewed && !fixed)}
                >
                  <LogoMark size={14} />
                  <SeverityBadge severity={comment.severity} />
                  <span className='hidden text-foreground xl:inline'>{comment.title}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className='flex h-12 items-center gap-3 border-t border-line px-5 text-[13px]'>
        <span
          className={`size-2 rounded-full transition-colors duration-300 ${merged || state === 'approved' ? 'bg-brand' : reviewed && !fixed ? 'bg-high' : 'bg-subtle'}`}
        />
        <span className='text-muted-foreground'>{mergeBox}</span>
      </div>
    </div>
  );
}

/** Phones and tablets: the same steps as a plain list. */
function TimelineList() {
  return (
    <ol className='mx-auto mt-12 grid max-w-[1240px] gap-0 px-5 sm:px-8 lg:hidden'>
      {steps.map((step, index) => (
        <li key={step.time} className='relative grid grid-cols-[18px_1fr] gap-4 pb-8 last:pb-0'>
          <span aria-hidden='true' className='relative flex justify-center'>
            <span className='mt-1.5 size-[11px] rounded-full border border-brand bg-brand' />
            {index < steps.length - 1 && (
              <span className='absolute bottom-[-6px] top-6 w-px bg-line-strong' />
            )}
          </span>
          <div>
            <p className='flex flex-wrap items-baseline gap-x-3 font-mono text-[13px] tabular'>
              <span className='text-foreground'>{step.time}</span>
              <span className='text-subtle'>{step.label}</span>
            </p>
            <h3 className='mt-2 text-[18px] font-medium tracking-[-0.015em] text-foreground'>
              {step.title}
            </h3>
            <p className='mt-1.5 text-[15px] leading-6 text-muted-foreground'>{step.body}</p>
            <p className='mt-3 rounded-lg bg-surface-2 px-3 py-2 font-mono text-[12px] leading-5 text-muted-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)]'>
              {step.event}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
