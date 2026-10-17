import { AfterViewInit, Component, ElementRef, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { STATS } from '../../data/content';
import { CountUpDirective } from '../../directives/count-up.directive';
import { RevealDirective } from '../../directives/reveal.directive';
import { Header } from '../header/header';

@Component({
  selector: 'app-hero',
  imports: [FormsModule, Header, CountUpDirective, RevealDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements OnInit, AfterViewInit {
  private readonly video = viewChild.required<ElementRef<HTMLVideoElement>>('heroVideo');
  protected readonly stats = STATS;
  protected readonly videoReady = signal(false);
  protected readonly textReady = signal(false);
  protected date = '';
  protected budget = '';
  protected guests = '';
  protected readonly budgets = ['Under ₹20,000', '₹20,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000+'];
  protected readonly guestOptions = ['1 Guest', '2 Guests', '3 – 5 Guests', '6+ Guests'];

  ngOnInit(): void {
    // Safety fallback so text still appears if video autoplay is blocked
    setTimeout(() => {
      if (!this.textReady()) {
        this.textReady.set(true);
      }
    }, 5000);
  }

  ngAfterViewInit(): void {
    // Angular does not reflect the static `muted` attribute onto the element's
    // `muted` property, so browsers treat the video as unmuted and block autoplay.
    const video = this.video().nativeElement;
    video.muted = true;
    video.play().catch(() => this.textReady.set(true));
  }

  protected onTimeUpdate(video: HTMLVideoElement): void {
    if (video.currentTime >= 4 && !this.textReady()) {
      this.textReady.set(true);
    }
  }

  protected search(): void {
    document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
  }
}
