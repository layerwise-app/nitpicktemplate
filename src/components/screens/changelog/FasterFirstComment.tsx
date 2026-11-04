import { Frame } from './Frame';

const weeks = [71, 70, 72, 68, 66, 61, 57, 52, 47, 43, 40, 38];
const max = 80;

export function FasterFirstComment() {
  return (
    <Frame title='Median time to first comment' meta='12 weeks'>
      <div className='flex items-baseline gap-3'>
        <span className='text-[34px] font-[480] leading-none tracking-[-0.05em] text-foreground tabular'>38s</span>
        <span className='font-mono text-[12px] text-subtle'>from 71s</span>
      </div>
      <div className='mt-5 flex h-[120px] items-end gap-[3%]' role='img' aria-label={`Weekly median falling from ${weeks[0]} to ${weeks.at(-1)} seconds`}>
        {weeks.map((value, index) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed series
            key={index}
            className={`flex-1 rounded-t-[3px] ${index === weeks.length - 1 ? 'bg-brand' : 'bg-surface-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]'}`}
            style={{ height: `${(value / max) * 100}%` }}
          />
        ))}
      </div>
      <div className='mt-2 flex justify-between font-mono text-[11px] text-subtle'>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Aug</span>
      </div>
    </Frame>
  );
}
