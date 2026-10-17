import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject, input } from '@angular/core';
import { Motion } from '../motion/motion.service';

/**
 * Masked line reveal (GSAP SplitText): each line of the text slides up out of its own mask when
 * the element scrolls into view. Re-splits automatically on resize / font load.
 * Under Reduce Motion the text is simply shown.
 */
@Directive({ selector: '[appSplit]', host: { '[class.split-pending]': '!motion.reduced' } })
export class SplitDirective implements AfterViewInit, OnDestroy {
  /** stagger start delay in seconds */
  readonly delay = input(0, { alias: 'appSplit', transform: (v: number | string) => Number(v) || 0 });
  protected readonly motion = inject(Motion);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private split?: { revert: () => void };

  ngAfterViewInit(): void {
    if (this.motion.reduced) return;
    const { gsap, SplitText } = this.motion;
    this.zone.runOutsideAngular(() => {
      const run = () => {
        this.split = SplitText.create(this.el, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          linesClass: 'split-line',
          onSplit: (self) => {
            this.el.classList.remove('split-pending');
            gsap.set(self.lines, { yPercent: 115 });
            return gsap.to(self.lines, {
              yPercent: 0,
              duration: 1.1,
              ease: 'power4.out',
              stagger: 0.09,
              delay: this.delay(),
              scrollTrigger: { trigger: this.el, start: 'top 90%', once: true },
            });
          },
        });
      };
      document.fonts?.ready.then(run) ?? run();
    });
  }

  ngOnDestroy(): void {
    this.split?.revert();
  }
}
