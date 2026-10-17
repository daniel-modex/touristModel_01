import { Component, computed, signal } from '@angular/core';
import { PACKAGES } from '../../data/content';
import { ClipRevealDirective } from '../../directives/clip-reveal.directive';
import { RevealDirective } from '../../directives/reveal.directive';
import { SplitDirective } from '../../directives/split.directive';

/**
 * "Signature journeys": the reference's tabbed feature section (Cabins / Dining / Activities)
 * reimagined for tour packages. Full-bleed backgrounds cross-fade with a slow zoom, numbered tabs
 * carry a progress line that drives the autoplay (pure CSS animation, pauses on hover/focus), and
 * a Liquid Glass card holds price and booking. The whole frame opens like a curtain on scroll.
 */
@Component({
  selector: 'app-journeys',
  imports: [ClipRevealDirective, RevealDirective, SplitDirective],
  templateUrl: './journeys.html',
  styleUrl: './journeys.scss',
})
export class Journeys {
  protected readonly items = PACKAGES;
  protected readonly index = signal(0);
  protected readonly current = computed(() => this.items[this.index()]);
  protected readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected select(i: number): void {
    this.index.set(i);
  }

  /** called when the active tab's progress line completes */
  protected next(i: number): void {
    if (i === this.index()) this.index.set((i + 1) % this.items.length);
  }

  protected pad(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  protected onKey(event: KeyboardEvent): void {
    const n = this.items.length;
    let to = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') to = (this.index() + 1) % n;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') to = (this.index() - 1 + n) % n;
    if (to < 0) return;
    event.preventDefault();
    this.select(to);
    document.getElementById('journey-tab-' + to)?.focus();
  }
}
