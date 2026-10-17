import { Component } from '@angular/core';
import { Blog } from './components/blog/blog';
import { Categories } from './components/categories/categories';
import { Destinations } from './components/destinations/destinations';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { Hero } from './components/hero/hero';
import { HowItWorks } from './components/how-it-works/how-it-works';
import { Packages } from './components/packages/packages';
import { Testimonials } from './components/testimonials/testimonials';
import { ThemeToggle } from './components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-root',
  imports: [Header, Hero, Categories, Destinations, HowItWorks, Packages, Testimonials, Blog, Footer, ThemeToggle],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
