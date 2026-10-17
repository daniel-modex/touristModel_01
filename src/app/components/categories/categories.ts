import { AfterViewInit, Component, ElementRef, HostListener, computed, signal, viewChild } from '@angular/core';
import { CATEGORIES } from '../../data/categories';
import { RevealDirective } from '../../directives/reveal.directive';

/** "Top categories": icon tabs that filter the places shown beneath them. */
@Component({
  selector: 'app-categories',
  imports: [RevealDirective],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements AfterViewInit {
  protected readonly categories = CATEGORIES;
  protected readonly selectedId = signal(CATEGORIES[0].id);
  protected readonly selected = computed(() => CATEGORIES.find((c) => c.id === this.selectedId()) ?? CATEGORIES[0]);
  protected readonly canScrollPrev = signal(false);
  protected readonly canScrollNext = signal(false);
  private readonly rail = viewChild.required<ElementRef<HTMLElement>>('rail');

  protected select(id: string, scrollIntoView = false): void {
    this.selectedId.set(id);
    if (scrollIntoView) {
      document.getElementById('tab-' + id)?.scrollIntoView({
        inline: 'center',
        block: 'nearest',
        behavior: this.reduceMotion() ? 'auto' : 'smooth',
      });
    }
  }

  /** Arrow keys / Home / End move between tabs (roving tabindex). */
  protected onKey(event: KeyboardEvent): void {
    const ids = this.categories.map((c) => c.id);
    const i = ids.indexOf(this.selectedId());
    let next = -1;
    if (event.key === 'ArrowRight') next = (i + 1) % ids.length;
    else if (event.key === 'ArrowLeft') next = (i - 1 + ids.length) % ids.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = ids.length - 1;
    if (next < 0) return;
    event.preventDefault();
    this.select(ids[next], true);
    document.getElementById('tab-' + ids[next])?.focus({ preventScroll: true });
  }

  protected scrollBy(direction: 1 | -1): void {
    const el = this.rail().nativeElement;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: this.reduceMotion() ? 'auto' : 'smooth' });
  }

  ngAfterViewInit(): void {
    this.updateEdges();
  }

  @HostListener('window:resize')
  protected updateEdges(): void {
    const el = this.rail().nativeElement;
    this.canScrollPrev.set(el.scrollLeft > 4);
    this.canScrollNext.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  private reduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
