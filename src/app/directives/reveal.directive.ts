import { Directive, ElementRef, OnDestroy, effect, inject, input } from '@angular/core';
import { Motion } from '../motion/motion.service';

/**
 * Scroll reveal: element starts blurred / translated / transparent and
 * animates in the first time it enters the viewport (see .reveal in styles.scss).
 */
@Directive({
  selector: '[appReveal]',
  host: { class: 'reveal', '[style.--d]': '"" + delay() + "ms"' },
})
export class RevealDirective implements OnDestroy {
  /** Stagger delay in ms. */
  readonly delay = input(0, { alias: 'appReveal', transform: (v: number | string) => Number(v) || 0 });
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(Motion);
  private observer?: IntersectionObserver;
  private started = false;

  constructor() {
    // elements already on screen at load (hero stats) wait for the loader to lift before playing
    effect(() => {
      if (this.motion.introStarted()) this.start();
    });
  }

  private start(): void {
    if (this.started) return;
    this.started = true;
    if (typeof IntersectionObserver === 'undefined') {
      this.el.classList.add('in');
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            this.el.classList.add('in');
            this.observer?.disconnect();
          }
        }
      },
      { threshold: 0.01, rootMargin: '0px 0px -8% 0px' },
    );
    this.observer.observe(this.el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
