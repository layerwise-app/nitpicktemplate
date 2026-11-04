import { useId, useRef, useState } from 'react';
import { CodeText } from '~/components/code/CodeText';
import { LogoMark } from '~/components/site/Logo';
import { demoPr } from '~/content/demo-pr';
import { workflow } from '~/content/home';
import { SeverityBadge } from './review/CommentCard';

const comment = demoPr.comments.find((c) => !c.suggestion) ?? demoPr.comments[0];
const file = demoPr.files[comment.file];

/**
 * A Nitpick comment as it appears in each code host's thread. The tabs swap
 * the host's own words (pull request or merge request, check run or
 * pipeline job); the comment itself is the same everywhere.
 */
export function WorkflowPreview() {
  const [index, setIndex] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const host = workflow.hosts[index];

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = workflow.hosts.length - 1;
    let next = index;
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else return;
    event.preventDefault();
    setIndex(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className='panel overflow-hidden'>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-3 py-2 sm:px-4'>
        <div role='tablist' aria-label='Code host' className='flex gap-1' onKeyDown={onKeyDown}>
          {workflow.hosts.map((h, i) => (
            <button
              key={h.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type='button'
              role='tab'
              id={`${baseId}-tab-${h.id}`}
              aria-selected={i === index}
              aria-controls={`${baseId}-panel`}
              tabIndex={i === index ? 0 : -1}
              onClick={() => setIndex(i)}
              className={`min-h-11 rounded-full px-4 text-[14px] transition-colors ${
                i === index
                  ? 'bg-surface-4 text-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
        <span className='ml-auto text-[12.5px] text-subtle'>{host.install}</span>
      </div>

      <div
        id={`${baseId}-panel`}
        role='tabpanel'
        aria-labelledby={`${baseId}-tab-${host.id}`}
        className='bg-background/30 px-3 py-5 sm:px-6 sm:py-6'
      >
        <p className='flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground'>
          <span className='flex size-6 items-center justify-center rounded-full bg-surface-4 text-[10px] font-semibold text-foreground'>
            {demoPr.author.initials}
          </span>
          <span className='text-foreground'>{demoPr.author.handle}</span> opened {host.request.toLowerCase()}{' '}
          <span className='font-mono text-[12px] text-foreground'>{host.ref}</span>
          <span className='text-subtle'>· {demoPr.title}</span>
        </p>

        <div className='relative ml-3 mt-4 border-l border-line pl-5 sm:ml-3 sm:pl-6'>
          <div className='panel-raised overflow-hidden rounded-xl'>
            <div className='flex h-9 items-center justify-between border-b border-line px-4 font-mono text-[12px] text-subtle'>
              <span className='truncate'>{file.path}</span>
              <span className='shrink-0 pl-3'>
                L{comment.lines[0]}–{comment.lines[1]}
              </span>
            </div>
            <div className='code wrap-code-sm border-b border-line bg-background/40 py-1.5 text-[12px] leading-[19px]'>
              {file.lines.slice(comment.lines[0] - 1, comment.lines[0] + 1).map((line, i) => (
                <div key={line.text} className='diff-row' data-kind='add'>
                  <span className='diff-num tabular'>{comment.lines[0] + i}</span>
                  <span className='diff-sign'>+</span>
                  <span className='diff-code'>
                    <CodeText text={line.text} language={file.language} />
                  </span>
                </div>
              ))}
            </div>
            <div className='p-4'>
              <div className='flex flex-wrap items-center gap-2 text-[12.5px]'>
                <LogoMark size={18} />
                <span className='font-medium text-foreground'>nitpick</span>
                <span className='rounded bg-surface-4 px-1.5 py-px text-[11px] text-muted-foreground'>bot</span>
                <SeverityBadge severity={comment.severity} />
                <span className='text-subtle'>38s after opening</span>
              </div>
              <p className='mt-2.5 text-[14.5px] font-medium text-foreground'>{comment.title}</p>
              <p className='mt-1 text-[13.5px] leading-[21px] text-muted-foreground'>{comment.body}</p>
              <div className='mt-4 flex flex-wrap gap-2 text-[12.5px] text-muted-foreground' aria-hidden='true'>
                <span className='rounded-full px-3 py-1.5 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]'>Reply</span>
                <span className='rounded-full px-3 py-1.5 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]'>Resolve</span>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-5 flex items-center gap-3 rounded-xl bg-surface-2 px-4 py-3 text-[13px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)]'>
          <span className='size-2 shrink-0 rounded-full bg-brand' />
          <span className='text-foreground'>{host.check}</span>
          <span className='min-w-0 truncate text-muted-foreground'>Nitpick review · {host.checkResult}</span>
        </div>
      </div>
    </div>
  );
}
