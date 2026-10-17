import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { Motion } from '../../motion/motion.service';

interface Checkpoint {
  id: string;
  label: string;
  /** 0..1 position along the scroll range */
  f: number;
}

/** Sections that get a checkpoint, in page order. */
const SECTIONS = [
  { id: 'top', label: 'Start' },
  { id: 'categories', label: 'Top categories' },
  { id: 'destinations', label: 'Kerala, mapped' },
  { id: 'how', label: 'How it works' },
  { id: 'packages', label: 'Signature journeys' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'blog', label: 'Stories' },
  { id: 'contact', label: 'Contact' },
];

/**
 * Slim custom scrollbar replacing the browser's: a thin glass rail on the right edge with a pill that
 * follows the page (and can be dragged), plus a checkpoint for every section. Checkpoints are links:
 * hover or focus one for its name, click to glide there. Wheel / touch / keyboard scrolling is native
 * (only the browser's own bar is hidden), so nothing is lost for assistive technology.
 */
@Component({
  selector: 'app-scrollbar',
  templateUrl: './scrollbar.html',
  styleUrl: './scrollbar.scss',
})
export class Scrollbar implements AfterViewInit, OnDestroy {
  protected readonly motion = inject(Motion);
  private readonly zone = inject(NgZone);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly rail = viewChild.required<ElementRef<HTMLElement>>('rail');
  private readonly thumb = viewChild.required<ElementRef<HTMLElement>>('thumb');

  protected readonly marks = signal<Checkpoint[]>([]);
  protected readonly activeIndex = signal(0);
  protected readonly dragging = signal(false);

  private railH = 1;
  private thumbH = 40;
  private maxScroll = 1;
  private raf = 0;
  private idleTimer?: ReturnType<typeof setTimeout>;
  private ro?: ResizeObserver;
  private drag?: { startY: number; startScroll: number };
  private readonly onScroll = () => this.schedule();
  private readonly onResize = () => this.recalc();
  private readonly onRefresh = () => this.recalc();

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize);
      this.motion.ScrollTrigger.addEventListener('refresh', this.onRefresh);
      // the page grows as images load / sections expand
      this.ro = new ResizeObserver(() => this.recalc());
      this.ro.observe(document.body);
      window.addEventListener('load', this.onResize);
      this.recalc();
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('load', this.onResize);
    this.motion.ScrollTrigger.removeEventListener('refresh', this.onRefresh);
    this.ro?.disconnect();
    cancelAnimationFrame(this.raf);
    clearTimeout(this.idleTimer);
  }

  protected go(id: string): void {
    this.motion.scrollTo(id === 'top' ? 0 : id);
  }

  // ---------- dragging the pill / clicking the rail ----------
  protected onThumbDown(e: PointerEvent): void {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.drag = { startY: e.clientY, startScroll: window.scrollY };
    this.dragging.set(true);
  }

  protected onThumbMove(e: PointerEvent): void {
    if (!this.drag) return;
    const travel = Math.max(1, this.railH - this.thumbH);
    const y = this.drag.startScroll + ((e.clientY - this.drag.startY) * this.maxScroll) / travel;
    this.motion.scrollNow(Math.min(this.maxScroll, Math.max(0, y)));
  }

  protected onThumbUp(): void {
    this.drag = undefined;
    this.dragging.set(false);
  }

  protected onRailDown(e: PointerEvent): void {
    if (e.target !== this.rail().nativeElement) return; // dots and the pill handle themselves
    const r = this.rail().nativeElement.getBoundingClientRect();
    const travel = Math.max(1, this.railH - this.thumbH);
    const p = Math.min(1, Math.max(0, (e.clientY - r.top - this.thumbH / 2) / travel));
    this.motion.scrollTo(p * this.maxScroll);
  }

  // ---------- measuring + painting (outside Angular: no change detection per scroll frame) ----------
  private recalc(): void {
    const rail = this.rail().nativeElement;
    const vh = window.innerHeight;
    const docH = document.documentElement.scrollHeight;
    this.maxScroll = Math.max(1, docH - vh);
    this.railH = Math.max(1, rail.clientHeight);
    this.thumbH = Math.min(this.railH * 0.5, Math.max(40, (this.railH * vh) / docH));
    this.host.style.setProperty('--track', this.railH + 'px');
    this.host.style.setProperty('--th', this.thumbH + 'px');

    const y0 = window.scrollY;
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const marks: Checkpoint[] = [];
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (!el) continue;
      const y = s.id === 'top' ? 0 : el.getBoundingClientRect().top + y0 - pad;
      marks.push({ id: s.id, label: s.label, f: Math.min(1, Math.max(0, y / this.maxScroll)) });
    }
    marks.sort((a, b) => a.f - b.f);
    if (JSON.stringify(marks) !== JSON.stringify(this.marks())) this.zone.run(() => this.marks.set(marks));
    this.paint(true);
  }

  private schedule(): void {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.paint(false);
    });
  }

  private paint(quiet: boolean): void {
    const y = window.scrollY;
    const p = Math.min(1, Math.max(0, y / this.maxScroll));
    this.thumb().nativeElement.style.transform = `translate3d(0, ${(p * (this.railH - this.thumbH)).toFixed(2)}px, 0)`;

    // which checkpoint are we at (the last one at or above 40 % of the viewport)
    const marks = this.marks();
    const probe = y / this.maxScroll + (window.innerHeight * 0.4) / this.maxScroll;
    let idx = 0;
    marks.forEach((m, i) => {
      if (m.f <= probe + 1e-4) idx = i;
    });
    if (idx !== this.activeIndex()) this.zone.run(() => this.activeIndex.set(idx));

    // legible over both the dark hero / footer and the light sections
    const intro = document.getElementById('intro');
    const foot = document.getElementById('contact');
    // on narrow screens the dark journeys photo frame reaches under the rail as well
    const jr = document.getElementById('packages')?.getBoundingClientRect();
    const overJourneys = window.innerWidth <= 1000 && !!jr && jr.top < window.innerHeight * 0.5 && jr.bottom > window.innerHeight * 0.5;
    const dark =
      (!!intro && intro.getBoundingClientRect().bottom > window.innerHeight * 0.5) ||
      (!!foot && foot.getBoundingClientRect().top < window.innerHeight * 0.5) ||
      overJourneys;
    this.host.classList.toggle('on-dark', dark);

    if (!quiet) {
      // wake up while scrolling, settle after a moment
      this.host.classList.add('scrolling');
      clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => this.host.classList.remove('scrolling'), 1600);
    }
  }
}
