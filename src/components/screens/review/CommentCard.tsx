import { CodeText } from '~/components/code/CodeText';
import { LogoMark } from '~/components/site/Logo';
import type { ReviewComment, Severity } from '~/content/types';

const severityLabel: Record<Severity, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const tone =
    severity === 'low'
      ? 'text-muted-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]'
      : 'text-high shadow-[inset_0_0_0_1px_rgb(242_166_143/0.35)]';
  return (
    <span
      className={`inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium leading-none ${tone}`}
    >
      <span
        className={`size-1.5 rounded-full ${
          severity === 'low'
            ? 'bg-subtle'
            : severity === 'medium'
              ? 'border border-high'
              : 'bg-high'
        }`}
      />
      {severityLabel[severity]}
    </span>
  );
}

/** Removes the indentation every line shares, so suggestions fit the card. */
function dedent(lines: string[]) {
  const indents = lines.filter((l) => l.trim()).map((l) => l.length - l.trimStart().length);
  const common = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(common));
}

export function CommentCard({
  comment,
  arrived,
  state,
  onApply,
  onFocusChange,
  labels
}: {
  comment: ReviewComment;
  arrived: boolean;
  state: 'open' | 'applying' | 'applied';
  onApply: () => void;
  onFocusChange: (focused: boolean) => void;
  labels: { apply: string; applied: string; suggestedChange: string };
}) {
  const resolved = state !== 'open';
  const range =
    comment.lines[0] === comment.lines[1]
      ? `L${comment.lines[0]}`
      : `L${comment.lines[0]}–${comment.lines[1]}`;

  return (
    <article
      className='arrive panel-raised relative rounded-xl p-4'
      data-in={arrived ? '' : undefined}
      aria-hidden={!arrived}
      inert={!arrived}
      onMouseEnter={() => onFocusChange(true)}
      onMouseLeave={() => onFocusChange(false)}
      onFocus={() => onFocusChange(true)}
      onBlur={() => onFocusChange(false)}
      style={{
        boxShadow: resolved
          ? undefined
          : '0 0 0 1px rgb(198 243 154 / 0.16), 0 18px 40px -12px rgb(0 0 0 / 0.75), 0 2px 6px rgb(0 0 0 / 0.4)'
      }}
    >
      <header className='flex h-5 items-center gap-2 text-[12px]'>
        <LogoMark size={18} />
        <span className='font-medium text-foreground'>Nitpick</span>
        <SeverityBadge severity={comment.severity} />
        <span className='truncate text-subtle'>{comment.rule}</span>
        <span className='ml-auto shrink-0 font-mono text-[11px] text-subtle'>{range}</span>
      </header>
      <h3
        className={`mt-2.5 text-[15px] font-medium leading-[22px] tracking-[-0.01em] ${resolved ? 'text-muted-foreground line-through decoration-white/25' : 'text-foreground'}`}
      >
        {comment.title}
      </h3>
      <p className='mt-1.5 text-[13px] leading-5 text-muted-foreground'>{comment.body}</p>

      {comment.suggestion && (
        <>
          <div className='mt-3 overflow-hidden rounded-lg bg-background/70 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]'>
            <div className='flex h-[30px] items-center justify-between border-b border-line px-3 text-[11.5px] text-subtle'>
              <span>{labels.suggestedChange}</span>
              <span className='font-mono'>
                {comment.suggestion.length} {comment.suggestion.length === 1 ? 'line' : 'lines'}
              </span>
            </div>
            <div className='code overflow-x-auto py-1.5 text-[11px] leading-[18px]'>
              {dedent(comment.suggestion).map((line, index) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: static lines
                  key={index}
                  className='grid min-w-max grid-cols-[22px_minmax(0,1fr)] pr-3'
                >
                  <span className='select-none text-center text-brand/80'>+</span>
                  <span className='whitespace-pre'>
                    <CodeText text={line} language='ts' />
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className='mt-3 flex items-center gap-3'>
            <button
              type='button'
              onClick={onApply}
              aria-disabled={resolved}
              className={`inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium transition-colors ${
                resolved
                  ? 'cursor-default bg-transparent text-brand shadow-[inset_0_0_0_1px_rgb(198_243_154/0.3)]'
                  : 'bg-brand text-brand-ink hover:bg-[#d4f7b0]'
              }`}
            >
              {resolved ? (
                <>
                  <svg width='12' height='12' viewBox='0 0 12 12' aria-hidden='true'>
                    <path
                      d='M2.5 6.2 5 8.5l4.5-5'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.6'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  {labels.applied}
                </>
              ) : (
                labels.apply
              )}
            </button>
            <span className='text-[12px] text-subtle'>
              {resolved ? 'Committed to the branch' : 'Adds one commit'}
            </span>
          </div>
        </>
      )}
    </article>
  );
}
