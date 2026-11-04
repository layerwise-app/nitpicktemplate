import { CodeText } from '~/components/code/CodeText';
import { Frame } from './Frame';

const yaml = ['rules:', '  route-tests:', '    paths: ["src/routes/**"]', '    ignore: ["**/*.migration.ts"]'];
const files = [
  { path: 'src/routes/carts.ts', matched: true },
  { path: 'src/routes/orders.ts', matched: true },
  { path: 'src/routes/0042.migration.ts', matched: false },
  { path: 'scripts/backfill.ts', matched: false }
];

export function PathScopedRules() {
  return (
    <Frame title='.nitpick.yml' meta='route-tests'>
      <div className='grid gap-4 @lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]'>
        <pre className='code m-0 overflow-hidden rounded-lg bg-background/70 px-4 py-3 text-[12px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]'>
          {yaml.map((line) => (
            <span key={line} className='block whitespace-pre'>
              <CodeText text={line} language='yaml' />
            </span>
          ))}
        </pre>
        <ul className='grid content-start gap-1.5 font-mono text-[12px]'>
          {files.map((file) => (
            <li key={file.path} className='flex items-center gap-2.5 rounded-md bg-surface-2 px-3 py-2 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]'>
              <span className={`size-1.5 shrink-0 rounded-full ${file.matched ? 'bg-brand' : 'bg-surface-4'}`} />
              <span className={`truncate ${file.matched ? 'text-foreground' : 'text-subtle line-through decoration-white/20'}`}>{file.path}</span>
              <span className='ml-auto shrink-0 text-subtle'>{file.matched ? 'checked' : 'skipped'}</span>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}
