import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root component for the standalone StudyBox Student Portal application.
 */
@Component({
  selector: 'sb-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {}
