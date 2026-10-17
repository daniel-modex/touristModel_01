import { Directive, ElementRef, OnDestroy, OnInit, effect, inject, input } from '@angular/core';
import { Motion } from '../motion/motion.service';

/** Counts the element's number up from 0 when it scrolls into view. */
@Directive({ selector: '[appCountUp]' })
export class CountUpDirective implements OnInit, OnDestroy {
  readonly target = input.required<number>({ alias: 'appCountUp' });
  readonly decimals = input(0);
  readonly pad = input(0);
  readonly suffix = input('');
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(Motion);
  private observer?: IntersectionObserver;
  private frame = 0;
  private started = false;

  constructor() {
    effect(() => {
      if (this.motion.introStarted()) this.watch();
    });
  }

  ngOnInit(): void {
    this.render(0);
  }

  private watch(): void {
    if (this.started) return;
    this.started = true;
    if (typeof IntersectionObserver === 'undefined') {
      this.render(this.target());
      return;
    }
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.observer?.disconnect();
          this.run();
        }
      },
      { threshold: 0.6 },
    );
    this.observer.observe(this.el);
  }

  private run(): void {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return this.render(this.target());
    const start = performance.now();
    const duration = 1600;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      this.render(this.target() * eased);
      if (t < 1) this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  private render(v: number): void {
    const n = v.toFixed(this.decimals());
    this.el.textContent = (this.pad() ? n.padStart(this.pad(), '0') : n) + this.suffix();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
  }
}
