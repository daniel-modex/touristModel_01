#!/usr/bin/env node
/**
 * Generates every Greenmiles brand asset from the real logo artwork.
 *
 *   node scripts/build-brand.mjs            # SVGs, manifest, Angular logo data
 *   node scripts/build-brand.mjs --png      # + PNG / ICO exports (needs Playwright + Chromium + ImageMagick)
 *
 * Source of truth: brand/source/greenmiles_logo_6.pdf (outlined vector).
 * brand/greenmiles-paths.json holds the 12 paths extracted from it (pdftocairo -svg);
 * nothing is re-traced, so the SVGs match the PDF exactly.
 *
 * Output
 *   public/brand/*.svg        logo, wordmark, mark in colour / white / black, app icon, pinned tab
 *   public/favicon.svg        browser tab icon
 *   public/*.png, favicon.ico icons, apple-touch-icon, maskable icon, og-image   (with --png)
 *   public/site.webmanifest
 *   src/app/data/logo-paths.ts  path data used by the <app-logo> component
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = JSON.parse(readFileSync(join(root, 'brand/greenmiles-paths.json'), 'utf8'));
const pub = join(root, 'public');
const brandDir = join(pub, 'brand');
mkdirSync(brandDir, { recursive: true });

const GREEN = src.colors.g; // #68B42C
const BLUE = src.colors.b; // #008BD2
const INK = '#141313';
const WHITE = '#FFFFFF';

/** `fills`: colours for g / b paths, or one colour for mono. */
const paths = (list, { g, b }) =>
  list.map((p) => `<path fill="${p.c === 'g' ? g : b}" d="${p.d}"/>`).join('');

const box = (b, pad) => ({ x: b.x - pad, y: b.y - pad, w: b.w + pad * 2, h: b.h + pad * 2 });
const vb = (b) => `${+b.x.toFixed(3)} ${+b.y.toFixed(3)} ${+b.w.toFixed(3)} ${+b.h.toFixed(3)}`;

function svg({ bounds, body, title = 'Greenmiles', width }) {
  const ratio = bounds.h / bounds.w;
  const w = width ?? 640;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb(bounds)}" width="${w}" height="${Math.round(w * ratio)}" role="img" aria-labelledby="t">` +
    `<title id="t">${title}</title>${body}</svg>\n`
  );
}

const fullB = box(src.bounds.full, 6);
const wordB = box(src.bounds.letters, 4);
const markB = box(src.bounds.mark, 4);
const all = [...src.letters, ...src.mark];
const colour = { g: GREEN, b: BLUE };
const mono = (c) => ({ g: c, b: c });

const write = (rel, content) => writeFileSync(join(pub, rel), content);

// ---- logo / wordmark / mark variants -------------------------------------------------
write('brand/greenmiles-logo.svg', svg({ bounds: fullB, body: paths(all, colour) }));
write('brand/greenmiles-logo-white.svg', svg({ bounds: fullB, body: paths(all, mono(WHITE)) }));
write('brand/greenmiles-logo-black.svg', svg({ bounds: fullB, body: paths(all, mono(INK)) }));
write('brand/greenmiles-wordmark.svg', svg({ bounds: wordB, body: paths(src.letters, colour), width: 600 }));
write('brand/greenmiles-wordmark-white.svg', svg({ bounds: wordB, body: paths(src.letters, mono(WHITE)), width: 600 }));
write('brand/greenmiles-mark.svg', svg({ bounds: markB, body: paths(src.mark, colour), width: 256 }));
write('brand/greenmiles-mark-white.svg', svg({ bounds: markB, body: paths(src.mark, mono(WHITE)), width: 256 }));
write('brand/greenmiles-mark-black.svg', svg({ bounds: markB, body: paths(src.mark, mono(INK)), width: 256 }));

// ---- square icons: the mark centred on a 512 grid ---------------------------------------
function squareIcon({ size = 512, tile, radius = 0, markFraction = 0.62, bg = WHITE, fills = colour, title = 'Greenmiles' }) {
  const m = src.bounds.mark;
  const target = size * markFraction; // longest side of the mark
  const scale = target / Math.max(m.w, m.h);
  const tx = (size - m.w * scale) / 2 - m.x * scale;
  const ty = (size - m.h * scale) / 2 - m.y * scale;
  const rect = tile ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>` : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-labelledby="t">` +
    `<title id="t">${title}</title>${rect}<g transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${scale.toFixed(5)})">${paths(src.mark, fills)}</g></svg>\n`
  );
}

write('favicon.svg', squareIcon({ markFraction: 0.92 })); // transparent, fills the tab
write('brand/greenmiles-app-icon.svg', squareIcon({ tile: true, radius: 112, markFraction: 0.6 }));
write('brand/greenmiles-app-icon-maskable.svg', squareIcon({ tile: true, radius: 0, markFraction: 0.52 })); // inside the 80% safe zone
write('brand/safari-pinned-tab.svg', squareIcon({ fills: mono('#000000'), markFraction: 0.86 }));

