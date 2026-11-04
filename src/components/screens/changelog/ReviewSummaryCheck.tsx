import { SeverityBadge } from '../review/CommentCard';
import { Frame } from './Frame';

const rows = [
  { severity: 'high' as const, title: 'N+1 query in a loop', resolved: true },
  { severity: 'high' as const, title: 'Missing auth check on a new route', resolved: true },
  { severity: 'low' as const, title: 'Empty state isn’t handled', resolved: false }
];

export function ReviewSummaryCheck() {
  return (
    <Frame title='Checks · Nitpick review' meta='passed'>
      <div className='flex items-center gap-2.5'>
        <span className='size-2 rounded-full bg-brand' />
        <span className='text-[14px] font-medium text-foreground'>1 open, 2 resolved</span>
        <span className='text-[13px] text-subtle'>· nothing blocking</span>
      </div>
      <div className='mt-4 overflow-hidden rounded-lg shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]'>
        {rows.map((row) => (
          <div key={row.title} className='flex items-center gap-3 border-b border-line px-3.5 py-2.5 text-[13px] last:border-b-0'>
            <SeverityBadge severity={row.severity} />
            <span className={`min-w-0 flex-1 truncate ${row.resolved ? 'text-subtle line-through decoration-white/20' : 'text-foreground'}`}>
              {row.title}
            </span>
            <span className={`shrink-0 font-mono text-[11.5px] ${row.resolved ? 'text-brand' : 'text-muted-foreground'}`}>
              {row.resolved ? 'resolved' : 'open'}
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}
