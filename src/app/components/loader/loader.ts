import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { LOGO_LETTERS, LOGO_MARK, LOGO_VIEWBOX } from '../../data/logo-paths';
import { Motion } from '../../motion/motion.service';

/**
 * Page-load intro. The hero video itself is the backdrop: it sits under a very strong blur while the
 * Greenmiles logo, drawn as Liquid Glass straight onto the page (no panel or box around it), loads
 * with a left-to-right sweep. The logo then rises away and the blur clears progressively and smoothly
 * to reveal the hero. The footage starts only once the blur has fully cleared. Skipped under Reduce Motion.
 */
@Component({
  selector: 'app-loader',
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader implements AfterViewInit, OnDestroy {
  protected readonly motion = inject(Motion);
  private readonly zone = inject(NgZone);
  protected readonly done = signal(false);
  private readonly root = viewChild<ElementRef<HTMLElement>>('root');
  private timelines: { kill(): void }[] = [];
  private poll?: ReturnType<typeof setInterval>;

  // logo artwork (generated from the brand PDF)
  protected readonly paths = [...LOGO_LETTERS, ...LOGO_MARK];
  protected readonly viewBox = LOGO_VIEWBOX.full;
  protected readonly vb = LOGO_VIEWBOX.full.split(' ').map(Number) as [number, number, number, number];
  protected readonly ratio = `${this.vb[2]} / ${this.vb[3]}`;
  /** x travel of the moving highlight, in viewBox units */
  protected readonly sheenTravel = Math.round(this.vb[2] + 360);

  ngAfterViewInit(): void {
    if (this.motion.reduced) {
      this.finish();
      return;
    }
    this.motion.lock();
    window.scrollTo(0, 0);
    this.zone.runOutsideAngular(() => this.play());
  }

  private play(): void {
    const host = this.root()?.nativeElement;
    if (!host) return this.finish();
    const { gsap, REVEAL } = this.motion;
    const veil = host.querySelector<HTMLElement>('.veil')!;
    const fronts = Array.from(host.querySelectorAll<HTMLElement | SVGElement>('.front'));
    const layer = host.querySelector('.logo-layer');
    const wrap = host.querySelector('.logo-wrap');

    const MAX_BLUR = 72;
    const s = { sweep: 0, blur: MAX_BLUR, tint: 0.34, grain: 0.14 };
    const paint = () => {
      // logo sweep: the glass fills in left to right
      const p = (s.sweep * 100).toFixed(2);
      const clip = `polygon(0 0, ${p}% 0, ${p}% 100%, 0 100%)`;
      for (const f of fronts) (f as HTMLElement).style.clipPath = clip;
      // backdrop veil: the hero video, very blurred, clearing progressively
      const k = s.blur / MAX_BLUR;
      const f = s.blur > 0.05 ? `blur(${s.blur.toFixed(2)}px) saturate(${(1 + 0.5 * k).toFixed(3)}) brightness(${(1 + 0.4 * k).toFixed(3)})` : 'none';
      veil.style.backdropFilter = f;
      veil.style.setProperty('-webkit-backdrop-filter', f);
      veil.style.setProperty('--tint', s.tint.toFixed(3));
      veil.style.setProperty('--grain', s.grain.toFixed(3));
    };
    paint();
    gsap.set(layer, { yPercent: 108 });

    // part 2: runs once the hero's first frame is ready
    const exit = gsap.timeline({ paused: true, onComplete: () => this.zone.run(() => this.finish()) });
    exit
      .to(s, { sweep: 1, duration: 0.45, ease: 'power2.out', onUpdate: paint })
      .addLabel('lift', '+=0.25')
      // hero entrance (zoom-settle, headline, controls) starts together with the unblur
      .call(() => this.zone.run(() => this.motion.introStarted.set(true)), [], 'lift')
      .to(wrap, { scale: 0.86, yPercent: -170, autoAlpha: 0, duration: 0.95, ease: 'power2.in' }, 'lift')
      .to(s, { blur: 0, tint: 0, grain: 0, duration: REVEAL.duration, ease: REVEAL.ease, onUpdate: paint }, 'lift');

    const start = performance.now();
    const whenReady = () => {
      const ready = this.motion.heroReady();
      const waited = performance.now() - start;
      if ((ready && waited > 900) || waited > 4500) {
        clearInterval(this.poll);
        exit.play();
      }
    };

    // part 1: logo slides up inside its mask, glass fills in; the sweep keeps creeping while we wait
    const enter = gsap.timeline({ onComplete: () => (this.poll = setInterval(whenReady, 80)) });
    enter
      .to(layer, { yPercent: 0, duration: 0.9, ease: 'power3.out' })
      .to(s, { sweep: 0.85, duration: 1.4, ease: 'power2.in', onUpdate: paint }, '-=0.35');
    this.timelines.push(enter, exit);
  }

  private finish(): void {
    clearInterval(this.poll);
    this.done.set(true);
    this.motion.introStarted.set(true);
    this.motion.loaderDone.set(true);
    this.motion.unlock();
    this.motion.refresh();
  }

  ngOnDestroy(): void {
    clearInterval(this.poll);
    this.timelines.forEach((t) => t.kill());
  }
}
