# Keralatravi – Kerala travel & tourism website (Angular)

A single-page travel site modelled on the supplied "Indotravi" design, re-themed for **Kerala**
(Munnar, Kovalam, Varkala, Fort Kochi, Athirappilly, Alleppey…). Built with Angular 21
(standalone components, signals, no UI library).

## Run

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build → dist/kerala-travel
```

## Structure

| Section (top → bottom) | Component |
|---|---|
| Hero with Kerala video (plays once), nav, search pill, stat cards | `components/hero`, `components/header` |
| "Kerala tourism" destination mosaic | `components/destinations` |
| "One click for you" steps | `components/how-it-works` |
| "Our tourist destination" packages | `components/packages` |
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
automatic light/dark, and Reduce Motion / Reduce Transparency / Increase Contrast fallbacks.
Claude Code skills used for the review live in `.claude/skills/` (`apple-design`, `apple-design-motion`, `liquid-glass-ref`, `liquid-glass`).
