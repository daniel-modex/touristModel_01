import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject, input } from '@angular/core';
import { Motion } from '../motion/motion.service';

/**
 * Image parallax inside a clipped frame (like the reference's ParallaxImage): the <img> is taller
 * than its frame and drifts + scales gently as the frame crosses the viewport.
 * Put it on the frame element that contains one <img>.
 */
@Directive({ selector: '[appParallax]', host: { class: 'parallax-frame' } })
export class ParallaxDirective implements AfterViewInit, OnDestroy {
  /** how far the image drifts, in % of its own height */
  readonly strength = input(8, { alias: 'appParallax', transform: (v: number | string) => Number(v) || 8 });
  private readonly motion = inject(Motion);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private tween?: { kill(): void; scrollTrigger?: { kill(): void } | null };

  ngAfterViewInit(): void {
    const img = this.el.querySelector('img');
    if (!img || this.motion.reduced) return;
    const { gsap } = this.motion;
    this.zone.runOutsideAngular(() => {
      this.el.classList.add('parallax-on');
      this.tween = gsap.fromTo(
        img,
        { yPercent: -this.strength(), scale: 1.14 },
        {
          yPercent: this.strength(),
          scale: 1.04,
          ease: 'none',
          scrollTrigger: { trigger: this.el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    });
  }

  ngOnDestroy(): void {
    this.tween?.scrollTrigger?.kill();
    this.tween?.kill();
  }
}
