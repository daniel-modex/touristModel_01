import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { Story } from '../story/story';

/**
 * Hero + story as one scroll scene: the hero is position:sticky, so it stays pinned (and blurs)
 * while the story scrolls over it. The next section simply covers it when the scene ends.
 */
@Component({
  selector: 'app-intro',
  imports: [Hero, Story],
  template: '<app-hero /><app-story />',
  host: { id: 'intro' },
  styles: ':host { display: block; position: relative; }',
})
export class Intro {}
