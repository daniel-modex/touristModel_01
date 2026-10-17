# Design review: Greenmiles

Reviewed with the `apple-design`, `apple-design-motion` and `liquid-glass-ref` skills (installed in `.claude/skills/`).
Scope: a web app, so the Apple principles and foundations apply (accessibility, color, typography, layout, writing, materials, motion), not Apple's platform-specific components.

## Summary

Before: **Critical issues**. A faithful visual copy of the reference, but the type was 8–9.5 px, secondary text failed contrast, controls were 22–36 px tall, there was no focus styling, no reduced-motion handling for the video or the step cycle, and the navigation scrolled away and linked nowhere.
After: **Good**. All Critical items are fixed. The design's thesis is "drone-over-the-canopy video, one glass control layer floating over it"; glass now lives only on the functional layer.

## Critical (all fixed)

| What | Why (source) | Fix |
|---|---|---|
| Text 7.5–9.5 px across stat labels, chips, dates, footer, steps, copyright | `typography.md`: default 17 pt, minimum 11 pt | Floor of 12–13 px, body 15–16 px, all in `rem` so it follows the user's text size |
| Muted text `#8c8c92` = **3.15:1** on the page; inactive steps 1.6–3.0:1 | `color.md` / `accessibility.md`: 4.5:1 for small text | `--muted` = `#5f5f66` (5.9:1); inactive steps keep full-contrast body text, only the title recedes |
| Controls 22–36 px (language toggle, arrows, social icons, form fields, Submit) | `accessibility.md`: 44×44 pt default | 44 px on primary controls (36 px segmented language toggle) |
| No visible keyboard focus | `accessibility.md` | Global `:focus-visible` ring; "Skip to content" link |
| Hero video ignored Reduce Motion; steps auto-cycled forever | `motion.md`, `accessibility.md` | Reduce Motion: video stays on its first frame, no step cycle, reveals become a short cross-fade. Step cycle also pauses on hover/focus |
| Nav links were `href="#"` (jumped to top) | `writing.md` / familiarity | Real section anchors, smooth scroll (instant under Reduce Motion), `aria-current` for the section in view |

## Improvements

- **High: Liquid Glass layer discipline** (`liquid-glass.md`). Glass only on the floating functional layer: nav capsule, language toggle, menu sheet, hero search pill, "Plan Your Trip" control. Removed glass-like treatment from content (package chips now a plain dark scrim; the fake search bar drawn inside the "How it works" photo was a non-functional control and is replaced by a real one).
- **High: variant fit.** Clear glass over the video with the ~35 % dark dimming layer folded into the fill (the nav was unreadable over the bright sky frames otherwise). Regular glass once the header floats over light content, with a scroll-edge fade instead of a solid bar.
- **High: accessibility states for glass.** `prefers-reduced-transparency` and `prefers-contrast: more` fall back to opaque surfaces; browsers without `backdrop-filter` get a solid fill.
- **High: light and dark** follow the system (`prefers-color-scheme`), semantic tokens only, no in-app switch (`dark-mode.md`).
- **Medium: motion** (`apple-design-motion` quick reference). Press feedback on pointer-down on every button (scale 0.95–0.97 with a spring-like `linear()` easing), shorter reveals (0.6–0.7 s, 8 px blur), no blur filter on the glass search pill (it breaks the backdrop).
- **Medium: typography.** Tracking tightens with size (display −0.03em, section titles −0.02em, small text +0.01em), leading tight on headings and 1.5–1.7 on body, tabular figures on prices and counters.
- **Medium: writing.** Action-named, title-style buttons: "Log In", "Search Trips", "View All Packages", "Read More Stories", "Subscribe" (was "Login", "Search", "View more", "Submit"). Footer headings are `h3` (no skipped levels); newsletter has validation and a live status message; testimonial has "1 / 3" and an `aria-live` region; the decorative video is `aria-hidden`.

## Craft notes

- **Point of view:** the aerial canopy video plus a single glass layer. Everything else is quiet.
- **Template risk (Medium, left as is):** the hero's "big number over a small label" stat row is a known generic pattern, kept because it is part of the reference design. The numbers (10M+ customers, 12K destinations, 5.0 rating) are placeholders and should be replaced with real figures or removed before launch (`design-principles.md › Responsibility`).
- **Type (left as is):** Plus Jakarta Sans for display and body, with system fonts as fallback. The skill prefers the system font for controls; kept for brand continuity with the reference.

## What works

- The video is the only thing painted behind the hero; nothing sits over it except controls.
- One filled primary action per view (Log In, Search Trips, the section's "View All…").
- Content is never glass: cards, images and text sit on opaque surfaces.

## Not done / needs a decision

- Munnar package photo is foggy and low-contrast against its caption. Swap the image.
- Destination captions on small cards overlay busy photos; the scrim was strengthened but a per-image check is worth doing.
