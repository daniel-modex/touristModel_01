import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FOOTER_COLUMNS } from '../../data/content';
import { RevealDirective } from '../../directives/reveal.directive';
import { SplitDirective } from '../../directives/split.directive';
import { Motion } from '../../motion/motion.service';
import { Logo } from '../logo/logo';

@Component({
  selector: 'app-footer',
  imports: [FormsModule, RevealDirective, SplitDirective, Logo],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements AfterViewInit, OnDestroy {
  private readonly motion = inject(Motion);
  private readonly zone = inject(NgZone);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private reveal?: { kill(): void; scrollTrigger?: { kill(): void } | null };
  protected readonly marquee = ['Munnar', 'Alleppey', 'Varkala', 'Kochi', 'Wayanad', 'Thekkady', 'Athirappilly', 'Kovalam', 'Kannur'];
  protected readonly columns = FOOTER_COLUMNS;
  protected readonly year = new Date().getFullYear();
  protected readonly subscribed = signal(false);
  protected email = '';

  ngAfterViewInit(): void {
    if (this.motion.reduced) return;
    // the footer opens as a circle growing from the bottom edge (the reference does this with mask-size)
    this.zone.runOutsideAngular(() => {
      const foot = this.host.querySelector('.foot');
      this.reveal = this.motion.gsap.fromTo(
        foot,
        { clipPath: 'circle(0% at 50% 100%)' },
        {
          clipPath: 'circle(150% at 50% 100%)',
          ease: 'none',
          scrollTrigger: { trigger: this.host, start: 'top 100%', end: 'top 25%', scrub: true },
        },
      );
    });
  }

  ngOnDestroy(): void {
    this.reveal?.scrollTrigger?.kill();
    this.reveal?.kill();
  }

  protected subscribe(): void {
    if (this.email.includes('@')) {
      this.subscribed.set(true);
      this.email = '';
    }
  }
}
