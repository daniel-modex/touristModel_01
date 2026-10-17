import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BUDGETS, GUEST_OPTIONS, STEPS } from '../../data/content';
import { Motion } from '../../motion/motion.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { SplitDirective } from '../../directives/split.directive';

@Component({
  selector: 'app-how-it-works',
  imports: [FormsModule, RevealDirective, SplitDirective],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.scss',
})
export class HowItWorks implements AfterViewInit, OnDestroy {
  private readonly motion = inject(Motion);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly steps = STEPS;
  protected date = '';
  protected budget = '';
  protected guests = '';
  protected readonly budgets = BUDGETS;
  protected readonly guestOptions = GUEST_OPTIONS;
  protected readonly active = signal(0);

  private timer?: ReturnType<typeof setTimeout>;
  private observer?: IntersectionObserver;
  private inView = false;
  /** a click takes over: the walk-through stops until the section is entered again */
  private manual = false;
  private readonly reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** one second between highlights */
  private static readonly STEP_MS = 1000;

  ngAfterViewInit(): void {
    if (this.reduceMotion || typeof IntersectionObserver === 'undefined') return;
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === this.inView) return;
        this.inView = entry.isIntersecting;
        if (this.inView) this.play();
        else this.rewind();
      },
      { threshold: 0.5 },
    );
    this.observer.observe(this.host.querySelector('.how')!);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    this.observer?.disconnect();
  }

  /**
   * Walk-through: when the section comes into focus the first step is lit, and after a second the
   * highlight moves to the next one, and so on down to the last, where it stays.
   */
  private play(): void {
    clearTimeout(this.timer);
    this.manual = false;
    this.active.set(0);
    this.schedule();
  }

  private schedule(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.manual || !this.inView) return;
      const next = this.active() + 1;
      if (next >= this.steps.length) return;
      this.active.set(next);
      this.schedule();
    }, HowItWorks.STEP_MS);
  }

  /** leaving the section resets it, so it plays again from the first step on the next visit */
  private rewind(): void {
    clearTimeout(this.timer);
    this.active.set(0);
  }

  protected search(): void {
    this.motion.scrollTo('destinations');
  }

  protected select(i: number): void {
    this.manual = true;
    clearTimeout(this.timer);
    this.active.set(i);
  }
}
