import { AsyncPipe, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { map } from 'rxjs';
import { GameStatus, RoomWsService } from 'src/app/services/websocket/room.wsService';
import { UserListComponent } from './components/user-list/user-list.component';
import { GameChatComponent } from './components/game-chat/game-chat.component';
import { GameStartedComponent, GameAwaitingComponent } from './components/game-states';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  standalone: true,
  imports: [NgIf, NgSwitch, NgSwitchCase, AsyncPipe, UserListComponent, GameAwaitingComponent, GameStartedComponent, GameChatComponent],
  template: `
  <section class="room">
    <div *ngIf="showCopyMessage"
      class="room__invite"
      (click)="onShareRoom()">
      <span class="room__invite-message">{{ copyAddressMessage() }}</span>
      <span class="room__invite-close" (click)="showCopyMessage = false">X</span>
    </div>
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
  styles: [`
    .room {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .room__invite {
      display: flex;
      font-size: 0.8rem;
      padding: 0.25rem;
      text-align: center;
      background: var(--black);
      color: var(--white);
      line-height: 1rem;
    }

    .room__invite-message {
      margin: auto;
    }

    .room__invite-close {
      opacity: 0.7;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomComponent implements OnDestroy {
  GameStatus = GameStatus;
  showCopyMessage = true;
  copyAddressMessage = signal('Click to copy this room address');

  gameState$ = this.roomService.game$.pipe(
    map(game => game.game_status),
  );

  constructor(private roomService: RoomWsService, private route: Router) {}

  ngOnDestroy(): void {
    this.roomService.destroy();
  }

  onShareRoom() {
    if (navigator.canShare()) {
      navigator.share({
        title: 'Hit or dead',
        text: 'Let\'s play a game of hit or dead!',
        url: `${environment.baseUrl}/${this.route.url}`,
      });
    } else {
      navigator.clipboard.writeText(`${environment.baseUrl}/${this.route.url}`);
      this.copyAddressMessage.set('✅ Copied!');
      setTimeout(() => {
        this.copyAddressMessage.set('Click to copy this room address');
      }, 2000)
    }
  }
}
