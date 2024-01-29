import { DatePipe, NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Signal, ViewChild, computed, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SendButtonComponent } from 'src/app/components/send-button/send-button.component';
import { RoomChat, RoomWsService, Turn } from 'src/app/services/websocket/room.wsService';
import { UserMessageComponent } from './messages/user-message.component';
import { GameMessage, MessageType, PositionedUser } from './models';
import { ServerMessageComponent } from './messages/server-message.component';
import { TurnMessageComponent } from './messages/turn-message.component';
import { UserService } from 'src/app/services';
import { take, timer } from 'rxjs';

const DEPENDENCIES = [NgIf, NgFor, NgClass, NgSwitch, NgSwitchCase, DatePipe, ReactiveFormsModule, SendButtonComponent, UserMessageComponent, ServerMessageComponent, TurnMessageComponent];
const SERVER_AUTHOR = '_ROOM_';
const DCD_USER: PositionedUser = {
  id: 'dcd',
  username: 'Disconnected',
  avatar: 'assets/images/unkown-avatar.png',
  color: 'var(--lightgray)',
  position: 'left',
};

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
  @ViewChild('chatBody') chatBody!: ElementRef;

  MessageType = MessageType;
  colors = ['#A9DEF950','#fd545450','#BFD2BF50','#D3F8E250','#E4C1F950'];
  messages: Signal<GameMessage[]> = computed(() => this.updateRoomMessages());
  showScrollBotButton = false;
  
  chatControl = new FormControl('');

  messageFn = (_: number, message: GameMessage) => message.sent_at;

  constructor(private roomService: RoomWsService, private userService: UserService) {
    effect(() => {
      const lastMessageAuthor = this.messages()[0]?.author;

      if (lastMessageAuthor?.id === this.userService.user?.id) {
        this.scrollToBottom();
      } else if (this.chatBody?.nativeElement?.scrollTop < 0) {
        this.showScrollBotButton = true;
      }
    });
  }

  sendMessage(): void {
    if (this.chatControl.value) {
      this.roomService.sendMessage(this.chatControl.value);
      this.chatControl.setValue(null);
    }
  }

  private getAuthor(user_id: string) {
    const author_position = this.roomService.room().users.findIndex(u => user_id === u.id);
    if (author_position === -1) {
      return DCD_USER;
    }

    const position: 'left' | 'right' = author_position % 2 == 0 ? 'left' : 'right';
    const color = this.colors[author_position % this.colors.length];
    return { ...this.roomService.room().users[author_position], position, color };
  }

  scrollToBottom(): void {
    this.showScrollBotButton = false;
    timer(100).pipe(take(1)).subscribe({
      next: () => {
        this.chatBody?.nativeElement?.scrollTo({ top: 1, left: 0, behavior: 'smooth' });
      },
    });
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
