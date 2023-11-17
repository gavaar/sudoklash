import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { TurnMessage } from '../models';
import { DatePipe, NgIf } from '@angular/common';

@Component({
  standalone: true,
  imports: [DatePipe, NgIf],
  selector: 'turn-message',
  template: `
    <div class="turn-message">
      <img class="turn-message__avatar" [src]="message.author.avatar" />
      <h2 *ngIf="message.dead === 4">{{ message.author.username }} has won!</h2>
      <span class="turn-message__play">{{ message.play }}</span>
      <strong class="turn-message__result">
        💥 {{ message.hit }} | {{ message.dead }} 💀
      </strong>

      <small class="turn-message__timestamp">
        {{ message.sent_at | date: 'HH:mm' }}
      </small>
    </div>
  `,
  styles: [`
    :host {
      width: fit-content;
      padding: 0.5rem;
      margin: 0 0.5rem;
    }

    .turn-message {
      display: flex;
      flex-flow: column;
      align-items: center;
      row-gap: 0.25rem;
    }

    .turn-message__play {
      letter-spacing: 0.5rem;
      font-weight: 700;
      margin-left: 0.35rem;
    }

    .turn-message__avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
    }

    .turn-message__result {
      font-size: 1.5rem;
    }

    .turn-message__timestamp {
      font-size: 0.75rem;
      opacity: 0.4;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TurnMessageComponent {
  @Input() message!: TurnMessage;
}
