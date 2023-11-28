import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'sudo-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, HeaderComponent],
  template: `
    <sudo-header></sudo-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer (click)="linkToGithub()">Made by &#64;gavaar</footer>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  linkToGithub(): void {
    window.open('https://github.com/gavaar', '_blank');
  }
}
