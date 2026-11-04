import { useState } from 'react';
import { CodeText, indentOf } from '~/components/code/CodeText';
import { LogoMark } from '~/components/site/Logo';
import { type RuleId, rules } from '~/content/home';
import { SeverityBadge } from './review/CommentCard';

/**
 * Six review rules with switches. Turning one off removes its findings from
 * the sample diff immediately; turning it on brings them back. Everything
 * runs from the sample data in `home.ts`.
 */
export function RulesDemo() {
  const [enabled, setEnabled] = useState<Set<RuleId>>(
    () => new Set(rules.list.map((rule) => rule.id))
  );
  const { sample } = rules;
  const findings = sample.findings.filter((f) => enabled.has(f.rule));
  const nameOf = (id: RuleId) => rules.list.find((r) => r.id === id)?.name ?? id;

  const toggle = (id: RuleId) =>
    setEnabled((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className='panel grid overflow-hidden lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]'>
      <div className='border-b border-line bg-background/30 lg:border-b-0 lg:border-r'>
        <div className='lg:sticky lg:top-16'>
        <div className='flex h-12 items-center justify-between border-b border-line px-5 text-[13px]'>
          <span className='font-medium text-foreground'>Review rules</span>
          <span className='font-mono text-[12px] text-subtle tabular' aria-live='polite'>
            {enabled.size} of {rules.list.length} on
          </span>
        </div>
        <ul className='grid gap-px p-2 sm:grid-cols-2 lg:grid-cols-1'>
          {rules.list.map((rule) => {
            const on = enabled.has(rule.id);
            const count = sample.findings.filter((f) => f.rule === rule.id).length;
            return (
              <li key={rule.id}>
                <button
                  type='button'
                  role='switch'
                  aria-checked={on}
                  onClick={() => toggle(rule.id)}
                  className='group flex w-full items-start gap-3.5 rounded-[10px] px-3 py-3 text-left transition-colors hover:bg-white/[0.035] focus-visible:bg-white/[0.035]'
                >
                  <span className='switch mt-0.5' aria-hidden='true' />
                  <span className='min-w-0 flex-1'>
                    <span
                      className={`block text-[14.5px] font-medium leading-5 transition-colors ${on ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      {rule.name}
                    </span>
                    <span className='mt-1 block text-[13px] leading-[18px] text-subtle'>
                      {rule.description}
                    </span>
                  </span>
                  <span
                    className={`mt-0.5 font-mono text-[12px] tabular transition-colors ${on ? 'text-brand' : 'text-subtle'}`}
                  >
                    {on ? count : 0}
                    <span className='sr-only'> finding{count === 1 ? '' : 's'}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        </div>
      </div>

      <div className='min-w-0'>
        <div className='flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-4 py-3 sm:h-12 sm:px-5 sm:py-0'>
          <span className='min-w-0 truncate text-[13px] text-muted-foreground'>
            <span className='font-mono text-[12px] text-subtle'>{sample.repo}</span>{' '}
            <span className='text-foreground'>{sample.title}</span>{' '}
            <span className='text-subtle'>#{sample.number}</span>
          </span>
          <span
            className='ml-auto flex h-7 items-center gap-2 rounded-full bg-surface-2 px-3 text-[12px] shadow-[inset_0_0_0_1px_rgb(198_243_154/0.22)]'
            aria-live='polite'
          >
            <span className={`size-1.5 rounded-full ${findings.length ? 'bg-brand' : 'bg-subtle'}`} />
            <span className='text-muted-foreground'>Nitpick</span>
            <span className='font-medium text-brand tabular'>
              {findings.length === 0
                ? 'No findings'
                : `${findings.length} finding${findings.length === 1 ? '' : 's'}`}
            </span>
          </span>
        </div>
        <div className='flex h-10 items-center gap-3 border-b border-line bg-surface-1 px-4 font-mono text-[12px] sm:px-5'>
          <span className='truncate text-muted-foreground'>{sample.file.path}</span>
          <span className='ml-auto shrink-0 text-added tabular'>+{sample.file.lines.length}</span>
        </div>
        <div className='code wrap-code-sm py-2'>
          {sample.file.lines.map((line, index) => {
            const number = index + 1;
            const notes = findings.filter((f) => f.line === number);
            return (
              <div key={number}>
                <div
                  className='diff-row'
                  data-kind='add'
                  data-flag={notes.length ? 'on' : 'off'}
                  style={{ '--indent': indentOf(line.text) } as React.CSSProperties}
                >
                  <span className='diff-num tabular'>{number}</span>
                  <span className='diff-sign'>+</span>
                  <span className='diff-code'>
                    <CodeText text={line.text} language={sample.file.language} />
                  </span>
                </div>
                {notes.map((note) => (
                  <div key={note.rule} className='note-enter'>
                    <div className='min-h-0 overflow-hidden'>
                      <div className='mx-3 my-2 flex gap-3 rounded-[10px] bg-surface-3/80 px-3.5 py-3 font-sans shadow-[inset_0_0_0_1px_rgb(198_243_154/0.14)] sm:ml-[62px] sm:mr-5'>
                        <LogoMark size={18} className='mt-px shrink-0' />
                        <div className='min-w-0 flex-1'>
                          <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                            <span className='text-[13.5px] font-medium leading-5 text-foreground'>
                              {note.title}
                            </span>
                            <SeverityBadge severity={note.severity} />
                          </div>
                          <p className='mt-1 text-[13px] leading-5 text-muted-foreground'>{note.body}</p>
                        </div>
                        <span className='hidden shrink-0 pt-0.5 font-mono text-[11px] text-subtle sm:block'>
                          {nameOf(note.rule)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
