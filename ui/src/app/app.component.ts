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
    <footer>
      <a routerLink="">Home</a>
      <a routerLink="how-to-play">How to play</a>
      <a routerLink="room">Room</a>
    </footer>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  user$ = this.userService.user$;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.init().subscribe();
  }
}
