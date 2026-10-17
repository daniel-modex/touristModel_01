import { Component, computed, signal } from '@angular/core';
import { TESTIMONIALS } from '../../data/content';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-testimonials',
  imports: [RevealDirective],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
})
export class Testimonials {
  private readonly all = TESTIMONIALS;
  protected readonly total = TESTIMONIALS.length;
  protected readonly index = signal(0);
  protected readonly current = computed(() => this.all[this.index()]);
  protected readonly initials = computed(() =>
    this.current()
      .name.split(' ')
      .map((w) => w[0])
      .join(''),
  );

  protected step(dir: 1 | -1): void {
    this.index.update((i) => (i + dir + this.all.length) % this.all.length);
  }
}
