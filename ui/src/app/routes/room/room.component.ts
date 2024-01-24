import { NgClass, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, signal } from '@angular/core';
import { GameStates, RoomWsService } from 'src/app/services/websocket/room.wsService';
import { UserListComponent } from './components/user-list/user-list.component';
import { GameChatComponent } from './components/game-chat/game-chat.component';
import { GameStartedComponent, GameAwaitingComponent } from './components/game-states';
import { UserService } from 'src/app/services';
import { AsyncSubject, fromEvent, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  imports: [NgIf, NgSwitch, NgSwitchCase, NgClass, UserListComponent, GameAwaitingComponent, GameStartedComponent, GameChatComponent],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomComponent implements OnDestroy {
  private _destroy = new AsyncSubject();

  GameStates = GameStates;
  showCopyMessage = true;
  copyAddressMessage = signal('Click to copy this room address');
  playerSelection = this.roomService.playerSelection;

  gameState = computed(() => {
    const room = this.roomService.room();
    return {
      status: room.game.game_status,
      myTurn: this.isMyTurn(room.game),
      oponent: room?.game.players.find(p => p.id !== this.userService.user?.id),
    }
  });

  constructor(private userService: UserService, private roomService: RoomWsService) {
    this.disableBrowserBackBehavior();
  }

  ngOnDestroy(): void {
    this.roomService.destroy();
    this._destroy.next(true);
    this._destroy.complete();
  }

  onShareRoom() {
    if (navigator.canShare()) {
      navigator.share({
        title: 'Hit or dead',
        text: 'Let\'s play a game of hit or dead!',
        url: location.href,
      });
    } else {
      navigator.clipboard.writeText(location.href);
      this.copyAddressMessage.set('✅ Copied!');
      setTimeout(() => {
        this.copyAddressMessage.set('Click to copy this room address');
      }, 2000)
    }
  }

  private isMyTurn(game: { current_player_turn: boolean; players: [{ id: string }, { id: string }] } | null): boolean {
    if (!game) return false;

    return game.players[+(!game.current_player_turn)].id === this.userService.user?.id;
  }

  private disableBrowserBackBehavior(): void {
    history.pushState(null, '');
    history.forward();

    fromEvent(window, 'popstate').pipe(
      takeUntil(this._destroy),
    ).subscribe(() => history.pushState(null, ''));
  }
}
