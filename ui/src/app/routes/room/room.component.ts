import { AsyncPipe, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { map } from 'rxjs';
import { GameStatus, RoomWsService } from 'src/app/services/websocket/room.wsService';
import { UserListComponent } from './components/user-list/user-list.component';
import { GameChatComponent } from './components/game-chat/game-chat.component';
import { GameStartedComponent, GameAwaitingComponent } from './components/game-states';

@Component({
  standalone: true,
  imports: [NgIf, NgSwitch, NgSwitchCase, AsyncPipe, UserListComponent, GameAwaitingComponent, GameStartedComponent, GameChatComponent],
  template: `
  <section style="display: flex; flex-direction: column; height: 100%">
    <user-list></user-list>
    <game-chat></game-chat>
    <ng-container [ngSwitch]="gameState$ | async">
      <!-- todo: combine awaiting and started in one -->
      <game-awaiting *ngSwitchCase="GameStatus.Awaiting"></game-awaiting>
      <game-started *ngSwitchCase="GameStatus.Started">Started!</game-started>
      <!-- <div *ngSwitchCase="GameStatus.Ended">Ended!</div> -->
    </ng-container>
  </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomComponent implements OnDestroy {
  GameStatus = GameStatus;

  gameState$ = this.roomService.game$.pipe(
    map(game => game.game_status),
  );

  constructor(private roomService: RoomWsService) {}

  ngOnDestroy(): void {
    this.roomService.destroy();
  }
}
