import { Component, HostListener, signal } from '@angular/core';
import { NAV_LINKS } from '../../data/content';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly links = NAV_LINKS;
  protected readonly lang = signal<'ON' | 'EN'>('EN');
  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }

  protected setLang(l: 'ON' | 'EN'): void {
    this.lang.set(l);
  }
}
