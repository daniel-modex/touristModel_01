import { Component } from '@angular/core';
import { BLOG_POSTS } from '../../data/content';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-blog',
  imports: [RevealDirective],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog {
  protected readonly posts = BLOG_POSTS;
}
