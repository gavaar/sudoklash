import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { PlayPadComponent } from '../play-pad/play-pad.component';
import { RoomWsService } from 'src/app/services/websocket/room.wsService';
import { UserService } from 'src/app/services';
import { AsyncSubject, combineLatest, map, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  imports: [NgIf, AsyncPipe, PlayPadComponent],
  selector: 'game-started',
  templateUrl: './game-started.component.html',
  styleUrls: ['./game-started.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameStartedComponent {
  private _destroy$ = new AsyncSubject();
  gameState$ = combineLatest([this.roomService.room$, this.roomService.game$]).pipe(
    map(([room, game]) => {
      const isSitting = room.users.slice(0, 2).find(u => u.id === this.userService.user?.id) != null;
      const currentTurnPlayerId = game.players[game.current_player_turn ? 0 : 1].id;
      const isPlayerTurn = currentTurnPlayerId === this.userService.user?.id;

      return { isSitting, isPlayerTurn };
    }),
    takeUntil(this._destroy$),
  );

  constructor(private roomService: RoomWsService, private userService: UserService) {}

  ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  playTurn(turn: string): void {
    this.roomService.playTurn(turn);
  }
}
