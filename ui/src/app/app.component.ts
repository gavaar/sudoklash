import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { UserService } from './services';

@Component({
  selector: 'sudo-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <header>Hello {{ (user$ | async)?.name }}</header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer (click)="linkToGithub()">Made by &#64;gavaar</footer>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  user$ = this.userService.user$;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.init().subscribe();
  }

  linkToGithub(): void {
    window.open('https://github.com/gavaar', '_blank');
  }
}
