import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, computed, inject, signal } from '@angular/core';
import { KERALA_DISTRICTS, KERALA_PINS, KERALA_VIEWBOX, KeralaPin } from '../../data/kerala-map';
import { SplitDirective } from '../../directives/split.directive';
import { RevealDirective } from '../../directives/reveal.directive';
import { Motion } from '../../motion/motion.service';

/**
 * "Kerala, mapped": the reference site's island-map section, rebuilt for Kerala. The map is the
 * real district geometry (14 districts) with each featured destination pinned at its true
 * coordinates. Hovering or focusing a place (in the list or on the map) highlights its district
 * and opens a glass card; the map zooms/fades in and its outlines draw as you scroll.
 */
@Component({
  selector: 'app-kerala-map',
  imports: [SplitDirective, RevealDirective],
  templateUrl: './kerala-map.html',
  styleUrl: './kerala-map.scss',
})
export class KeralaMap implements AfterViewInit, OnDestroy {
  private readonly motion = inject(Motion);
  private readonly zone = inject(NgZone);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly viewBox = KERALA_VIEWBOX;
  protected readonly vbW = +KERALA_VIEWBOX.split(' ')[2];
  protected readonly vbH = +KERALA_VIEWBOX.split(' ')[3];
  protected readonly districts = KERALA_DISTRICTS;
  protected readonly pins = KERALA_PINS;
  protected readonly activeId = signal<string>('munnar');
  protected readonly active = computed<KeralaPin>(() => this.pins.find((p) => p.id === this.activeId()) ?? this.pins[0]);
  protected readonly facts = [
    { n: '14', l: 'districts' },
    { n: '44', l: 'rivers' },
    { n: '590 km', l: 'of coastline' },
  ];

  private triggers: { kill(): void }[] = [];

  protected activate(id: string): void {
    this.activeId.set(id);
  }

  /** small name label beside the active pin: outward (right) for eastern pins, out to sea (left) for the rest */
  protected readonly chip = computed(() => {
    const p = this.active();
    const east = p.x / this.vbW > 0.72;
    return {
      left: (p.x / this.vbW) * 100 + '%',
      top: (p.y / this.vbH) * 100 + '%',
      transform: east ? 'translate(0, -50%)' : 'translate(-100%, -50%)',
      marginLeft: east ? '20px' : '-20px',
    };
  });

  ngAfterViewInit(): void {
    if (this.motion.reduced) return;
    this.zone.runOutsideAngular(() => this.build());
  }

  ngOnDestroy(): void {
    this.triggers.forEach((t) => t.kill());
  }

  private build(): void {
    const { gsap } = this.motion;
    const q = <T extends Element>(s: string) => this.host.querySelector<T>(s)!;
    const frame = q('.frame');
    const shapes = gsap.utils.toArray<SVGPathElement>(this.host.querySelectorAll('.district'));
    const pins = gsap.utils.toArray<SVGGElement>(this.host.querySelectorAll('.pin'));

    // 1) the map eases in from a closer zoom (scrubbed), like the reference
    const zoom = gsap.fromTo(
      frame,
      { autoAlpha: 0, scale: 1.35, transformOrigin: '50% 40%' },
      {
        autoAlpha: 1,
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: this.host, start: 'top bottom', end: 'top 25%', scrub: true },
      },
    );

    // 2) district outlines draw themselves
    shapes.forEach((s) => {
      s.setAttribute('pathLength', '1');
    });
    const draw = gsap.fromTo(
      shapes,
      { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 },
      {
        strokeDashoffset: 0,
        fillOpacity: 1,
        ease: 'none',
        stagger: 0.04,
        scrollTrigger: { trigger: this.host, start: 'top 80%', end: 'top 20%', scrub: true },
      },
    );

    // 3) pins pop in once the map is on screen
    gsap.set(pins, { scale: 0, transformOrigin: '50% 50%' });
    const pop = gsap.to(pins, {
      scale: 1,
      duration: 0.7,
      ease: 'back.out(2.2)',
      stagger: 0.07,
      scrollTrigger: { trigger: this.host, start: 'top 35%', once: true },
    });

    for (const t of [zoom, draw, pop]) {
      this.triggers.push({
        kill: () => {
          t.scrollTrigger?.kill();
          t.kill();
        },
      });
    }
  }
}
