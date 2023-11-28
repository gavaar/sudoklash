import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from 'src/app/services';

@Component({
  standalone: true,
  imports: [AsyncPipe, NgIf, RouterLink, RouterLinkActive],
  selector: 'sudo-header',
  template: `
    <header class="sudo-header" *ngIf="(user$ | async) as user">
      <span class="sudo-header__home"
        routerLinkActive="at-home"
        routerLink="/"
        [routerLinkActiveOptions]="{ exact: true }">
        &#x2B05;
      </span>
      <span class="sudo-header__name">{{ user.name }}</span>
      <img class="sudo-header__img"
        alt="user photo"
        [src]="user.photo" />
    </header>
  `,
  styles: [`
    .sudo-header {
      background: var(--black);
      color: var(--white);
      padding: 0.25rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 1.2rem;
    }

    .sudo-header__home {
      &.at-home {
        opacity: 0;
      }
    }

    .sudo-header__img {
      width: 1.2rem;
      border-radius: 50%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  user$ = this.userService.user$;

  constructor(private userService: UserService) {}
}
