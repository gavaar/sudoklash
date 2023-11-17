import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ServerMessage } from '../models';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true,
  imports: [DatePipe],
  selector: 'server-message',
  template: `
    <span class="server-message">
      [{{ message.sent_at | date: 'HH:mm' }}]: {{ message.message }}
    </span>
  `,
  styles: [`
    :host {
      align-self: center;
    }

    .server-message {
      color: yellowgreen;
      font-size: 0.75rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerMessageComponent {
  @Input() message!: ServerMessage;
}