// ---- web manifest -------------------------------------------------------------------------
write(
  'site.webmanifest',
  JSON.stringify(
    {
      name: 'Greenmiles',
      short_name: 'Greenmiles',
      description: 'Plan your Kerala journey the green way.',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#008BD2',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      ],
    },
    null,
    2,
  ) + '\n',
);

// ---- Angular: path data for <app-logo> ---------------------------------------------------------
const ts = `// GENERATED by scripts/build-brand.mjs from brand/source/greenmiles_logo_6.pdf. Do not edit by hand.
export interface LogoPath {
  /** g = brand green, b = brand blue */
  c: 'g' | 'b';
  d: string;
}

export const LOGO_COLORS = { g: '${GREEN}', b: '${BLUE}' } as const;

export const LOGO_VIEWBOX = {
  full: '${vb(fullB)}',
  wordmark: '${vb(wordB)}',
  mark: '${vb(markB)}',
} as const;

export const LOGO_LETTERS: LogoPath[] = ${JSON.stringify(src.letters, null, 2)};

export const LOGO_MARK: LogoPath[] = ${JSON.stringify(src.mark, null, 2)};
`;
writeFileSync(join(root, 'src/app/data/logo-paths.ts'), ts);

console.log('SVGs, manifest and src/app/data/logo-paths.ts written.');

// ---- raster exports (optional) ---------------------------------------------------------------------
if (process.argv.includes('--png')) {
  // PLAYWRIGHT_PATH lets you point at a global install (ESM ignores NODE_PATH)
  const { chromium } = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox'],
  });
  const read = (rel) => readFileSync(join(pub, rel), 'utf8');

  /** Render an SVG string to a PNG at an exact pixel width (height follows the aspect ratio). */
  async function png(svgText, width, file, { background = 'transparent' } = {}) {
    const [, vw, vh] = svgText.match(/viewBox="[\d.\-]+ [\d.\-]+ ([\d.]+) ([\d.]+)"/);
    const height = Math.round((width * +vh) / +vw);
    const page = await browser.newPage({ viewport: { width, height } });
    await page.setContent(
      `<style>html,body{margin:0;background:${background}}body>svg{display:block;width:${width}px;height:${height}px}</style>${svgText}`,
    );
    await page.screenshot({ path: join(pub, file), omitBackground: background === 'transparent' });
    await page.close();
  }

  const icon = (opts) => squareIcon(opts);
  await png(icon({ markFraction: 0.92 }), 16, 'favicon-16x16.png');
  await png(icon({ markFraction: 0.92 }), 32, 'favicon-32x32.png');
  await png(icon({ markFraction: 0.92 }), 48, 'favicon-48x48.png');
  await png(icon({ tile: true, radius: 0, markFraction: 0.6 }), 180, 'apple-touch-icon.png'); // iOS applies its own mask
  await png(icon({ tile: true, radius: 112, markFraction: 0.6 }), 192, 'icon-192.png');
  await png(icon({ tile: true, radius: 112, markFraction: 0.6 }), 512, 'icon-512.png');
  await png(icon({ tile: true, radius: 0, markFraction: 0.52 }), 512, 'icon-maskable-512.png');
  await png(read('brand/greenmiles-logo.svg'), 1200, 'brand/greenmiles-logo.png');
  await png(read('brand/greenmiles-logo-white.svg'), 1200, 'brand/greenmiles-logo-white.png');
  await png(read('brand/greenmiles-mark.svg'), 512, 'brand/greenmiles-mark.png');

  // Open Graph / social card 1200x630
  const logo = read('brand/greenmiles-logo.svg');
  const inner = logo.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title[^>]*>.*?<\/title>/, '');
  const logoVb = vb(fullB).split(' ').map(Number);
  const lw = 760;
  const lh = (lw * logoVb[3]) / logoVb[2];
  const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3faee"/><stop offset="1" stop-color="#e8f4fb"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <svg x="${(1200 - lw) / 2}" y="${(630 - lh) / 2 - 36}" width="${lw}" height="${lh}" viewBox="${vb(fullB)}">${inner}</svg>
  <text x="600" y="${(630 + lh) / 2 + 36}" text-anchor="middle" font-family="system-ui, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="34" fill="#4a4a50" letter-spacing="0.5">Explore Kerala, the green way</text>
</svg>`;
  await png(og, 1200, 'og-image.png', { background: '#ffffff' });
  await browser.close();

  // favicon.ico (16/32/48) via ImageMagick
  execFileSync('convert', [
    join(pub, 'favicon-16x16.png'),
    join(pub, 'favicon-32x32.png'),
    join(pub, 'favicon-48x48.png'),
    join(pub, 'favicon.ico'),
  ]);
  console.log('PNG, ICO and og-image written.');
}
