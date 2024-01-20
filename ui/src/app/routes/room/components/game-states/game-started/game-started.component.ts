import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { NgIf } from '@angular/common';
import { PlayPadComponent } from '../play-pad/play-pad.component';
import { RoomWsService } from 'src/app/services/websocket/room.wsService';
import { UserService } from 'src/app/services';

@Component({
  standalone: true,
  imports: [NgIf, PlayPadComponent],
  selector: 'game-started',
  templateUrl: './game-started.component.html',
  styleUrls: ['./game-started.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameStartedComponent {
  gameState = computed(() => {
    const room = this.roomService.room();
    const game = this.roomService.game();

    if (!game || !room) {
      return { isSitting: false, isPlayerTurn: false };
    }

    const isSitting = game.players.find(p => p.id === this.userService.user?.id) != null;
    const currentTurnPlayerId = game.players[game.current_player_turn ? 0 : 1].id;
    const isPlayerTurn = currentTurnPlayerId === this.userService.user?.id;

    return { isSitting, isPlayerTurn };
  });

  constructor(private roomService: RoomWsService, private userService: UserService) {}

  playTurn(turn: string): void {
    this.roomService.playTurn(turn);
  }
}
