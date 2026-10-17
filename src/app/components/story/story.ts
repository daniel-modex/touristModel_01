import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';
import { Motion } from '../../motion/motion.service';

interface StoryCard {
  src: string;
  /** final position / width on desktop (stage-relative %, vw) and tilt */
  l: string;
  t: string;
  w: string;
  r: number;
  /** same on phones */
  ml: string;
  mt: string;
  mw: string;
  ratio: string;
}

/**
 * The "gallery over the blurred hero" moment from the reference: while the hero stays pinned and
 * blurs behind, photo cards fly out of a tilted stack to their places and statement lines fade
 * in and out one at a time, all scrubbed by scroll (a CSS-sticky stage, no pin spacers).
 */
@Component({
  selector: 'app-story',
  templateUrl: './story.html',
  styleUrl: './story.scss',
  host: { '[class.static]': 'motion.reduced' },
})
export class Story implements AfterViewInit, OnDestroy {
  protected readonly motion = inject(Motion);
  private readonly zone = inject(NgZone);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private tl?: { kill(): void; scrollTrigger?: { kill(): void } | null };

  protected readonly cards: StoryCard[] = [
    { src: 'images/cat-nedumudy.jpg', l: '5%', t: '9%', w: '19vw', r: -5, ml: '4%', mt: '7%', mw: '40vw', ratio: '4/3' },
    { src: 'images/cat-athirappilly.jpg', l: '79%', t: '8%', w: '14vw', r: 4, ml: '56%', mt: '11%', mw: '38vw', ratio: '3/4' },
    { src: 'images/cat-kolukkumalai.jpg', l: '7%', t: '58%', w: '16vw', r: 3, ml: '5%', mt: '66%', mw: '36vw', ratio: '4/3' },
    { src: 'images/cat-theyyam.jpg', l: '78%', t: '54%', w: '15vw', r: -3, ml: '54%', mt: '63%', mw: '40vw', ratio: '3/4' },
    { src: 'images/cat-houseboat-punnamada.jpg', l: '31%', t: '77%', w: '14vw', r: 2, ml: '0%', mt: '0%', mw: '0vw', ratio: '4/3' },
    { src: 'images/cat-elephant.jpg', l: '57%', t: '5%', w: '13vw', r: -2, ml: '0%', mt: '0%', mw: '0vw', ratio: '4/3' },
  ];

  protected readonly lines = [
    'Where backwaters drift and the hills touch the clouds,',
    'every journey through Kerala tells a different story,',
    'from the first sunrise to the last tide.',
  ];

  ngAfterViewInit(): void {
    if (this.motion.reduced) return;
    this.zone.runOutsideAngular(() => this.build());
  }

  ngOnDestroy(): void {
    this.tl?.scrollTrigger?.kill();
    this.tl?.kill();
  }

  private build(): void {
    const { gsap } = this.motion;
    const stage = this.host.querySelector<HTMLElement>('.stage')!;
    const cards = gsap.utils.toArray<HTMLElement>(this.host.querySelectorAll('.card'));
    const lines = gsap.utils.toArray<HTMLElement>(this.host.querySelectorAll('.line'));

    // Pile: a loose, tilted stack just below the top of the stage; it rises into view as the
    // hero blurs, then fans out to the final layout.
    const pileTilt = [-9, 7, -5, 10, -3, 5];
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: this.host,
        start: 'top 55%',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });

    cards.forEach((card, i) => {
      const finalRot = parseFloat(card.dataset['r'] ?? '0');
      tl.fromTo(
        card,
        {
          x: () => stage.clientWidth * 0.5 - (card.offsetLeft + card.offsetWidth / 2) + (i - 2.5) * 14,
          y: () => stage.clientHeight * 0.26 - (card.offsetTop + card.offsetHeight / 2) + i * 5,
          rotation: pileTilt[i % pileTilt.length],
          scale: 0.72,
          autoAlpha: 1,
        },
        { x: 0, y: 0, rotation: finalRot, scale: 1, duration: 2.6, ease: 'power3.out' },
        0.1 + i * 0.12,
      );
      // each photo drifts a little inside its frame while the text plays
      const img = card.querySelector('img');
      if (img) tl.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.04, duration: 8 }, 0.8);
    });

    // statement lines: in, hold, out, one at a time
    lines.forEach((line, i) => {
      const t0 = 3.2 + i * 2.1;
      gsap.set(line, { autoAlpha: 0 });
      tl.fromTo(
        line,
        { autoAlpha: 0, y: 48, scale: 1.04, filter: 'blur(10px)' },
        { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' },
        t0,
      );
      if (i < lines.length - 1) {
        tl.to(line, { autoAlpha: 0, y: -48, scale: 0.96, filter: 'blur(8px)', duration: 0.6, ease: 'power2.in' }, t0 + 1.5);
      }
    });

    // everything leaves together at the end, the next section slides over
    tl.to([...lines.slice(-1), ...cards], { autoAlpha: 0, scale: 0.94, duration: 0.8, ease: 'power2.in' }, 9.2);
    tl.set({}, {}, 10);
    this.tl = tl;
  }
}
