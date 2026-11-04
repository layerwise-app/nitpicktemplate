/**
 * A small line-by-line highlighter for the TypeScript, TSX, and YAML shown in
 * the product screens. It runs during server rendering, so code arrives
 * colored with no extra JavaScript.
 */

export type TokenKind =
  | 'plain'
  | 'kw'
  | 'str'
  | 'num'
  | 'com'
  | 'fn'
  | 'type'
  | 'punct'
  | 'tag'
  | 'key';

export type Token = { text: string; kind: TokenKind };

const TS_KEYWORDS = new Set([
  'as',
  'async',
  'await',
  'break',
  'catch',
  'const',
  'else',
  'export',
  'false',
  'for',
  'from',
  'function',
  'if',
  'import',
  'in',
  'let',
  'new',
  'null',
  'of',
  'return',
  'throw',
  'true',
  'try',
  'type',
  'undefined'
]);

const TS_PATTERN =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d[\d_.]*\b)|(<\/?[A-Za-z][\w.]*)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$\d"'`]+)/g;

function tokenizeTs(line: string, jsx: boolean): Token[] {
  const tokens: Token[] = [];
  let lastKind: TokenKind = 'plain';
  for (const match of line.matchAll(TS_PATTERN)) {
    const [text, comment, string, number, tag, ident, space] = match;
    let kind: TokenKind = 'punct';
    if (comment) kind = 'com';
    else if (string) kind = 'str';
    else if (number) kind = 'num';
    else if (tag && jsx) kind = 'tag';
    else if (tag) kind = 'punct';
    else if (ident) {
      const next = line.slice((match.index ?? 0) + text.length);
      if (TS_KEYWORDS.has(text)) kind = 'kw';
      else if (/^\s*\(/.test(next)) kind = 'fn';
      else if (/^[A-Z]/.test(text)) kind = 'type';
      else kind = 'plain';
    } else if (space) kind = 'plain';
    if (kind === lastKind && tokens.length > 0) {
      tokens[tokens.length - 1].text += text;
    } else {
      tokens.push({ text, kind });
    }
    lastKind = kind;
  }
  return tokens;
}

const YAML_KEY = /^(\s*-?\s*)([\w.-]+)(:)(.*)$/;
const YAML_VALUE =
  /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b(?:on|off|true|false|yes|no)\b)|(\b\d[\d.]*\b)|([\w.-]+)(?=:)|([[\]{},:-])|(\s+)|([^\s[\]{},:#"']+)/g;

function tokenizeYamlValue(value: string): Token[] {
  const tokens: Token[] = [];
  for (const match of value.matchAll(YAML_VALUE)) {
    const [text, comment, string, bool, number, key, punct] = match;
    let kind: TokenKind = 'plain';
    if (comment) kind = 'com';
    else if (string) kind = 'str';
    else if (bool || number) kind = 'num';
    else if (key) kind = 'key';
    else if (punct) kind = 'punct';
    tokens.push({ text, kind });
  }
  return tokens;
}

function tokenizeYaml(line: string): Token[] {
  if (/^\s*#/.test(line)) return [{ text: line, kind: 'com' }];
  const keyMatch = YAML_KEY.exec(line);
  if (keyMatch) {
    const [, lead, key, colon, rest] = keyMatch;
    return [
      ...(lead ? tokenizeYamlValue(lead) : []),
      { text: key, kind: 'key' },
      { text: colon, kind: 'punct' },
      ...tokenizeYamlValue(rest)
    ];
  }
  return tokenizeYamlValue(line);
}

export function highlightLine(
  line: string,
  language: 'ts' | 'tsx' | 'yaml'
): Token[] {
  if (!line) return [];
  if (language === 'yaml') return tokenizeYaml(line);
  return tokenizeTs(line, language === 'tsx');
}
