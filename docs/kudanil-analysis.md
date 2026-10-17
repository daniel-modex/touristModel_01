# Motion analysis: kudanil.com → Greenmiles

Studied on 17 Oct 2026 by reading the page's HTML/CSS, its custom bundle (`kunadil-bp.netlify.app/index.js`)
and recording the live page (loader frames and a full scroll-through). Nothing was copied: the structure,
copy, imagery and data are Greenmiles' own and Kerala-specific. Only the *techniques* were borrowed.

## Stack they use

Webflow (layout) + **Lenis** (smooth scroll) + **GSAP 3** with **ScrollTrigger** and **SplitText**, **Swiper** for
carousels, **Barba** for page transitions. Lenis is driven from `gsap.ticker` and feeds `ScrollTrigger.update`,
so every scroll animation is scrubbed against the smoothed scroll position.

## Techniques, and how Greenmiles uses them

| Technique (reference) | How it works there | Greenmiles |
|---|---|---|
| **Loader** | Two stacked copies of the logo (50 % opacity back, white front). Each slides up out of an `overflow:hidden` mask with a stagger; the front copy's `clip-path` polygon sweeps open as "progress" runs. A film-grain SVG layer sits on a navy gradient. On completion the logo scales down and lifts away while the navy panel moves up, uncovering the hero (a clone of the hero text eases in with scale 1.3→1). | `components/loader`: same layering and sweep; the sweep creeps to 85 % then finishes when the hero video's first frame is ready (4.5 s timeout). Logo lifts, the panel rolls up, then the hero picture settles from a 1.18× zoom and the text enters. Skipped under Reduce Motion. |
| **Hero exit on scroll** | A `.backdrop` layer's `backdrop-filter: blur()` is scrubbed 0 → 16 rem while the background scales to 1.02 and the headline fades up and shrinks. | `Hero.setupScrollBlur`: blur 0 → 22 px (set to `none` at 0 so the resting video is never touched), scrim fade, video scale 1.08, copy/stats drift up. Trigger is the whole intro scene. |
| **Hero stays as the background** | Sections that follow have transparent backgrounds over the blurred hero. | `app-intro`: the hero is `position: sticky`; the story scrolls over it. No pin-spacers, just CSS sticky + ScrollTrigger scrub. |
| **Flying photo stack** | Gallery cards start as a tilted pile (random x/rotation), then scrub to their final grid positions; text lines fade in/out one at a time on a scrubbed timeline. | `components/story`: six Kerala photos fly from a pile to their places, three statement lines play in sequence, everything fades before the next section slides over. Phones use four smaller cards. |
| **Background colour changes** | Dark blurred hero → cream (map) → light blue → dark photo sections, each section overlapping the last. | Hero/story (dark blur) → categories (rounded top edge overlapping) → warm sand map section → page colour → dark journeys frame → footer. |
| **Island map** | Faint map image scales 1.4→1 and fades in (scrub); destination list items and map markers share an `active` index on hover. | `components/kerala-map`: **real Kerala geography** (14 district polygons, see below), districts draw themselves, map eases in from 1.35×, pins pop in; hovering/focusing a place (list or map) highlights its district and shows a glass label + detail card. |
| **Tabbed feature section** (Cabins / Dining …) | Full-bleed backgrounds cross-fade, numbered tabs with progress lines. | `components/journeys`: three signature journeys with cross-fading backgrounds + slow zoom, numbered tabs whose progress line *is* the autoplay clock (pure CSS `animationend`, pauses on hover/focus), glass booking card, rupee prices. |
| **ParallaxImage** | Image is 120 % tall and translates/scales against the frame as it crosses the viewport. | `appParallax` directive (blog, how-it-works). |
| **Clip-path image reveal** | `clipPath: inset(14% 37% … round 8rem)` → full, scrubbed. | `appClipReveal` directive (journeys frame opens like a curtain). |
| **Text line reveal** | `SplitText` lines with `mask: "lines"`, words slide up. | `appSplit` directive on headings and the testimonial quote. |
| **Footer** | `mask-size` circle reveal, marquee, big call to action. | Circular `clip-path` reveal from the bottom edge, destination marquee (outlined type), big "Embark on your Kerala journey" call to action. |
| **Header** | Hides on scroll down, returns on scroll up, changes mode (`on-light/on-dark`). | Same hide/show; switches between white one-colour logo + clear glass (over the hero/story) and colour logo + regular glass (over content). |

## Things deliberately **not** copied

- Barba page transitions (single page here), the custom "Drag" cursor, Swiper carousels.
- Their copy, photography, island data, and section order.

## Greenmiles rules that still apply on top

Apple HIG + Liquid Glass (glass only on the floating functional layer: header, search, map card, booking card),
44 px targets, AA contrast, light/dark, and **Reduce Motion**: no loader, no smooth scroll, no scrubbing/pinning,
the story becomes a static grid, the hero video stays on its first frame.

## Kerala map data

`data-src/kerala-districts.geojson` is the 14 Kerala district boundaries from
[udit-001/india-maps-data](https://github.com/udit-001/india-maps-data) (Census of India 2011 boundaries; the repository
states no licence, so it is credited rather than re-licensed). `scripts/build-kerala-map.mjs` projects it
(equirectangular, longitude scaled by cos(mid-latitude)) together with the destination coordinates into
`src/app/data/kerala-map.ts`. Pins are placed at real latitude/longitude, e.g. Munnar 10.0889 N 77.0595 E.
Figures shown: 14 districts, 44 rivers, 590 km of coastline (Government of Kerala figures). "Best time"
windows are typical visiting seasons, not forecasts.
