import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UserMessage } from '../models';
import { DatePipe, NgFor, NgIf } from '@angular/common';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, DatePipe],
  selector: 'user-message',
  template: `
    <img class="user-message__avatar" [src]="message.author.avatar" />
    <div class="user-message">
      <span *ngFor="let text of message.message; let last = last; trackBy: messageFn"
        class="user-message__message">
        {{ text }}
        <small *ngIf="last"
          class="user-message__timestamp">
          {{ message.sent_at | date: 'HH:mm' }}
        </small>
      </span>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
    }

    .user-message__avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
    }

    .user-message {
      display: flex;
      flex-direction: column;
      padding: 0 0.5rem;
      row-gap: 0.2rem;
      position: relative;

      &:after {
        content: "";
        position: absolute;
        bottom: 0;
        width: 0;
        height: 0;
        border: 6px solid transparent;
        border-bottom: 0;
      }
    }

    .user-message__message {
      display: flex;
      column-gap: 0.5rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      width: fit-content;
      min-width: 3rem;
    }

    .user-message__timestamp {
      font-size: 0.75rem;
      align-self: flex-end;
      opacity: 0.4;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMessageComponent {
  @Input() message!: UserMessage;

  messageFn = (index: number, message: string) => index + message;
}
