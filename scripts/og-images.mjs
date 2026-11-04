// Renders a 1200×630 share image for every page into public/og/.
// Usage: pnpm og   (run it after adding a changelog entry or changing titles)
//
// Reads names, colors, and copy straight from src/ (Node strips the types),
// so the images match the site. Fonts come from scripts/og-fonts/.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

const root = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));
const { siteConfig } = await import(root('src/site.config.ts'));
const { hero } = await import(root('src/content/home.ts'));
const { demoPr } = await import(root('src/content/demo-pr.ts'));
const { privacy, terms } = await import(root('src/content/legal.ts'));

const entries = [];
for (const file of (await readdir(root('src/content/changelog'))).filter((f) => f.endsWith('.ts'))) {
  entries.push((await import(root(`src/content/changelog/${file}`))).default);
}
entries.sort((a, b) => b.date.localeCompare(a.date));

const font = (name) => readFile(root(`scripts/og-fonts/${name}`));
const fonts = [
  { name: 'Sans', data: await font('schibsted-grotesk-latin-400-normal.woff'), weight: 400 },
  { name: 'Sans', data: await font('schibsted-grotesk-latin-500-normal.woff'), weight: 500 },
  { name: 'Sans', data: await font('schibsted-grotesk-latin-600-normal.woff'), weight: 600 },
  { name: 'Mono', data: await font('geist-mono-latin-400-normal.woff'), weight: 400 },
  { name: 'Mono', data: await font('geist-mono-latin-500-normal.woff'), weight: 500 }
];

const c = siteConfig.colors;
const logo = `data:image/svg+xml;base64,${(await readFile(root('public/logo.svg'))).toString('base64')}`;

/** A tiny element helper so the layouts read like markup. */
const h = (style, ...children) => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children: children.flat().filter(Boolean) }
});
const text = (style, value) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children: value } });

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const formatDate = (date) => dateFormat.format(new Date(`${date}T00:00:00Z`));

function pill(label, value) {
  return h(
    {
      alignItems: 'center',
      gap: 12,
      height: 40,
      padding: '0 18px',
      borderRadius: 999,
      background: c.surface2,
      border: '1px solid rgba(198,243,154,0.28)',
      fontSize: 18
    },
    h({ width: 10, height: 10, borderRadius: 999, background: c.accent }),
    text({ color: c.textMuted }, label),
    h({ width: 1, height: 16, background: 'rgba(255,255,255,0.14)' }),
    text({ color: c.accent, fontWeight: 500 }, value)
  );
}

/** A small diff card: the product, drawn the same way as on the site. */
function diffCard(lines, footer) {
  return h(
    {
      flexDirection: 'column',
      width: 470,
      borderRadius: 18,
      background: `linear-gradient(180deg, ${c.surface3}, ${c.surface1})`,
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 30px 60px -20px rgba(0,0,0,0.8)',
      overflow: 'hidden'
    },
    h(
      { height: 44, alignItems: 'center', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontFamily: 'Mono', fontSize: 15, color: c.textSubtle },
      demoPr.files[0].path
    ),
    h(
      { flexDirection: 'column', padding: '10px 0', fontFamily: 'Mono', fontSize: 16 },
      lines.map(([n, line, fixed]) =>
        h(
          { height: 28, alignItems: 'center', background: fixed ? 'rgba(198,243,154,0.07)' : 'rgba(143,211,165,0.04)', borderLeft: fixed ? `3px solid ${c.accent}` : '3px solid transparent' },
          text({ width: 46, justifyContent: 'flex-end', paddingRight: 12, color: c.textSubtle }, String(n)),
          text({ width: 20, color: fixed ? c.accent : c.added }, '+'),
          text({ color: '#d9dbdf', whiteSpace: 'pre' }, line.length > 34 ? `${line.slice(0, 33)}…` : line)
        )
      )
    ),
    footer &&
      h(
        { alignItems: 'center', gap: 10, height: 52, padding: '0 20px', borderTop: '1px solid rgba(255,255,255,0.07)', fontSize: 16, color: c.textMuted },
        h({ width: 8, height: 8, borderRadius: 999, background: c.accent }),
        footer
      )
  );
}

