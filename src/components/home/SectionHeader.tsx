import type { ReactNode } from 'react';

/** Eyebrow, title, and lede for a home page section. */
export function SectionHeader({
  id,
  eyebrow,
  title,
  body,
  split = false,
  children
}: {
  id: string;
  eyebrow: string;
  title: string;
  body?: string;
  /** Title on the left, body on the right, on wide screens. */
  split?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={
        split
          ? 'grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end lg:gap-16'
          : 'max-w-[44rem]'
      }
    >
      <div>
        <p className='eyebrow'>{eyebrow}</p>
        <h2
          id={`${id}-title`}
          className='heading mt-4 max-w-[20ch] text-[34px] text-foreground sm:text-[44px] lg:text-[52px]'
        >
          {title}
        </h2>
      </div>
      {(body || children) && (
        <div className={split ? 'lg:pb-1.5' : 'mt-5'}>
          {body && <p className='lede max-w-[34rem] text-[17px] leading-[1.65]'>{body}</p>}
          {children}
        </div>
      )}
    </div>
  );
}
