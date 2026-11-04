import { Frame } from './Frame';

const checks = [
  ['Version', '17.4.2'],
  ['Token scopes', 'api, read_repository'],
  ['Webhook delivery', '142 ms'],
  ['Relay', 'connected, outbound only']
];

export function GitlabSelfManaged() {
  return (
    <Frame title='Integrations · GitLab self-managed'>
      <p className='text-[13px] text-muted-foreground'>Instance URL</p>
      <p className='mt-1.5 rounded-lg bg-background px-3.5 py-2.5 font-mono text-[12.5px] text-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]'>
        https://git.halcyon.internal
      </p>
      <ul className='mt-4 grid gap-1.5'>
        {checks.map(([label, value]) => (
          <li key={label} className='flex items-center gap-3 text-[13px]'>
            <svg width='12' height='12' viewBox='0 0 12 12' aria-hidden='true' className='shrink-0 text-brand'>
              <path d='M2.5 6.2 5 8.5l4.5-5' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
            <span className='text-foreground'>{label}</span>
            <span className='ml-auto truncate font-mono text-[12px] text-muted-foreground'>{value}</span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}
