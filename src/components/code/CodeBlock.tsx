import { CodeText } from './CodeText';

/** A file shown as code with line numbers, like the YAML config. */
export function CodeBlock({
  code,
  language,
  label
}: {
  code: string;
  language: 'ts' | 'tsx' | 'yaml';
  label: string;
}) {
  const lines = code.split('\n');
  return (
    <figure className='m-0'>
      <figcaption className='sr-only'>{label}</figcaption>
      {/* Focusable so the code can be scrolled sideways from the keyboard. */}
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region */}
      <section aria-label={label} tabIndex={0} className='overflow-x-auto'>
      <pre className='code m-0 py-4'>
        <code className='block min-w-max'>
          {lines.map((line, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: lines are static
            <span key={index} className='grid grid-cols-[44px_minmax(0,1fr)] pr-5'>
              <span className='diff-num select-none'>{index + 1}</span>
              <span className='whitespace-pre'>
                <CodeText text={line} language={language} />
              </span>
            </span>
          ))}
        </code>
      </pre>
      </section>
    </figure>
  );
}
