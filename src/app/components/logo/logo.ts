import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LOGO_COLORS, LOGO_LETTERS, LOGO_MARK, LOGO_VIEWBOX } from '../../data/logo-paths';

/**
 * The Greenmiles logo as inline SVG (paths come from the brand PDF, see
 * scripts/build-brand.mjs).
 *
 *  variant "full"      wordmark + bird/leaf mark
 *  variant "wordmark"  letters only
 *  variant "mark"      bird/leaf symbol only
 *  mono                paints everything in currentColor (e.g. white over the hero video)
 */
@Component({
  selector: 'app-logo',
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.mono]': 'mono()', '[style.height.px]': 'height()' },
})
export class Logo {
  readonly variant = input<'full' | 'wordmark' | 'mark'>('full');
  readonly mono = input(false);
  /** rendered height in px; width follows the artwork's aspect ratio */
  readonly height = input(36);

  protected readonly colors = LOGO_COLORS;
  protected readonly letters = LOGO_LETTERS;
  protected readonly mark = LOGO_MARK;
  protected readonly viewBox = computed(() => LOGO_VIEWBOX[this.variant()]);
  protected readonly showLetters = computed(() => this.variant() !== 'mark');
  protected readonly showMark = computed(() => this.variant() !== 'wordmark');
}
