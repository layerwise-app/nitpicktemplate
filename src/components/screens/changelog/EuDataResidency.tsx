import { Frame } from './Frame';

const regions = [
  { name: 'US', place: 'Virginia', note: 'us-east', selected: false },
  { name: 'EU', place: 'Frankfurt', note: 'eu-central', selected: true }
];

export function EuDataResidency() {
  return (
    <Frame title='Settings · Organization · Review region'>
      <p className='text-[14px] font-medium text-foreground'>Where reviews run</p>
      <p className='mt-1 text-[13px] text-muted-foreground'>Diffs, model calls, and comments stay in this region.</p>
      <div className='mt-4 grid gap-3 @sm:grid-cols-2'>
        {regions.map((region) => (
          <div
            key={region.name}
            className={`flex items-center gap-3 rounded-xl px-4 py-3.5 ${
              region.selected
                ? 'bg-brand/[0.06] shadow-[inset_0_0_0_1px_rgb(198_243_154/0.5)]'
                : 'bg-surface-2 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]'
            }`}
          >
            <span className={`flex size-4 items-center justify-center rounded-full ${region.selected ? 'bg-brand' : 'shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.25)]'}`}>
              {region.selected && <span className='size-1.5 rounded-full bg-brand-ink' />}
            </span>
            <span>
              <span className='block text-[14px] text-foreground'>{region.name} · {region.place}</span>
              <span className='block font-mono text-[11.5px] text-subtle'>{region.note}</span>
            </span>
          </div>
        ))}
      </div>
      <p className='mt-4 font-mono text-[12px] text-subtle'>Takes effect on the next pull request</p>
    </Frame>
  );
}
