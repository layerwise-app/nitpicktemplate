import { security } from '~/content/home';

const d = security.diagram;

/** Splits a label into two lines at the separator or space nearest its middle. */
function twoLines(text: string): [string, string] {
  const separator = text.includes(' · ') ? ' · ' : ' ';
  const parts = text.split(separator);
  let best = 1;
  let bestGap = Number.POSITIVE_INFINITY;
  for (let i = 1; i < parts.length; i++) {
    const gap = Math.abs(parts.slice(0, i).join(separator).length - text.length / 2);
    if (gap < bestGap) {
      bestGap = gap;
      best = i;
    }
  }
  return [parts.slice(0, best).join(separator), parts.slice(best).join(separator)];
}
const inboundLines = twoLines(d.inbound.split(',')[0]);
const outboundLines = twoLines(d.outbound);
const nothingLines = twoLines(d.nothing);
const sans = 'var(--f-sans)';
const mono = 'var(--f-mono)';
const stroke = 'rgb(255 255 255 / 0.16)';
const brand = 'var(--c-accent)';

function Node({
  x,
  y,
  w,
  h,
  title,
  note,
  accent = false
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  note: string;
  accent?: boolean;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx='12' fill='var(--c-surface-3)' stroke={accent ? 'rgb(198 243 154 / 0.45)' : stroke} />
      <rect x={x + 0.5} y={y + 0.5} width={w - 1} height='1' fill='rgb(255 255 255 / 0.08)' />
      <text x={x + 18} y={y + h / 2 - 3} fontFamily={sans} fontSize='15' fontWeight='500' fill='var(--c-text)'>
        {title}
      </text>
      <text x={x + 18} y={y + h / 2 + 17} fontFamily={mono} fontSize='11.5' fill='var(--c-text-muted)'>
        {note}
      </text>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color = stroke }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 6;
  const a1 = angle + Math.PI - 0.5;
  const a2 = angle + Math.PI + 0.5;
  return (
    <g stroke={color} strokeWidth='1.4' fill='none' strokeLinecap='round' strokeLinejoin='round'>
      <path d={`M${x1} ${y1}L${x2} ${y2}`} />
      <path
        d={`M${x2 + head * Math.cos(a1)} ${y2 + head * Math.sin(a1)}L${x2} ${y2}L${x2 + head * Math.cos(a2)} ${y2 + head * Math.sin(a2)}`}
      />
    </g>
  );
}

function Discarded({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <g transform={`translate(${x} ${y})`} stroke='var(--c-text-subtle)' strokeWidth='1.3' fill='none'>
        <ellipse cx='11' cy='4' rx='10' ry='3.5' />
        <path d='M1 4v14c0 1.9 4.5 3.5 10 3.5s10-1.6 10-3.5V4' />
        <path d='M-2 22 24 0' stroke='var(--c-high)' strokeWidth='1.6' strokeLinecap='round' />
      </g>
    </g>
  );
}

