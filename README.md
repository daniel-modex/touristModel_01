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
| Hero with looping Kerala video, nav, search pill, stat cards | `components/hero`, `components/header` |
| "Kerala tourism" destination mosaic | `components/destinations` |
| "One click for you" steps | `components/how-it-works` |
| "Our tourist destination" packages | `components/packages` |
| Testimonial carousel | `components/testimonials` |
| "Our travel memories" blog | `components/blog` |
| Footer + newsletter | `components/footer` |

Content lives in `src/app/data/content.ts`.

## Animations / events (taken from the reference screen recording)

- **Hero intro** – nav slides down, poster slowly zooms, headline → subtitle → search pill rise in with blur-to-sharp, stat cards pop up overlapping the hero edge.
- **Hero video** – autoplaying muted loop that cross-fades in over the poster once it starts playing.
- **Stat counters** – count up when scrolled into view (`CountUpDirective`).
- **Scroll reveal** – every section heading / card blurs-in, fades and rises, staggered (`RevealDirective`, IntersectionObserver; respects `prefers-reduced-motion`).
- **How it works** – steps auto-highlight one after another on a white card (click to jump).
- **Hover states** – image zoom on destination/package/blog cards, card lift, button lift.
- **Testimonial** – prev/next arrows swap the quote with a blur transition.
- **Search form, language toggle, mobile menu, newsletter submit** are interactive.

## Media

All photos/video are from Wikimedia Commons – see [CREDITS.md](CREDITS.md) (also linked in the footer).
