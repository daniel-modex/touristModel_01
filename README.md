# Greenmiles – Kerala travel & tourism website (Angular)

A single-page travel site modelled on a supplied travel-site design, re-themed for **Kerala**
(Munnar, Kovalam, Varkala, Fort Kochi, Athirappilly, Alleppey…). Built with Angular 21
(standalone components, signals, no UI library).

## Run

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build → dist/greenmiles
```

## Structure

| Section (top → bottom) | Component |
|---|---|
| Page-load loader (logo sweep) | `components/loader` |
| Hero (sticky, blurs on scroll) + story (photo stack + statements) as one scene | `components/intro`, `components/hero`, `components/story` |
| Floating glass header | `components/header` |
| "Top categories" icon tabs + category results (10 categories × 3 places) | `components/categories`, data in `data/categories.ts` |
| "Kerala, mapped": real district map, pins at true coordinates | `components/kerala-map`, data in `data/kerala-map.ts` |
| "One click for you" steps | `components/how-it-works` |
| "Signature journeys": immersive tabbed packages (₹) | `components/journeys` |
| Testimonial carousel | `components/testimonials` |
| "Our travel memories" blog | `components/blog` |
| Footer + newsletter | `components/footer` |

Content lives in `src/app/data/content.ts`.

## Animations / events (taken from the reference screen recording)

- **Hero intro** – nav slides down, poster slowly zooms, headline → subtitle → search pill rise in with blur-to-sharp, stat cards pop up overlapping the hero edge.
- **Hero video** – muted autoplay that plays once and holds on its last frame (no loop); the headline and search pill rise in once it is under way.
- **Stat counters** – count up when scrolled into view (`CountUpDirective`).
- **Scroll reveal** – every section heading / card blurs-in, fades and rises, staggered (`RevealDirective`, IntersectionObserver; respects `prefers-reduced-motion`).
- **How it works** – steps auto-highlight one after another on a white card (click to jump).
- **Hover states** – image zoom on destination/package/blog cards, card lift, button lift.
- **Testimonial** – prev/next arrows swap the quote with a blur transition.
- **Search form, language toggle, mobile menu, newsletter submit** are interactive.

## Media

All photos/video are from Wikimedia Commons – see [CREDITS.md](CREDITS.md) (also linked in the footer).

## Design system

The UI follows Apple's Human Interface Guidelines and Liquid Glass (see [docs/design-review.md](docs/design-review.md)):
glass only on the floating controls layer (nav, search, menu sheet), opaque content, 44 px targets, `rem` type,
light/dark that follows the system with an icon-only glass toggle (bottom right, choice saved), and Reduce Motion / Reduce Transparency / Increase Contrast fallbacks.
Claude Code skills used for the review live in `.claude/skills/` (`apple-design`, `apple-design-motion`, `liquid-glass-ref`, `liquid-glass`).

## Brand

The Greenmiles logo comes from `brand/source/greenmiles_logo_6.pdf` (outlined vector, colours
`#68B42C` green and `#008BD2` blue). Everything below is generated from the PDF's own paths, nothing is re-traced:

| Asset | Where |
|---|---|
| Logo, wordmark, mark in colour / white / black (SVG) | `public/brand/greenmiles-*.svg` |
| Logo & mark PNGs (transparent) | `public/brand/greenmiles-*.png` |
| App icon, maskable icon, Safari pinned tab (SVG) | `public/brand/` |
| Favicon (SVG, ICO 16/32/48, PNG 16/32), Apple touch icon, PWA icons 192/512 + maskable | `public/` |
| Social card 1200×630 | `public/og-image.png` |
| Web manifest | `public/site.webmanifest` |
| Angular component `<app-logo variant="full|wordmark|mark" [mono]="true">` | `src/app/components/logo` (paths in `src/app/data/logo-paths.ts`) |

Regenerate with `npm run brand` (SVGs, manifest, Angular data) or `npm run brand:png` (also PNG/ICO/og-image;
needs Playwright with Chromium and ImageMagick; set `PLAYWRIGHT_PATH` / `CHROMIUM_PATH` if they are not on the default path).

## Scrollbar

The browser's scrollbar is hidden and replaced by `src/app/components/scrollbar`: a slim glass rail with a draggable pill and a
checkpoint for each section (hover / focus for its name, click or Enter to glide there, click the rail to jump). Native wheel, touch
and keyboard scrolling are untouched.

## Motion

Smooth scrolling and scroll-driven animation use **Lenis** + **GSAP** (ScrollTrigger, SplitText), the same stack as the
reference site that inspired them; see [docs/kudanil-analysis.md](docs/kudanil-analysis.md) for the study and how each
technique was adapted. Shared code: `src/app/motion/motion.service.ts` (engine, scroll lock, smooth `scrollTo`) and the
directives `appSplit`, `appParallax`, `appClipReveal` in `src/app/directives`. Everything honours **Reduce Motion**.
GSAP is used under its [standard "no charge" licence](https://gsap.com/standard-license); Lenis is MIT.

`npm run map` regenerates the Kerala map data from `data-src/kerala-districts.geojson`.
