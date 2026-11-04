import { type FontSetting, siteConfig } from '~/site.config';

// Turns the colors and fonts in `site.config.ts` into CSS that the root
// document inlines in <head>, so the first paint is already styled.

function fontFaces(name: 'sans' | 'mono', font: FontSetting): string {
  const { fallback } = font;
  return [
    `@font-face{font-family:'${font.family}';src:url('${font.file}') format('woff2');font-weight:${font.weights};font-style:normal;font-display:swap}`,
    `@font-face{font-family:'${font.family} Fallback';src:${fallback.local
      .map((local) => `local('${local}')`)
      .join(
        ','
      )};size-adjust:${fallback.sizeAdjust};ascent-override:${fallback.ascentOverride};descent-override:${fallback.descentOverride};line-gap-override:${fallback.lineGapOverride}}`,
    `:root{--f-${name}:'${font.family}','${font.family} Fallback',${name === 'mono' ? 'ui-monospace,monospace' : 'system-ui,sans-serif'}}`
  ].join('');
}

const kebab = (key: string) => key.replace(/[A-Z0-9]/g, (c) => `-${c.toLowerCase()}`);

export function themeCss(): string {
  const colors = Object.entries(siteConfig.colors)
    .map(([key, value]) => `--c-${kebab(key)}:${value}`)
    .join(';');
  return `${fontFaces('sans', siteConfig.fonts.sans)}${fontFaces('mono', siteConfig.fonts.mono)}:root{${colors}}`;
}

export const fontPreloads = [siteConfig.fonts.sans.file, siteConfig.fonts.mono.file];
