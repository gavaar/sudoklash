import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'home',
  imports: [RouterLink],
  template: `
    <h1 class="home__title">Hit or dead</h1>
    <p class="home__text">
      Choose a four digit number, play against a friend,
      try to guess theirs before they guess yours.
    </p>
    <button class="home__button home__new-game-button"
      routerLink="room">
      New game
    </button>
    <button class="home__button home__how-to-play"
      routerLink="how-to-play">
      How to play
    </button>
    <img class="home__img"
      src="/assets/images/game.png"
      alt="game image"
    />
  `,
  styles: [`
    :host {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      row-gap: 2rem;
      padding: 1rem;
      box-sizing: border-box;
      overflow: hidden;
    }

    .home__title {
      margin: 0;
      font-size: 2.5rem;
    }

    .home__img {
      flex: 1 1 0;
      height: 5rem;
      opacity: 0.7;
    }

    .home__text {
      text-align: center;
      margin: 0;
    }

    .home__button {
      background: transparent;
      font-weight: 700;
      color: var(--black);
      border: 1px solid var(--black);
      padding: 0.2rem 0.5rem;
      border-radius: 0.5rem;
    }

    .home__new-game-button {
      font-size: 2rem;
    }

    .home__how-to-play {
      font-size: 1.2rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
