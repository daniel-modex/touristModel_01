import { Component, HostListener, OnInit, signal } from '@angular/core';
import { NAV_LINKS } from '../../data/content';

/**
 * Floating navigation (Liquid Glass functional layer). It stays above the
 * content, uses clear glass over the hero media and regular glass once it is
 * over light content, and marks the section currently in view.
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  protected readonly links = NAV_LINKS;
  protected readonly lang = signal<'ML' | 'EN'>('EN');
  protected readonly overContent = signal(false);
  protected readonly active = signal('');
  protected readonly menuOpen = signal(false);

  ngOnInit(): void {
    this.onScroll();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScroll(): void {
    const hero = document.getElementById('top');
    this.overContent.set(!!hero && hero.getBoundingClientRect().bottom < 90);

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
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }

  protected setLang(l: 'ML' | 'EN'): void {
    this.lang.set(l);
  }
}
