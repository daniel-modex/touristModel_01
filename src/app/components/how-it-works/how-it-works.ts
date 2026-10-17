import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { STEPS } from '../../data/content';
import { RevealDirective } from '../../directives/reveal.directive';
import { SplitDirective } from '../../directives/split.directive';

@Component({
  selector: 'app-how-it-works',
  imports: [RevealDirective, SplitDirective],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.scss',
})
export class HowItWorks implements OnInit {
  protected readonly steps = STEPS;
  protected readonly active = signal(0);
  private readonly destroyRef = inject(DestroyRef);
  private timer?: ReturnType<typeof setInterval>;

  private paused = false;
  private readonly reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ngOnInit(): void {
    this.startCycle();
    this.destroyRef.onDestroy(() => clearInterval(this.timer));
  }

  /**
   * Steps highlight one after another, like the reference recording. The cycle
   * pauses while the section is hovered or focused, and never runs under Reduce Motion.
   */
  private startCycle(): void {
    clearInterval(this.timer);
    if (this.reduceMotion) return;
    this.timer = setInterval(() => {
      if (!this.paused) this.active.update((i) => (i + 1) % this.steps.length);
    }, 3600);
  }

  protected pause(): void {
    this.paused = true;
  }

  protected resume(): void {
    this.paused = false;
  }

  protected select(i: number): void {
    this.active.set(i);
    this.startCycle();
  }
}
