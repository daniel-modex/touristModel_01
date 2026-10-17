import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { Motion } from '../../motion/motion.service';
import { Logo } from '../logo/logo';

/**
 * Page-load intro. Structure follows the reference site's loader: a dim copy of the logo and a
 * bright copy on top whose clip-path sweeps open as progress runs (tied to the hero video's first
 * frame, with a timeout), a film-grain layer, then the logo lifts away while the whole panel rolls
 * up to uncover the hero. Skipped under Reduce Motion.
 */
@Component({
  selector: 'app-loader',
  imports: [Logo],
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader implements AfterViewInit, OnDestroy {
  protected readonly motion = inject(Motion);
  private readonly zone = inject(NgZone);
  protected readonly done = signal(false);
  private readonly root = viewChild<ElementRef<HTMLElement>>('root');
  private timelines: { kill(): void }[] = [];
  private poll?: ReturnType<typeof setInterval>;

  ngAfterViewInit(): void {
    if (this.motion.reduced) {
      this.finish();
      return;
    }
    this.motion.lock();
    window.scrollTo(0, 0);
    this.zone.runOutsideAngular(() => this.play());
  }

  private play(): void {
    const host = this.root()?.nativeElement;
    if (!host) return this.finish();
    const { gsap } = this.motion;
    const logos = host.querySelectorAll('.logo-layer');
    const front = host.querySelector<HTMLElement>('.logo-front')!;
    const capsule = host.querySelector('.capsule');
    const sheet = host.querySelector('.sheet');
    const progress = { v: 0 };
    const sweep = () => {
      const p = (progress.v * 100).toFixed(2);
      front.style.clipPath = `polygon(0 0, ${p}% 0, ${p}% 100%, 0 100%)`;
    };
    sweep();
    gsap.set(logos, { yPercent: 105 });
    gsap.set(capsule, { autoAlpha: 0, scale: 0.9 });

    const exit = gsap.timeline({ paused: true, onComplete: () => this.zone.run(() => this.finish()) });
    exit
      .to(progress, { v: 1, duration: 0.45, ease: 'power2.out', onUpdate: sweep })
      .addLabel('lift', '+=0.25')
      .call(() => this.zone.run(() => this.motion.introStarted.set(true)), [], 'lift+=0.35')
      .to(capsule, { scale: 0.82, yPercent: -150, autoAlpha: 0, duration: 0.75, ease: 'power2.in' }, 'lift')
      .to(sheet, { yPercent: -100, duration: 1.3, ease: 'power3.inOut' }, 'lift+=0.15');

    const start = performance.now();
    const whenReady = () => {
      const ready = this.motion.heroReady();
      const waited = performance.now() - start;
      if ((ready && waited > 900) || waited > 4500) {
        clearInterval(this.poll);
        exit.play();
      }
    };

    const enter = gsap.timeline({ onComplete: () => (this.poll = setInterval(whenReady, 80)) });
    enter
      // the glass capsule condenses first, then the logo slides up inside it
      .to(capsule, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'power3.out' })
      .to(logos, { yPercent: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out' }, '-=0.45')
      // the sweep keeps creeping while we wait so it never looks stuck
      .to(progress, { v: 0.85, duration: 1.7, ease: 'power2.in', onUpdate: sweep }, '-=0.3');
    this.timelines.push(enter, exit);
  }

  private finish(): void {
    clearInterval(this.poll);
    this.done.set(true);
    this.motion.introStarted.set(true);
    this.motion.loaderDone.set(true);
    this.motion.unlock();
    this.motion.refresh();
  }

  ngOnDestroy(): void {
    clearInterval(this.poll);
    this.timelines.forEach((t) => t.kill());
  }
}
