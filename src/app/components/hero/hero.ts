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
  /** seconds into the footage at which the headline + search begin to animate */
  private readonly COPY_START = 5;
  /** the headline + search finish this long before the footage ends */
  private readonly COPY_END_BEFORE = 1;
  /** length of the headline/search animation window (s); set from the clip's real duration */
  protected readonly copyDuration = signal(3);
  private watching = false;
  private finished = false;
  protected date = '';
  protected budget = '';
  protected guests = '';
  protected readonly budgets = ['Under ₹20,000', '₹20,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000+'];
  protected readonly guestOptions = ['1 Guest', '2 Guests', '3 – 5 Guests', '6+ Guests'];

  constructor() {
    // The loader lifts -> the picture settles. (Header and stats are staged by their own delays;
    // the headline and search wait for the footage itself, see onPlaying().)
    effect(() => {
      if (this.motion.introStarted()) this.playEntrance();
    });
    // The footage itself starts only once the loader has completely gone, so nothing is missed behind it.
    effect(() => {
      if (!this.motion.loaderDone()) return;
      this.tryPlay();
      // safety net: if the footage never starts (autoplay blocked), still show the content
      setTimeout(() => this.textReady.set(true), (this.COPY_START + 4) * 1000);
    });
  }

  ngAfterViewInit(): void {
    this.tryPlay();
    if (!this.motion.reduced) {
      this.prepareEntrance();
      this.zone.runOutsideAngular(() => this.setupScrollBlur());
    }
  }

  ngOnDestroy(): void {
    this.scrub?.scrollTrigger?.kill();
    this.scrub?.kill();
  }

  /**
   * The picture starts slightly zoomed (from the very first paint, while it is still hidden under the
   * loader's blur) and settles to 1x over exactly the unblur's duration and easing (Motion.REVEAL), so it
   * only ever moves smoothly in one direction and is at rest when the footage starts. No jump, no snap.
   */
  private prepareEntrance(): void {
    this.zone.runOutsideAngular(() => this.motion.gsap.set(this.host.querySelector('.media'), { scale: 1.14 }));
  }

  private playEntrance(): void {
    if (this.entered || this.motion.reduced) return;
    this.entered = true;
    this.zone.runOutsideAngular(() => {
      this.motion.gsap.to(this.host.querySelector('.media'), {
        scale: 1,
        duration: this.motion.REVEAL.duration,
        ease: this.motion.REVEAL.ease,
        clearProps: 'transform',
      });
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
    // hold on the first frame while the loader is still covering the page
    if (!this.motion.loaderDone() || this.finished || !video.paused) return;
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

  /** Footage metadata: the headline/search window runs from COPY_START to one second before the end. */
  protected onMeta(video: HTMLVideoElement): void {
    if (Number.isFinite(video.duration)) {
      this.copyDuration.set(Math.max(1.6, video.duration - this.COPY_END_BEFORE - this.COPY_START));
    }
  }

  /** Footage is playing: watch its clock and start the headline + search at COPY_START. */
  protected onPlaying(): void {
    if (this.watching || this.textReady()) return;
    this.watching = true;
    this.zone.runOutsideAngular(() => {
      const v = this.video().nativeElement;
      const tick = () => {
        if (this.textReady()) return void (this.watching = false);
        if (v.currentTime >= this.COPY_START) {
          this.watching = false;
          this.zone.run(() => this.textReady.set(true));
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /**
   * The footage has ended and holds on its last frame: that frame fades in a soft vignette and the
   * picture slowly pushes inward, easing out so it comes smoothly to rest.
   */
  protected onEnded(): void {
    this.finished = true;
    this.textReady.set(true);
    if (this.motion.reduced) return;
    this.zone.runOutsideAngular(() => {
      const { gsap } = this.motion;
      gsap.to(this.host.querySelector('.media'), { scale: 1.075, duration: 4.2, ease: 'power3.out', overwrite: 'auto' });
      gsap.to(this.host.querySelector('.outro'), { opacity: 1, duration: 3.4, ease: 'power2.out' });
    });
  }

  protected search(): void {
    this.motion.scrollTo('destinations');
  }
}
