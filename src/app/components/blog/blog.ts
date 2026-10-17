import { Component } from '@angular/core';
import { BLOG_POSTS } from '../../data/content';
import { ParallaxDirective } from '../../directives/parallax.directive';
import { RevealDirective } from '../../directives/reveal.directive';
import { SplitDirective } from '../../directives/split.directive';

@Component({
  selector: 'app-blog',
  imports: [RevealDirective, ParallaxDirective, SplitDirective],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog {
  protected readonly posts = BLOG_POSTS;
}
