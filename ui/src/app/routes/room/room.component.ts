import { NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, signal } from '@angular/core';
import { GameStatus, RoomWsService } from 'src/app/services/websocket/room.wsService';
import { UserListComponent } from './components/user-list/user-list.component';
import { GameChatComponent } from './components/game-chat/game-chat.component';
import { GameStartedComponent, GameAwaitingComponent } from './components/game-states';
import { UserService } from 'src/app/services';

@Component({
  standalone: true,
  imports: [NgIf, NgSwitch, NgSwitchCase, UserListComponent, GameAwaitingComponent, GameStartedComponent, GameChatComponent],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomComponent implements OnDestroy {
  GameStatus = GameStatus;
  showCopyMessage = true;
  copyAddressMessage = signal('Click to copy this room address');
  playerSelection = this.roomService.playerSelection;

  gameState = computed(() => {
    const game = this.roomService.game();
    return {
      status: game?.game_status,
      myTurn: this.isMyTurn(game),
    }
  });

  constructor(private userService: UserService, private roomService: RoomWsService) {}

  ngOnDestroy(): void {
    this.roomService.destroy();
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

    return game.players[game.current_player_turn ? 0 : 1].id === this.userService.user?.id;
  }
}
