import { Component } from '@angular/core';
import { Blog } from './components/blog/blog';
import { Destinations } from './components/destinations/destinations';
import { Footer } from './components/footer/footer';
import { Hero } from './components/hero/hero';
import { HowItWorks } from './components/how-it-works/how-it-works';
import { Packages } from './components/packages/packages';
import { Testimonials } from './components/testimonials/testimonials';

@Component({
  selector: 'app-root',
  imports: [Hero, Destinations, HowItWorks, Packages, Testimonials, Blog, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
