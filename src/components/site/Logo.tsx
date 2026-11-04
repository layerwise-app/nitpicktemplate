import { siteConfig } from '~/site.config';

/**
 * Nitpick's mark: a lowercase n whose right stroke ends in the nit, the one
 * thing worth flagging. Kept in sync with `public/logo.svg`.
 */
export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 32 32'
      fill='none'
      aria-hidden='true'
      className={className}
    >
      <rect x='0.5' y='0.5' width='31' height='31' rx='8.5' fill='#16171a' />
      <rect
        x='0.5'
        y='0.5'
        width='31'
        height='31'
        rx='8.5'
        stroke='url(#logo-edge)'
      />
      <path
        d='M10.25 23.5V14.6a5.75 5.75 0 0 1 11.5 0v2.4'
        stroke='#f1f2f3'
        strokeWidth='3.5'
        strokeLinecap='round'
      />
      <circle cx='21.75' cy='22.4' r='2.35' fill={siteConfig.colors.accent} />
      <defs>
        <linearGradient id='logo-edge' x1='16' y1='0' x2='16' y2='32'>
          <stop stopColor='#ffffff' stopOpacity='0.28' />
          <stop offset='1' stopColor='#ffffff' stopOpacity='0.06' />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo() {
  return (
    <span className='flex items-center gap-2.5'>
      <LogoMark />
      <span className='text-[16px] font-semibold tracking-[-0.02em] text-foreground'>
        {siteConfig.product}
      </span>
    </span>
  );
}
