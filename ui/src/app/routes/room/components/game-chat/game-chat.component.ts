import { DatePipe, NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, Signal, WritableSignal, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AsyncSubject, takeUntil } from 'rxjs';
import { SendButtonComponent } from 'src/app/components/send-button/send-button.component';
import { GameServerMessage, RoomUser, RoomWsService, RoomMessage } from 'src/app/services/websocket/room.wsService';
import { UserMessageComponent } from './messages/user-message.component';
import { UserMessage, GameMessage, ServerMessage, TurnMessage, MessageType } from './models';
import { ServerMessageComponent } from './messages/server-message.component';
import { TurnMessageComponent } from './messages/turn-message.component';

const SERVER_AUTHOR = '_ROOM_';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, NgClass, NgSwitch, NgSwitchCase, DatePipe, ReactiveFormsModule, SendButtonComponent, UserMessageComponent, ServerMessageComponent, TurnMessageComponent],
  selector: 'game-chat',
  templateUrl: './game-chat.component.html',
  styleUrls: ['./game-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameChatComponent implements OnInit, OnDestroy {
  private _destroy$ = new AsyncSubject();
  private roomUsers: WritableSignal<RoomUser[]> = signal([]);
  private serverMessages: WritableSignal<(ServerMessage | UserMessage)[]> = signal([]);
  private turnMessages: WritableSignal<TurnMessage[]> = signal([]);

  MessageType = MessageType;

  colors = ['#A9DEF9aa','#fd5454aa','#BFD2BFaa','#D3F8E2aa','#E4C1F9aa'];
  messages: Signal<GameMessage[]> = computed(() => {
    const allMessages = this.serverMessages().concat(this.turnMessages() as any[]);
    return allMessages.sort((a, b) => b.sent_at - a.sent_at);
  });
  
  chatControl = new FormControl('');

  messageFn = (_: number, message: GameMessage) => message.sent_at;

  constructor(private roomService: RoomWsService) {}

  ngOnInit(): void {
    this.roomService.game$.pipe(takeUntil(this._destroy$)).subscribe({
      next: (game) => this.updateTurnMessages(game),
    });

    this.roomService.room$.pipe(takeUntil(this._destroy$)).subscribe({
      next: (room) => this.updateRoomMessages(room),
    })
  }

  ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  sendMessage(): void {
    if (this.chatControl.value) {
      this.roomService.sendMessage(this.chatControl.value);
      this.chatControl.setValue(null);
    }
  }

  private getAuthor(user_id: string) {
    const author_position = this.roomUsers().findIndex(u => user_id === u.id)!;
    const position: 'left' | 'right' = author_position % 2 == 0 ? 'left' : 'right';
    const color = this.colors[author_position % this.colors.length];
    return { ...this.roomUsers()[author_position], position, color };
  }

  private updateTurnMessages(game: GameServerMessage): void {
    this.turnMessages.set(game.history.map(turn => {
      const sent_at = +new Date(turn.played_at);
      const author = this.getAuthor(turn.user_id);

      return {
        author,
        sent_at,
        play: turn.play,
        hit: turn.result[0],
        dead: turn.result[1],
        type: MessageType.Turn,
      };
    }));
  }

  private updateRoomMessages(room: RoomMessage): void {
    const [author_id, message] = room.message.split('::');
    const sent_at = +new Date(room.sent_at);
    const currentMessages = this.serverMessages();

    this.roomUsers.set(room.users);

    if (author_id === SERVER_AUTHOR) {
      const serverMessage: ServerMessage = {
        message: [message],
        sent_at,
        type: MessageType.Server,
      };

      this.serverMessages.mutate((prev) => prev.push(serverMessage));
      return;
    }

    const author = this.getAuthor(author_id);
    const lastMessageAuthor = currentMessages[currentMessages.length - 1]?.author;

    if (lastMessageAuthor?.id === author.id) {
      this.serverMessages.mutate((prev) => {
        const lastMessage =  prev[prev.length - 1] as UserMessage;
        prev[prev.length - 1] = {
          ...lastMessage,
          sent_at,
          message: [...lastMessage.message, message],
        };
      });
      return;
    }

    this.serverMessages.mutate((prev) => {
      const newMessage: UserMessage = {
        author,
        sent_at,
        type: MessageType.User,
        message: [message],
      };

      prev.push(newMessage);
    });
  }
}
