import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

/**
 * Scroll reveal: element starts blurred / translated / transparent and
 * animates in the first time it enters the viewport (see .reveal in styles.scss).
 */
@Directive({
  selector: '[appReveal]',
  host: { class: 'reveal', '[style.--d]': '"" + delay() + "ms"' },
})
export class RevealDirective implements OnInit, OnDestroy {
  /** Stagger delay in ms. */
  readonly delay = input(0, { alias: 'appReveal', transform: (v: number | string) => Number(v) || 0 });
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private observer?: IntersectionObserver;

  ngOnInit(): void {
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
