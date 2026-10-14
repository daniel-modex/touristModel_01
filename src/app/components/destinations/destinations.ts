import { Component } from '@angular/core';
import { DESTINATIONS } from '../../data/content';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-destinations',
  imports: [RevealDirective],
  templateUrl: './destinations.html',
  styleUrl: './destinations.scss',
})
export class Destinations {
  protected readonly items = DESTINATIONS;
}
