import { Component, HostListener, OnInit, effect, inject, signal } from '@angular/core';
import { NAV_LINKS } from '../../data/content';
import { Motion } from '../../motion/motion.service';
import { Logo } from '../logo/logo';

/**
 * Floating navigation (Liquid Glass functional layer). It stays above the
 * content, uses clear glass over the hero media and regular glass once it is
 * over light content, and marks the section currently in view.
 */
@Component({
  selector: 'app-header',
  imports: [Logo],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  protected readonly links = NAV_LINKS;
  protected readonly lang = signal<'ML' | 'EN'>('EN');
  protected readonly overContent = signal(false);
  protected readonly active = signal('');
  protected readonly menuOpen = signal(false);
  /** hides while scrolling down, returns on scroll up (like the reference) */
  protected readonly hidden = signal(false);
  protected readonly motion = inject(Motion);
  private lastY = 0;

  /** after the first reveal, hide/show on scroll must not be delayed */
  protected readonly settled = signal(false);

  constructor() {
    effect(() => {
      if (this.motion.introStarted()) setTimeout(() => this.settled.set(true), 2000);
    });
  }

  ngOnInit(): void {
    this.onScroll();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScroll(): void {
    // the hero + story form one sticky "intro"; the bar changes style only once that has scrolled away
    const intro = document.getElementById('intro');
    this.overContent.set(!!intro && intro.getBoundingClientRect().bottom < 90);

    const y = window.scrollY;
    if (y > 320 && y > this.lastY + 4 && !this.menuOpen()) this.hidden.set(true);
    else if (y < this.lastY - 4 || y < 320) this.hidden.set(false);
    this.lastY = y;

    let current = '';
    for (const l of this.links) {
      const el = document.getElementById(l.id);
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) current = l.id;
    }
    this.active.set(current);
  }

  @HostListener('document:keydown.escape')
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected go(id: string, event: Event): void {
    event.preventDefault();
    this.menuOpen.set(false);
    this.motion.scrollTo(id === 'top' ? 0 : id);
  }

  protected setLang(l: 'ML' | 'EN'): void {
    this.lang.set(l);
  }
}
