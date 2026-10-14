import { Component, signal } from '@angular/core';
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
export class Hero {
  protected readonly stats = STATS;
  protected readonly videoReady = signal(false);
  protected date = '';
  protected budget = '';
  protected guests = '';
  protected readonly budgets = ['Under ₹20,000', '₹20,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000+'];
  protected readonly guestOptions = ['1 Guest', '2 Guests', '3 – 5 Guests', '6+ Guests'];

  protected search(): void {
    document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
  }
}
