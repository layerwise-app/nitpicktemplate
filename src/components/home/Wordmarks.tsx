import type { ReactNode } from 'react';

// Fictional customer wordmarks, drawn in SVG. Any name without a drawing is
// set in type so the row still works after the names in home.ts change.

type Mark = { width: number; draw: ReactNode };

const sans = 'var(--f-sans)';
const mono = 'var(--f-mono)';
const serif = "Georgia, 'Times New Roman', serif";

const marks: Record<string, Mark> = {
  Quayside: {
    width: 128,
    draw: (
      <>
        <rect x='1' y='5' width='18' height='18' rx='5' fill='none' stroke='currentColor' strokeWidth='1.6' />
        <path d='M4.5 12.5c2-1.6 3.5-1.6 5.5 0s3.5 1.6 5.5 0M4.5 16.5c2-1.6 3.5-1.6 5.5 0s3.5 1.6 5.5 0' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
        <text x='26' y='19.5' fontFamily={sans} fontSize='17' fontWeight='620' letterSpacing='-0.5' textLength='100' lengthAdjust='spacingAndGlyphs' fill='currentColor'>quayside</text>
      </>
    )
  },
  'Northbeam Freight': {
    width: 170,
    draw: (
      <>
        <circle cx='11' cy='14' r='9.5' fill='none' stroke='currentColor' strokeWidth='1.4' />
        <path d='M11 6.5 15 17l-4-2.4L7 17z' fill='currentColor' />
        <text x='28' y='16' fontFamily={sans} fontSize='12.5' fontWeight='600' letterSpacing='2.6' textLength='104' lengthAdjust='spacingAndGlyphs' fill='currentColor'>NORTHBEAM</text>
        <text x='28' y='24.5' fontFamily={mono} fontSize='7' letterSpacing='3.4' textLength='56' lengthAdjust='spacingAndGlyphs' fill='currentColor' opacity='0.75'>FREIGHT</text>
      </>
    )
  },
  'Halcyon Health': {
    width: 168,
    draw: (
      <>
        <path d='M2 19.5a9 9 0 0 1 18 0' fill='none' stroke='currentColor' strokeWidth='1.6' />
        <path d='M0 22.5h22' stroke='currentColor' strokeWidth='1.6' />
        <circle cx='11' cy='19.5' r='2.4' fill='currentColor' />
        <text x='30' y='20' fontFamily={serif} fontSize='18' fontStyle='italic' letterSpacing='-0.2' textLength='134' lengthAdjust='spacingAndGlyphs' fill='currentColor'>Halcyon Health</text>
      </>
    )
  },
  Tallowtree: {
    width: 142,
    draw: (
      <>
        <path d='M10 3.5c4.5 5 6 8.5 6 11.5a6 6 0 0 1-12 0c0-3 1.5-6.5 6-11.5Z' fill='none' stroke='currentColor' strokeWidth='1.5' />
        <path d='M10 12v12' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
        <text x='25' y='19' fontFamily={mono} fontSize='14.5' fontWeight='500' letterSpacing='-0.4' textLength='114' lengthAdjust='spacingAndGlyphs' fill='currentColor'>tallowtree</text>
      </>
    )
  },
  Orrery: {
    width: 116,
    draw: (
      <>
        <circle cx='12' cy='14' r='4' fill='currentColor' />
        <ellipse cx='12' cy='14' rx='11' ry='5.2' fill='none' stroke='currentColor' strokeWidth='1.3' transform='rotate(-24 12 14)' />
        <circle cx='21.2' cy='9.2' r='1.8' fill='currentColor' />
        <text x='31' y='19.5' fontFamily={sans} fontSize='18' fontWeight='420' letterSpacing='1.2' textLength='82' lengthAdjust='spacingAndGlyphs' fill='currentColor'>orrery</text>
      </>
    )
  },
  Brightwork: {
    width: 146,
    draw: (
      <>
        <path d='M11 2.5 13.4 11.6 22 14l-8.6 2.4L11 25.5l-2.4-9.1L0 14l8.6-2.4z' fill='currentColor' />
        <text x='28' y='20' fontFamily={sans} fontSize='18.5' fontWeight='760' letterSpacing='-0.9' textLength='116' lengthAdjust='spacingAndGlyphs' fill='currentColor'>Brightwork</text>
      </>
    )
  }
};

export function Wordmark({ name, className }: { name: string; className?: string }) {
  const mark = marks[name];
  if (!mark) {
    return (
      <span className={`text-[18px] font-semibold tracking-[-0.03em] ${className ?? ''}`}>{name}</span>
    );
  }
  return (
    <svg
      viewBox={`0 0 ${mark.width} 28`}
      width={mark.width}
      height={28}
      role='img'
      aria-label={name}
      className={className}
    >
      {mark.draw}
    </svg>
  );
}
