import { Injectable, NgZone, signal } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Shared motion engine: GSAP + ScrollTrigger driven by Lenis smooth scrolling (the same
 * stack used by the reference site), with Reduce Motion respected everywhere.
 * Everything runs outside Angular's zone so scroll animation never triggers change detection.
 */
@Injectable({ providedIn: 'root' })
export class Motion {
  readonly gsap = gsap;
  readonly ScrollTrigger = ScrollTrigger;
  readonly SplitText = SplitText;

  /** User asked for less motion: no smooth scroll, scrubbing, pinning or loader. */
  readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** First hero frame is decodable (the loader waits for it, up to a timeout). */
  readonly heroReady = signal(false);
  /** The loader has lifted and the hero intro should play. */
  readonly introStarted = signal(false);
  /** Loader fully gone. */
  readonly loaderDone = signal(false);

  private lenis?: Lenis;
  private locks = 0;

  constructor(private readonly zone: NgZone) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }

  init(): void {
    if (this.reduced || this.lenis) return;
    this.zone.runOutsideAngular(() => {
      this.lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      this.lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => this.lenis?.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      window.addEventListener('load', () => ScrollTrigger.refresh());
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    });
  }

  /** Freeze scrolling (loader, modals). Calls nest. */
  lock(): void {
    if (this.locks++ > 0) return;
    this.lenis?.stop();
    document.documentElement.classList.add('scroll-locked');
  }

  unlock(): void {
    if (--this.locks > 0) return;
    this.locks = 0;
    this.lenis?.start();
    document.documentElement.classList.remove('scroll-locked');
  }

  /** Smooth-scroll to a section id / element / pixel position. The page's CSS scroll-padding-top (header height) is honoured. */
  scrollTo(target: string | HTMLElement | number, offset = 0): void {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (this.lenis) {
      this.lenis.scrollTo((el as HTMLElement | number) ?? 0, { offset, duration: 1.5 });
    } else if (typeof el === 'number') {
      window.scrollTo({ top: el });
    } else {
      el?.scrollIntoView({ behavior: 'auto' });
    }
  }

  refresh(): void {
    ScrollTrigger.refresh();
  }
}
