import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'how-to-play',
  template: `
    <button class="htp__back-button" routerLink="/">🔙 Home</button>
    <p>Under construction...! :D</p>`,
  styles: [`
    :host {
      display: flex;
      height: 100%;
      padding: 0 1rem;
      flex-direction: column;
      overflow: overlay;
      background-color: whitesmoke;
    }

    .htp__back-button {
      font-size: 2rem;
      border: 0;
      top: 0;
      position: sticky;
      background-color: whitesmoke;
      border-bottom-left-radius: 1rem;
      border-bottom-right-radius: 1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowToPlayComponent {}
