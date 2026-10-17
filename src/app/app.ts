import { Component, OnInit, inject } from '@angular/core';
import { Motion } from './motion/motion.service';
import { Blog } from './components/blog/blog';
import { Categories } from './components/categories/categories';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { Intro } from './components/intro/intro';
import { Journeys } from './components/journeys/journeys';
import { KeralaMap } from './components/kerala-map/kerala-map';
import { Loader } from './components/loader/loader';
import { HowItWorks } from './components/how-it-works/how-it-works';
import { Testimonials } from './components/testimonials/testimonials';
import { Scrollbar } from './components/scrollbar/scrollbar';
import { ThemeToggle } from './components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-root',
  imports: [Loader, Header, Intro, Categories, KeralaMap, HowItWorks, Journeys, Testimonials, Blog, Footer, ThemeToggle, Scrollbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly motion = inject(Motion);

  ngOnInit(): void {
    this.motion.init();
  }
}
