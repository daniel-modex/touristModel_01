import { Component } from '@angular/core';
import { PACKAGES } from '../../data/content';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-packages',
  imports: [RevealDirective],
  templateUrl: './packages.html',
  styleUrl: './packages.scss',
})
export class Packages {
  protected readonly items = PACKAGES;
}
