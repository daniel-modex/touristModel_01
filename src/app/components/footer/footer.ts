import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FOOTER_COLUMNS } from '../../data/content';
import { RevealDirective } from '../../directives/reveal.directive';
import { Logo } from '../logo/logo';

@Component({
  selector: 'app-footer',
  imports: [FormsModule, RevealDirective, Logo],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly columns = FOOTER_COLUMNS;
  protected readonly year = new Date().getFullYear();
  protected readonly subscribed = signal(false);
  protected email = '';

  protected subscribe(): void {
    if (this.email.includes('@')) {
      this.subscribed.set(true);
      this.email = '';
    }
  }
}
