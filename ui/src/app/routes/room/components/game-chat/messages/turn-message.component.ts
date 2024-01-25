import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { TurnMessage } from '../models';
import { DatePipe, NgClass, NgIf } from '@angular/common';

@Component({
  standalone: true,
  imports: [DatePipe, NgIf, NgClass],
  selector: 'turn-message',
  template: `
    <div class="turn-message">
      <div class="turn-message__play">
        <img class="turn-message__avatar" [src]="message.author.avatar" />
        <h2 *ngIf="message.dead === 4">{{ message.author.username }} has won!</h2>
        <span class="turn-message__play-value">&nbsp;{{ message.play }}</span>
      </div>
      <span class="turn-message__result">
        <strong class="turn-message__dead">{{ message.dead }} 💀</strong>
        <span class="turn-message__hit">{{ message.hit }} 💥</span>
      </span>
      <small class="turn-message__timestamp">
        {{ message.sent_at | date: 'HH:mm' }}
      </small>
    </div>
  `,
  styles: [`
    :host {
      width: fit-content;
      padding: 0.25rem 0.5rem;

      &.right {
        .turn-message {
          flex-flow: row-reverse;
        }
        
        .turn-message__play {
          border-right: 0;
          border-left: 1px solid var(--lightgray);
        }

        .turn-message__result {
          align-items: flex-end;
        }
        
        .turn-message__hit {
          direction: rtl; 
        }

        .turn-message__dead {
          direction: rtl; 
        }
      }
    }

    .turn-message {
      display: flex;
      flex-flow: row;      
      align-items: center;
      column-gap: 0.5rem;
    }

    .turn-message__play {
      display: flex;
      height: 100%;
      flex-direction: column;
      align-items: center;
      border-right: 1px solid var(--lightgray);
      gap: 0.25rem;
      padding: 0 0.5rem;
    }
    
    .turn-message__play-value {
      row-gap: 0.5rem;
      letter-spacing: 0.5rem;
      font-weight: 700;
    }

    .turn-message__avatar {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
    }

    .turn-message__result {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .turn-message__dead {
      font-size: 1.25rem;
    }

    .turn-message__timestamp {
      font-size: 0.6rem;
      opacity: 0.4;
      align-self: flex-end;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TurnMessageComponent {
  @Input() message!: TurnMessage;
}
