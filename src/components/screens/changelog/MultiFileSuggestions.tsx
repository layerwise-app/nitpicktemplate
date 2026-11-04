import { CodeText } from '~/components/code/CodeText';
import { LogoMark } from '~/components/site/Logo';
import { Frame } from './Frame';

const files = [
  { name: 'routes/saved-carts.ts', del: 'const items = await loadOneByOne(ids);', add: 'const items = await loadProducts(ids);' },
  { name: 'server/products.ts', del: '', add: 'export const loadProducts = (ids) => db.products.getMany(ids);' }
];

export function MultiFileSuggestions() {
  return (
    <Frame title='quayside/storefront · pull/2207' meta='2 files'>
      <div className='panel-raised rounded-xl p-4'>
        <div className='flex items-center gap-2 text-[12.5px]'>
          <LogoMark size={18} />
          <span className='font-medium text-foreground'>Nitpick</span>
          <span className='text-subtle'>Suggested change across 2 files</span>
        </div>
        <div className='mt-3 overflow-hidden rounded-lg bg-background/70 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]'>
          <div className='flex gap-1 border-b border-line p-1.5 font-mono text-[11.5px]'>
            {files.map((file, i) => (
              <span
                key={file.name}
                className={`truncate rounded-md px-2.5 py-1 ${i === 0 ? 'bg-surface-4 text-foreground' : 'text-subtle'}`}
              >
                {file.name}
              </span>
            ))}
          </div>
          <div className='code overflow-hidden py-1.5 text-[12px]'>
            <div className='diff-row' data-kind='del'>
              <span className='diff-num'>14</span>
              <span className='diff-sign'>−</span>
              <span className='diff-code truncate'><CodeText text={files[0].del} language='ts' /></span>
            </div>
            <div className='diff-row applied-row' data-kind='add' data-state='applied'>
              <span className='diff-num'>14</span>
              <span className='diff-sign'>+</span>
              <span className='diff-code truncate'><CodeText text={files[0].add} language='ts' /></span>
            </div>
          </div>
        </div>
        <div className='mt-3 flex items-center gap-3'>
          <span className='inline-flex h-8 items-center rounded-full bg-brand px-3.5 text-[13px] font-medium text-brand-ink'>
            Apply to 2 files
          </span>
          <span className='text-[12px] text-subtle'>One commit</span>
        </div>
      </div>
    </Frame>
  );
}
