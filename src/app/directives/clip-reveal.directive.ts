import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';
import { Motion } from '../motion/motion.service';

/**
 * Scroll-scrubbed clip-path reveal: the element opens from a rounded inset window to full size
 * as it scrolls up into view (the reference does this for its team photos).
 */
@Directive({ selector: '[appClipReveal]' })
export class ClipRevealDirective implements AfterViewInit, OnDestroy {
  private readonly motion = inject(Motion);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private tween?: { kill(): void; scrollTrigger?: { kill(): void } | null };

  ngAfterViewInit(): void {
    if (this.motion.reduced) return;
    const { gsap } = this.motion;
    this.zone.runOutsideAngular(() => {
      this.tween = gsap.fromTo(
        this.el,
        { clipPath: 'inset(14% 12% 14% 12% round 28px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 18px)',
          ease: 'none',
          scrollTrigger: { trigger: this.el, start: 'top 100%', end: 'top 40%', scrub: true },
        },
      );
    });
  }

  ngOnDestroy(): void {
    this.tween?.scrollTrigger?.kill();
    this.tween?.kill();
    this.el.style.clipPath = '';
  }
}
