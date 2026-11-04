import type { ReactNode } from 'react';

/** The window every changelog screen is drawn in. */
export function Frame({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  return (
    <div className='panel overflow-hidden'>
      <div className='flex h-10 items-center gap-3 border-b border-line bg-background/40 px-4 font-mono text-[12px] text-subtle'>
        <span className='flex gap-1.5' aria-hidden='true'>
          <span className='size-2 rounded-full bg-surface-4' />
          <span className='size-2 rounded-full bg-surface-4' />
          <span className='size-2 rounded-full bg-surface-4' />
        </span>
        <span className='truncate'>{title}</span>
        {meta && <span className='ml-auto shrink-0'>{meta}</span>}
      </div>
      <div className='@container bg-background/20 p-4 sm:p-6'>{children}</div>
    </div>
  );
}
