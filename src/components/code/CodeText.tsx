import { highlightLine } from '~/lib/highlight';

/** One highlighted line of code. */
export function CodeText({
  text,
  language
}: {
  text: string;
  language: 'ts' | 'tsx' | 'yaml';
}) {
  const tokens = highlightLine(text, language);
  if (tokens.length === 0) return <>{'​'}</>;
  return (
    <>
      {tokens.map((token, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: tokens are static per line
        <span key={index} className={`tk-${token.kind}`}>
          {token.text}
        </span>
      ))}
    </>
  );
}

/** Leading spaces, used for hanging indents when long lines wrap on phones. */
export function indentOf(text: string): number {
  return text.length - text.trimStart().length;
}