/** Where code goes during a review: in from the host, through one region, and gone. */
export function SecurityDiagram() {
  return (
    <figure className='panel m-0 overflow-hidden p-4 sm:p-6'>
      <figcaption className='flex items-center justify-between gap-4 px-1 pb-4 text-[13px] text-muted-foreground'>
        {d.title}
      </figcaption>

      {/* Wide */}
      <svg viewBox='0 0 600 420' className='hidden h-auto w-full sm:block' role='img' aria-labelledby='diagram-desc'>
        <desc id='diagram-desc'>
          {`${d.host} sends the ${d.inbound.toLowerCase()} to the ${d.worker.toLowerCase()}, which calls the ${d.model.toLowerCase()} in the same region and sends ${d.outbound.toLowerCase()} back. ${d.discard}. ${d.nothing}.`}
        </desc>
        <Node x={170} y={16} w={260} h={76} title={d.host} note={d.hostNote} />

        <Arrow x1={262} y1={96} x2={262} y2={170} color={brand} />
        <text x={250} y={128} textAnchor='end' fontFamily={mono} fontSize='11.5' fill='var(--c-text-muted)'>
          {d.inbound.split(',')[0]}
        </text>
        <text x={250} y={146} textAnchor='end' fontFamily={mono} fontSize='11.5' fill='var(--c-text-subtle)'>
          {d.inbound.split(',')[1]?.trim()}
        </text>
        <Arrow x1={338} y1={170} x2={338} y2={96} />
        <text x={350} y={137} fontFamily={mono} fontSize='11.5' fill='var(--c-text-muted)'>
          {d.outbound}
        </text>

        <rect x='24' y='178' width='552' height='170' rx='16' fill='rgb(198 243 154 / 0.025)' stroke='rgb(198 243 154 / 0.3)' strokeDasharray='4 5' />
        <text x='44' y='204' fontFamily={mono} fontSize='11' letterSpacing='0.6' fill={brand}>
          YOUR REGION
        </text>
        <text x='556' y='204' textAnchor='end' fontFamily={mono} fontSize='11' fill='var(--c-text-muted)'>
          {d.regions.join('  or  ')}
        </text>

        <Node x={48} y={222} w={248} h={96} title={d.worker} note={d.workerNote} accent />
        <Node x={356} y={222} w={196} h={96} title={d.model} note={d.modelNote} />
        <Arrow x1={300} y1={258} x2={350} y2={258} />
        <Arrow x1={350} y1={282} x2={300} y2={282} />

        <Discarded x={46} y={372} />
        <text x={84} y={384} fontFamily={sans} fontSize='14' fill='var(--c-text)'>
          {d.discard}
        </text>
        <text x={84} y={404} fontFamily={mono} fontSize='11.5' fill='var(--c-text-muted)'>
          {d.nothing}
        </text>
      </svg>

      {/* Narrow */}
      <svg viewBox='0 0 320 600' className='h-auto w-full sm:hidden' role='img' aria-label={`${d.title}. ${d.discard}. ${d.nothing}.`}>
        <Node x={0} y={0} w={320} h={76} title={d.host} note={d.hostNote} />
        <Arrow x1={110} y1={82} x2={110} y2={160} color={brand} />
        <text x={98} y={116} textAnchor='end' fontFamily={mono} fontSize='11.5' fill='var(--c-text-muted)'>
          {inboundLines[0]}
        </text>
        <text x={98} y={134} textAnchor='end' fontFamily={mono} fontSize='11.5' fill='var(--c-text-muted)'>
          {inboundLines[1]}
        </text>
        <Arrow x1={210} y1={160} x2={210} y2={82} />
        <text x={222} y={116} fontFamily={mono} fontSize='11.5' fill='var(--c-text-muted)'>
          {outboundLines[0]}
        </text>
        <text x={222} y={134} fontFamily={mono} fontSize='11.5' fill='var(--c-text-muted)'>
          {outboundLines[1]}
        </text>

        <rect x='1' y='168' width='318' height='318' rx='16' fill='rgb(198 243 154 / 0.025)' stroke='rgb(198 243 154 / 0.3)' strokeDasharray='4 5' />
        <text x='20' y='194' fontFamily={mono} fontSize='11' letterSpacing='0.6' fill={brand}>
          YOUR REGION
        </text>
        <text x='20' y='212' fontFamily={mono} fontSize='11' fill='var(--c-text-muted)'>
          {d.regions.join(' or ')}
        </text>
        <Node x={18} y={228} w={284} h={92} title={d.worker} note={d.workerNote} accent />
        <Arrow x1={140} y1={326} x2={140} y2={372} />
        <Arrow x1={180} y1={372} x2={180} y2={326} />
        <Node x={18} y={378} w={284} h={88} title={d.model} note={d.modelNote} />

        <Discarded x={4} y={514} />
        <text x={40} y={526} fontFamily={sans} fontSize='14' fill='var(--c-text)'>
          {d.discard}
        </text>
        <text x={40} y={548} fontFamily={mono} fontSize='11' fill='var(--c-text-muted)'>
          {nothingLines[0]}
        </text>
        <text x={40} y={566} fontFamily={mono} fontSize='11' fill='var(--c-text-muted)'>
          {nothingLines[1]}
        </text>
      </svg>
    </figure>
  );
}
