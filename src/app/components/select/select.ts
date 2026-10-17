import { ChangeDetectorRef, Component, ElementRef, HostListener, afterNextRender, computed, forwardRef, inject, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

/**
 * A drop-down in the style of Apple's pop-up menus, used by the trip search in place of the
 * browser's own <select> list: a rounded, dark translucent sheet that scales out from the control,
 * a check mark beside the chosen row, and a soft highlight under the pointer or keyboard focus.
 * It opens upward when there is no room below (or the surrounding frame would clip it) and lines
 * up with the right edge when it would run past the left-aligned position.
 *
 * Works with ngModel and follows the listbox pattern: arrow keys, Home/End, Enter/Space,
 * Escape, type-ahead, aria-activedescendant.
 */
@Component({
  selector: 'app-select',
  templateUrl: './select.html',
  styleUrl: './select.scss',
  host: { '[style.--fit.px]': 'fit()' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Select), multi: true }],
})
export class Select implements ControlValueAccessor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly cdr = inject(ChangeDetectorRef);

  readonly options = input.required<readonly string[]>();
  readonly placeholder = input('Select');
  readonly label = input('');

  protected readonly uid = 'sel' + nextId++;
  protected readonly value = signal('');
  protected readonly open = signal(false);
  protected readonly cursor = signal(0);
  protected readonly up = signal(false);
  protected readonly end = signal(false);
  /** width the closed control needs for its current text (text + gap + chevron), for hosts that size to the choice */
  protected readonly fit = signal(0);
  private readonly ruler = viewChild<ElementRef<HTMLElement>>('ruler');
  protected readonly shown = computed(() => this.value() || this.placeholder());
  private typed = '';

  constructor() {
    // measure once the first render is in, and again when fonts have loaded
    afterNextRender(() => {
      this.measure();
      document.fonts?.ready.then(() => this.measure());
    });
  }

  private measure(): void {
    const w = this.ruler()?.nativeElement.offsetWidth;
    if (w) this.fit.set(Math.ceil(w) + 20);
  }
  private typedTimer?: ReturnType<typeof setTimeout>;

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(v: string | null): void {
    this.value.set(v ?? '');
    queueMicrotask(() => this.measure());
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected toggle(): void {
    if (this.open()) this.close();
    else this.show();
  }

  private show(): void {
    this.place();
    const i = this.options().indexOf(this.value());
    this.cursor.set(i < 0 ? 0 : i);
    this.open.set(true);
  }

  private close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.onTouched();
  }

  protected choose(i: number): void {
    const v = this.options()[i];
    this.value.set(v);
    this.onChange(v);
    this.cdr.detectChanges();
    this.measure();
    this.close();
    this.host.querySelector('button')?.focus({ preventScroll: true });
  }

  /** decide direction and alignment from the room left inside the viewport and any clipping ancestor */
  private place(): void {
    const r = this.host.getBoundingClientRect();
    let top = 0;
    let bottom = window.innerHeight;
    let right = window.innerWidth;
    for (let el = this.host.parentElement; el; el = el.parentElement) {
      const o = getComputedStyle(el);
      if (o.overflow !== 'visible' || o.overflowX !== 'visible' || o.overflowY !== 'visible') {
        const b = el.getBoundingClientRect();
        top = Math.max(top, b.top);
        bottom = Math.min(bottom, b.bottom);
        right = Math.min(right, b.right);
      }
    }
    const need = this.options().length * 40 + 20;
    const below = bottom - r.bottom;
    const above = r.top - top;
    this.up.set(below < need && above > below);
    this.end.set(r.left + 210 > right);
  }

  protected onKey(event: KeyboardEvent): void {
    const n = this.options().length;
    const k = event.key;
    if (!this.open()) {
      if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter' || k === ' ') {
        event.preventDefault();
        this.show();
      }
      return;
    }
    if (k === 'ArrowDown') this.cursor.update((i) => (i + 1) % n);
    else if (k === 'ArrowUp') this.cursor.update((i) => (i - 1 + n) % n);
    else if (k === 'Home') this.cursor.set(0);
    else if (k === 'End') this.cursor.set(n - 1);
    else if (k === 'Enter' || k === ' ') this.choose(this.cursor());
    else if (k === 'Escape') this.close();
    else if (k === 'Tab') this.close();
    else if (k.length === 1 && /\S/.test(k)) this.typeahead(k.toLowerCase());
    else return;
    if (k !== 'Tab') event.preventDefault();
  }

  private typeahead(ch: string): void {
    clearTimeout(this.typedTimer);
    this.typed += ch;
    this.typedTimer = setTimeout(() => (this.typed = ''), 600);
    const hit = this.options().findIndex((o) => o.toLowerCase().replace(/^[^a-z0-9]+/, '').startsWith(this.typed));
    if (hit >= 0) this.cursor.set(hit);
  }

  @HostListener('document:pointerdown', ['$event'])
  protected outside(event: Event): void {
    if (this.open() && !this.host.contains(event.target as Node)) this.close();
  }

  @HostListener('window:resize')
  protected onResize(): void {
    this.close();
  }
}
