import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { STEPS } from '../../data/content';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-how-it-works',
  imports: [RevealDirective],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.scss',
})
export class HowItWorks implements OnInit {
  protected readonly steps = STEPS;
  protected readonly active = signal(0);
  private readonly destroyRef = inject(DestroyRef);
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.startCycle();
    this.destroyRef.onDestroy(() => clearInterval(this.timer));
  }

  /** Steps highlight one after another, like the reference recording. */
  private startCycle(): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.active.update((i) => (i + 1) % this.steps.length), 3200);
  }

  protected select(i: number): void {
    this.active.set(i);
    this.startCycle();
  }
}
