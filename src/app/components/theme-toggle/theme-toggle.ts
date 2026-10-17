import { Component, OnDestroy, OnInit, signal } from '@angular/core';

type Theme = 'light' | 'dark';

/**
 * Icon-only Liquid Glass control that switches between light and dark.
 * Follows the system setting until the user picks one; the choice is saved.
 */
@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggle implements OnInit, OnDestroy {
  protected readonly theme = signal<Theme>('light');
  private readonly query = window.matchMedia('(prefers-color-scheme: dark)');
  private readonly onSystemChange = () => {
    if (!this.saved()) this.theme.set(this.query.matches ? 'dark' : 'light');
  };

  ngOnInit(): void {
    const saved = this.saved();
    this.theme.set(saved ?? (this.query.matches ? 'dark' : 'light'));
    this.query.addEventListener('change', this.onSystemChange);
  }

  ngOnDestroy(): void {
    this.query.removeEventListener('change', this.onSystemChange);
  }

  protected toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('theme-switching');
      window.setTimeout(() => root.classList.remove('theme-switching'), 450);
    }
    root.setAttribute('data-theme', next);
    this.theme.set(next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* storage unavailable (private mode): the choice just lasts for this visit */
    }
  }

  private saved(): Theme | null {
    try {
      const t = localStorage.getItem('theme');
      return t === 'dark' || t === 'light' ? t : null;
    } catch {
      return null;
    }
  }
}
