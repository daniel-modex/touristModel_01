import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, computed, inject, signal } from '@angular/core';
import { PACKAGES } from '../../data/content';
import { Motion } from '../../motion/motion.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { SplitDirective } from '../../directives/split.directive';

/**
 * "Signature journeys": the reference's tabbed feature section (Cabins / Dining / Activities)
 * reimagined for tour packages. The section is a tall scroll track with a sticky Liquid Glass stage:
 * scrolling through it moves from one journey to the next (background cross-fades, the card and
 * booking panel swap), and each tab's progress line shows how far through its stretch you are.
 * Tabs and arrow keys scroll to a journey, so mouse, keyboard and scroll stay in step. The frame
 * opens like a curtain as the section arrives.
 */
@Component({
  selector: 'app-journeys',
  imports: [RevealDirective, SplitDirective],
  templateUrl: './journeys.html',
  styleUrl: './journeys.scss',
  host: { '[class.static]': 'motion.reduced', '[style.--n]': 'items.length' },
})
export class Journeys implements AfterViewInit, OnDestroy {
  protected readonly motion = inject(Motion);
  private readonly zone = inject(NgZone);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private triggers: { kill(): void }[] = [];
  private tween?: { kill(): void; scrollTrigger?: { kill(): void } | null };

  protected readonly items = PACKAGES;
  protected readonly index = signal(0);
  protected readonly current = computed(() => this.items[this.index()]);

  ngAfterViewInit(): void {
    if (this.motion.reduced) return;
    this.zone.runOutsideAngular(() => this.build());
  }

  ngOnDestroy(): void {
    this.triggers.forEach((t) => t.kill());
    this.tween?.scrollTrigger?.kill();
    this.tween?.kill();
    this.host.querySelector<HTMLElement>('.stage')?.style.removeProperty('clip-path');
  }

  private build(): void {
    const { gsap, ScrollTrigger } = this.motion;
    const track = this.host.querySelector<HTMLElement>('.journeys')!;
    const stage = this.host.querySelector<HTMLElement>('.stage')!;
    const n = this.items.length;

    // curtain: the photo frame opens from an inset window while the section scrolls into place
    this.tween = gsap.fromTo(
      stage,
      { clipPath: 'inset(14% 12% 14% 12% round 28px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 18px)',
        ease: 'none',
        scrollTrigger: { trigger: track, start: 'top 100%', end: 'top top', scrub: true },
      },
    );

    // scroll position -> active journey + progress through its stretch (written straight to a CSS variable)
    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = Math.min(0.9999, Math.max(0, self.progress)) * n;
        const i = Math.floor(p);
        stage.style.setProperty('--seg', (p - i).toFixed(4));
        if (i !== this.index()) this.zone.run(() => this.index.set(i));
      },
    });
    this.triggers.push(st);
  }

  /** scroll to the middle of journey i's stretch (the same spot a reader would land on while scrolling) */
  protected select(i: number): void {
    if (this.motion.reduced) {
      this.index.set(i);
      return;
    }
    const track = this.host.querySelector<HTMLElement>('.journeys')!;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const range = track.offsetHeight - window.innerHeight;
    this.motion.scrollTo(top + (range * (i + 0.5)) / this.items.length);
  }

  protected pad(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  protected onKey(event: KeyboardEvent): void {
    const n = this.items.length;
    let to = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') to = Math.min(n - 1, this.index() + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') to = Math.max(0, this.index() - 1);
    if (to < 0) return;
    event.preventDefault();
    this.select(to);
    document.getElementById('journey-tab-' + to)?.focus();
  }
}
