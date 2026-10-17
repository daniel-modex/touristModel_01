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
| **Loader** | Two stacked copies of the logo (50 % opacity back, white front). Each slides up out of an `overflow:hidden` mask with a stagger; the front copy's `clip-path` polygon sweeps open as "progress" runs. A film-grain SVG layer sits on a navy gradient. On completion the logo scales down and lifts away while the navy panel moves up, uncovering the hero (a clone of the hero text eases in with scale 1.3→1). | `components/loader`: no panel and no flat colour. The hero video itself is the backdrop, under a very strong `backdrop-filter` blur with a faint green tint and grain. The logo is drawn as **Liquid Glass directly on the page** (refraction layer masked to the letter shapes, gradient body, bright rim, inner highlights, moving sheen; nothing around it) and fills in left to right as loading progresses (waits for the hero's first frame, 4.5 s timeout). Then the logo rises away while the blur clears progressively over 2.4 s (`sine.inOut`) and the hero picture settles from 1.14× to 1× in lockstep. The footage is held on frame 0 and starts only once the loader is gone. Skipped under Reduce Motion. |
| **Hero exit on scroll** | A `.backdrop` layer's `backdrop-filter: blur()` is scrubbed 0 → 16 rem while the background scales to 1.02 and the headline fades up and shrinks. | `Hero.setupScrollBlur`: blur 0 → 22 px (set to `none` at 0 so the resting video is never touched), scrim fade, video scale 1.08, copy/stats drift up. Trigger is the whole intro scene. |
| **Hero stays as the background** | Sections that follow have transparent backgrounds over the blurred hero. | `app-intro`: the hero is `position: sticky`; the story scrolls over it. No pin-spacers, just CSS sticky + ScrollTrigger scrub. |
| **Flying photo stack** | Gallery cards start as a tilted pile (random x/rotation), then scrub to their final grid positions; text lines fade in/out one at a time on a scrubbed timeline. | `components/story`: six Kerala photos fly from a pile to their places, three statement lines play in sequence, everything fades before the next section slides over. Phones use four smaller cards. |
| **Background colour changes** | Dark blurred hero → cream (map) → light blue → dark photo sections, each section overlapping the last. | Hero/story (dark blur) → categories (rounded top edge overlapping) → warm sand map section → page colour → dark journeys frame → footer. |
| **Island map** | Faint map image scales 1.4→1 and fades in (scrub); destination list items and map markers share an `active` index on hover. | `components/kerala-map`: **real Kerala geography** (14 district polygons, see below), districts draw themselves, map eases in from 1.35×, pins pop in; hovering/focusing a place (list or map) highlights its district and shows a glass label + detail card. |
| **Tabbed feature section** (Cabins / Dining …) | Full-bleed backgrounds cross-fade, numbered tabs with progress lines. | `components/journeys`: three signature journeys with cross-fading backgrounds + slow zoom, a sticky stage on a tall scroll track, so scrolling moves between journeys (ScrollTrigger writes the active index; the active tab's line is lit solid white; tabs and arrow keys scroll to a journey), glass booking card, rupee prices. |
| **ParallaxImage** | Image is 120 % tall and translates/scales against the frame as it crosses the viewport. | `appParallax` directive (blog, how-it-works). |
| **Clip-path image reveal** | `clipPath: inset(14% 37% … round 8rem)` → full, scrubbed. | `appClipReveal` directive; the journeys frame uses the same curtain, scrubbed in the component. |
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

## Loader implementation notes

- **Scroll lock without layout shift.** The loader blocks wheel / touch / keyboard scrolling with listeners instead of
  `overflow: hidden`. Hiding overflow removes the desktop scrollbar and giving it back later narrows the page by ~15 px,
  which re-lays-out the hero and made the video visibly snap into place just as it started.
- **Backdrop roots.** `backdrop-filter` only sees what is behind it up to the nearest "backdrop root"
  (an ancestor with `opacity < 1`, `filter`, `clip-path`, `mask` or `will-change` for those). The glass logo's clip-path /
  mask are therefore applied to the glass elements themselves, never to an ancestor.
- **Hero zoom** is applied from the first paint (hidden under the blur) so the picture only ever moves one way.

## Hero timeline (staged on the footage's own clock)

| When | What |
|---|---|
| Loader unblur starts | Header (logo, links, language, Log In) eases in first (+0.45 s). |
| a beat later | The stats row at the bottom follows (staggered, +1.3 s). Both are done before the loader is gone. |
| Footage starts (loader gone) | Footage plays from 0:00 on a picture that has already settled; nothing else moves. |
| **5 s** into the footage | Headline, subtitle and search begin (read from the video's clock, not a timer). |
| **duration − 1 s** (≈ 8 s of 9.03 s) | They finish: the window is computed from the real clip length (`--copy-t`). |
| footage ends | The last frame fades in a soft vignette and the picture pushes slowly inward (1× → 1.075×, `power3.out` over 4.2 s) so it eases smoothly to a stop. |

If autoplay is blocked the content still appears (4 s after the 5 s mark); under Reduce Motion everything is shown immediately.
