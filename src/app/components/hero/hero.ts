import { AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { STATS } from '../../data/content';
import { CountUpDirective } from '../../directives/count-up.directive';
import { RevealDirective } from '../../directives/reveal.directive';
import { Motion } from '../../motion/motion.service';

@Component({
  selector: 'app-hero',
  imports: [FormsModule, CountUpDirective, RevealDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements AfterViewInit, OnDestroy {
  protected readonly motion = inject(Motion);
  private readonly zone = inject(NgZone);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly video = viewChild.required<ElementRef<HTMLVideoElement>>('heroVideo');
  private scrub?: { scrollTrigger?: { kill(): void } | null; kill(): void };
  private entered = false;
  protected readonly stats = STATS;
  protected readonly textReady = signal(false);
  private finished = false;
  protected date = '';
  protected budget = '';
  protected guests = '';
  protected readonly budgets = ['Under ₹20,000', '₹20,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000+'];
  protected readonly guestOptions = ['1 Guest', '2 Guests', '3 – 5 Guests', '6+ Guests'];

  constructor() {
    // The loader lifts -> headline, search and stats play their entrance, and the picture settles.
    effect(() => {
      if (!this.motion.introStarted()) return;
      this.textReady.set(true);
      this.playEntrance();
    });
  }

  ngAfterViewInit(): void {
    this.tryPlay();
    if (!this.motion.reduced) this.zone.runOutsideAngular(() => this.setupScrollBlur());
  }

  ngOnDestroy(): void {
    this.scrub?.scrollTrigger?.kill();
    this.scrub?.kill();
  }

  /** Picture settles from a slight zoom as the loader rolls away. */
  private playEntrance(): void {
    if (this.entered || this.motion.reduced) return;
    this.entered = true;
    this.zone.runOutsideAngular(() => {
      const media = this.host.querySelector('.media');
      this.motion.gsap.fromTo(
        media,
        { scale: 1.18 },
        { scale: 1, duration: 2.8, ease: 'power3.out', clearProps: 'transform' },
      );
    });
  }

  /**
   * Scroll-scrubbed hero exit (as in the reference): the picture blurs behind glass, scales a touch,
   * and the headline / search / stats drift up and fade, while the story slides over it.
   */
  private setupScrollBlur(): void {
    const { gsap } = this.motion;
    const q = (s: string) => this.host.querySelector<HTMLElement>(s)!;
    const backdrop = q('.backdrop');
    const blur = { v: 0 };
    const apply = () => {
      const f = blur.v > 0.05 ? `blur(${blur.v.toFixed(2)}px)` : 'none';
      backdrop.style.backdropFilter = f;
      backdrop.style.setProperty('-webkit-backdrop-filter', f);
    };
    this.scrub = gsap
      .timeline({
        scrollTrigger: {
          trigger: '#intro',
          start: 'top top',
          end: () => `+=${window.innerHeight * 0.95}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      .to(blur, { v: 22, ease: 'none', onUpdate: apply }, 0)
      .to(q('.scrim'), { opacity: 1, ease: 'none' }, 0)
      .to(q('.media video'), { scale: 1.08, ease: 'none' }, 0)
      .to([q('.copy'), q('.stats')], { autoAlpha: 0, y: -64, scale: 0.96, ease: 'none', duration: 0.55 }, 0.05);
  }

  /**
   * Start the hero video. Safe to call repeatedly: it is retried whenever the
   * video becomes playable, the page is restored or shown again, and on the
   * first user gesture, in case the browser blocked the initial autoplay.
   */
  @HostListener('window:pageshow')
  @HostListener('document:visibilitychange')
  @HostListener('window:pointerdown')
  @HostListener('window:keydown')
  protected tryPlay(): void {
    const video = this.video().nativeElement;
    if (this.finished || !video.paused) return;
    // Reduce Motion: keep the first frame as a still instead of autoplaying.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.textReady.set(true);
      return;
    }
    // Angular does not reflect the static `muted` attribute onto the element's
    // `muted` property, so browsers treat the video as unmuted and block autoplay.
    video.muted = true;
    video.play().catch(() => {
      /* autoplay blocked for now; the next retry trigger will try again */
    });
  }

  protected onEnded(): void {
    this.finished = true;
    this.textReady.set(true);
  }

  protected search(): void {
    this.motion.scrollTo('destinations');
  }
}