function frame({ eyebrow, title, body, path, visual, peek = false }) {
  return h(
    {
      width: 1200,
      height: 630,
      position: 'relative',
      background: c.background,
      fontFamily: 'Sans',
      color: c.text,
      padding: '64px 72px'
    },
    h({
      position: 'absolute',
      top: -420,
      left: 150,
      width: 900,
      height: 700,
      borderRadius: 999,
      backgroundImage: 'radial-gradient(closest-side, rgba(236,241,245,0.12), rgba(236,241,245,0.04) 50%, transparent)'
    }),
    h({ position: 'absolute', top: 0, left: 0, width: 1200, height: 1, backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }),
    h(
      {
        flexDirection: 'column',
        justifyContent: peek ? 'flex-start' : 'space-between',
        gap: peek ? 64 : 0,
        width: visual && !peek ? 560 : 1056,
        height: '100%'
      },
      h(
        { alignItems: 'center', gap: 14 },
        { type: 'img', props: { src: logo, width: 40, height: 40 } },
        text({ fontSize: 26, fontWeight: 600, letterSpacing: -0.5 }, siteConfig.product)
      ),
      h(
        { flexDirection: 'column', gap: 22 },
        eyebrow && text({ fontFamily: 'Mono', fontSize: 18, color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5 }, eyebrow),
        h(
          { flexDirection: 'column' },
          title.split('\n').map((line) => text({ fontSize: visual && !peek ? 56 : 68, fontWeight: 500, lineHeight: 1.06, letterSpacing: -2.4 }, line))
        ),
        body && text({ fontSize: 24, lineHeight: 1.45, color: c.textMuted }, body)
      ),
      text({ fontFamily: 'Mono', fontSize: 16, color: c.textSubtle, marginTop: peek ? 'auto' : 0 }, `${siteConfig.product} by ${siteConfig.company} · ${path}`)
    ),
    visual &&
      (peek
        ? h({ position: 'absolute', left: 658, top: 330, width: 470 }, visual)
        : h({ position: 'absolute', left: 658, top: 0, width: 470, height: 630, alignItems: 'center', justifyContent: 'flex-end' }, visual))
  );
}

const trim = (value, max) => (value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value);
// The hero pull request after both suggestions are applied, in file order.
const fixes = demoPr.comments.filter((comment) => comment.suggestion && comment.file === 0).sort((a, b) => a.lines[0] - b.lines[0]);
const fixedLines = fixes
  .flatMap((fix) => fix.suggestion.slice(0, 3).map((line, i) => [fix.lines[0] + i, line.replace(/^ {2}/, ''), true]))
  .filter(([, line]) => line.trim())
  .slice(0, 5);

const pages = [
  {
    name: 'home',
    tree: frame({
      title: hero.title,
      path: '/',
      peek: true,
      visual: h(
        { flexDirection: 'column', alignItems: 'flex-end', gap: 16 },
        pill(demoPr.labels.check, demoPr.labels.remainingOne),
        diffCard(fixedLines, null)
      )
    })
  },
  {
    name: 'changelog',
    tree: frame({
      eyebrow: 'Changelog',
      title: `What’s new in ${siteConfig.product}`,
      path: '/changelog',
      visual: h(
        { flexDirection: 'column', width: 470, gap: 12 },
        entries.slice(0, 4).map((entry) =>
          h(
            { flexDirection: 'column', gap: 6, padding: '16px 20px', borderRadius: 14, background: c.surface2, border: '1px solid rgba(255,255,255,0.08)' },
            text({ fontFamily: 'Mono', fontSize: 14, color: c.textSubtle }, formatDate(entry.date)),
            text({ fontSize: 21, color: c.text }, trim(entry.title, 36))
          )
        )
      )
    })
  },
  ...entries.map((entry) => ({
    name: `changelog/${entry.slug}`,
    tree: frame({
      eyebrow: `Changelog · ${formatDate(entry.date)}`,
      title: entry.title,
      body: trim(entry.summary, 120),
      path: `/changelog/${entry.slug}`
    })
  })),
  ...[
    ['privacy', privacy],
    ['terms', terms]
  ].map(([name, page]) => ({
    name,
    tree: frame({ eyebrow: `Updated ${formatDate(page.updated)}`, title: page.title, body: trim(page.description, 120), path: `/${name}` })
  })),
  {
    name: 'not-found',
    tree: frame({ eyebrow: '404', title: 'Nothing to review here.', body: 'This page doesn’t exist, or it was removed in a later commit.', path: '/404' })
  }
];

await mkdir(root('public/og/changelog'), { recursive: true });
for (const page of pages) {
  const svg = await satori(page.tree, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  await writeFile(root(`public/og/${page.name}.png`), png);
}
console.log(`Wrote ${pages.length} share images to public/og/.`);
