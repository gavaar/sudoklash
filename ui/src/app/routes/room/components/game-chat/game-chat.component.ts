import { DatePipe, NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectionStrategy, Component, Signal, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SendButtonComponent } from 'src/app/components/send-button/send-button.component';
import { RoomChat, RoomWsService, Turn } from 'src/app/services/websocket/room.wsService';
import { UserMessageComponent } from './messages/user-message.component';
import { GameMessage, MessageType } from './models';
import { ServerMessageComponent } from './messages/server-message.component';
import { TurnMessageComponent } from './messages/turn-message.component';

const DEPENDENCIES = [NgIf, NgFor, NgClass, NgSwitch, NgSwitchCase, DatePipe, ReactiveFormsModule, SendButtonComponent, UserMessageComponent, ServerMessageComponent, TurnMessageComponent];
const SERVER_AUTHOR = '_ROOM_';

@Component({
  standalone: true,
  imports: DEPENDENCIES,
  selector: 'game-chat',
  templateUrl: './game-chat.component.html',
  styleUrls: [
    './game-chat.component.overrides.scss',
    './game-chat.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameChatComponent {
  MessageType = MessageType;
  colors = ['#A9DEF950','#fd545450','#BFD2BF50','#D3F8E250','#E4C1F950'];
  messages: Signal<GameMessage[]> = computed(() => this.updateRoomMessages());
  
  chatControl = new FormControl('');

  messageFn = (_: number, message: GameMessage) => message.sent_at;

  constructor(private roomService: RoomWsService) {}

  sendMessage(): void {
    if (this.chatControl.value) {
      this.roomService.sendMessage(this.chatControl.value);
      this.chatControl.setValue(null);
    }
  }

  private getAuthor(user_id: string) {
    const author_position = this.roomService.room().users.findIndex(u => user_id === u.id)!;
    const position: 'left' | 'right' = author_position % 2 == 0 ? 'left' : 'right';
    const color = this.colors[author_position % this.colors.length];
    return { ...this.roomService.room().users[author_position], position, color };
  }

  private updateRoomMessages(): GameMessage[] {
    const { messages, game: { history } } = this.roomService.room();
    type Message = Turn | RoomChat;
    const ordered = (<Message[]>messages).concat(<Message[]>history);
    ordered.sort((a, b) => +new Date(a.sent_at) - +new Date(b.sent_at));

    return ordered
      .reduce((acc, message) => {
        const sent_at = +new Date(message.sent_at);
        const author = this.getAuthor(message.user_id);

        if ((message as Turn).play) {
          acc.push({
            author,
            sent_at,
            play: (message as Turn).play,
            hit: (message as Turn).result[0],
            dead: (message as Turn).result[1],
            type: MessageType.Turn,
          });
          return acc;
        }

        const previousMessageMut: GameMessage = acc.at(-1) || {
          type: message.user_id === SERVER_AUTHOR ? MessageType.Server : MessageType.User,
          author: this.getAuthor(message.user_id),
          sent_at: 0,
          message: [],
        };

        if (previousMessageMut.type === MessageType.User && previousMessageMut?.author?.id === message.user_id) {
          previousMessageMut!.message!.push((message as RoomChat).message);
          previousMessageMut!.sent_at = +new Date(message.sent_at);
        } else {
          acc.push({
            type: message.user_id === SERVER_AUTHOR ? MessageType.Server : MessageType.User,
            author: this.getAuthor(message.user_id),
            sent_at: +new Date(message.sent_at),
            message: [(message as RoomChat).message],
          });
        }

        return acc;
      }, [] as GameMessage[])
      .reverse();
  }
}
