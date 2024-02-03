import { DatePipe, NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Signal, ViewChild, computed, effect, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SendButtonComponent } from 'src/app/components/send-button/send-button.component';
import { RoomChat, RoomWsService, Turn } from 'src/app/services/websocket/room.wsService';
import { UserMessageComponent } from './messages/user-message.component';
import { GameMessage, MessageType, PositionedUser } from './models';
import { ServerMessageComponent } from './messages/server-message.component';
import { TurnMessageComponent } from './messages/turn-message.component';
import { UserService } from 'src/app/services';
import { take, timer } from 'rxjs';

const IMPORTS = [NgIf, NgFor, NgClass, NgSwitch, NgSwitchCase, DatePipe, ReactiveFormsModule, SendButtonComponent, UserMessageComponent, ServerMessageComponent, TurnMessageComponent];
const SERVER_AUTHOR = '_ROOM_';
const DCD_USER: PositionedUser = {
  id: 'dcd',
  username: 'Disconnected',
  avatar: 'assets/images/unkown-avatar.png',
  color: 'var(--lightgray)',
  position: 'left',
};

type Filters = {
  player1: boolean;
  player2: boolean;
  serverChat: boolean;
  roomChat: boolean;
};

@Component({
  standalone: true,
  imports: IMPORTS,
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
  filters = signal<Filters>({ player1: true, player2: true, roomChat: true, serverChat: true });
  filterValues = computed<{ key: keyof Filters, value: string }[]>(() => {
    const [player1, player2] = this.roomService.room().game.players;

    return [
      { key: 'player1', value: player1.username },
      { key: 'roomChat', value: 'Room chat' },
      { key: 'serverChat', value: 'Server messages' },
      { key: 'player2', value: player2.username },
    ];
  });
  messages: Signal<GameMessage[]> = computed(() => this.updateRoomMessages());
  showScrollBotButton = false;
  
  chatControl = new FormControl('', Validators.required);

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

  scrollToBottom(behavior: 'smooth' | 'instant' = 'smooth'): void {
    this.showScrollBotButton = false;
    timer(100).pipe(take(1)).subscribe({
      next: () => {
        this.chatBody?.nativeElement?.scrollTo({ top: 1, left: 0, behavior });
      },
    });
  }

  toggleFilter(filter: keyof Filters): void {
    this.scrollToBottom('instant');
    this.filters.mutate(filters => filters[filter] = !filters[filter]);
  }

  private updateRoomMessages(): GameMessage[] {
    const { messages, game: { history, players } } = this.roomService.room();
    const { player1, player2, roomChat, serverChat } = this.filters();

    type Message = Turn | RoomChat;
    const ordered = (<Message[]>messages)
      .concat(<Message[]>history)
      .filter(message => {
        if ((message as Turn).play) {
          // if turn, return only those with active filters
          return message.user_id === players[0].id ? player1 : player2;
        }
        // if roomMessage return server or user messages depending on filters.
        return message.user_id === SERVER_AUTHOR ? serverChat : roomChat;
      });
    ordered.sort((a, b) => +new Date(a.sent_at) - +new Date(b.sent_at));

    return ordered
      .reduce((gameMessages, message) => {
        const sent_at = +new Date(message.sent_at);
        const author = this.getAuthor(message.user_id);

        if ((message as Turn).play) {
          gameMessages.push({
            author,
            sent_at,
            play: (message as Turn).play,
            hit: (message as Turn).result[0],
            dead: (message as Turn).result[1],
            type: MessageType.Turn,
          });
          return gameMessages;
        }

        const previousMessageMut: GameMessage = gameMessages.at(-1) || {
          type: message.user_id === SERVER_AUTHOR ? MessageType.Server : MessageType.User,
          sent_at: 0,
        };

        if (previousMessageMut.type === MessageType.User && previousMessageMut?.author?.id === message.user_id) {
          previousMessageMut!.message!.push((message as RoomChat).message);
          previousMessageMut!.sent_at = +new Date(message.sent_at);
        } else {
          gameMessages.push({
            type: message.user_id === SERVER_AUTHOR ? MessageType.Server : MessageType.User,
            author: this.getAuthor(message.user_id),
            sent_at: +new Date(message.sent_at),
            message: [(message as RoomChat).message],
          });
        }

        return gameMessages;
      }, [] as GameMessage[])
      .reverse();
  }
}
