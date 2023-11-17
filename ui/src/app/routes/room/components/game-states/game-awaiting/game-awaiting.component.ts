import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { RoomWsService } from 'src/app/services/websocket/room.wsService';
import { PlayPadComponent } from '../play-pad/play-pad.component';
import { NameplateComponent } from 'src/app/components/nameplate/nameplate.component';
import { UserService } from 'src/app/services';
import { AsyncSubject, combineLatest, map, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  imports: [NgIf, AsyncPipe, PlayPadComponent, NameplateComponent],
  selector: 'game-awaiting',
  templateUrl: './game-awaiting.component.html',
  styleUrls: ['./game-awaiting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameAwaitingComponent implements OnDestroy {
  private _destroy$ = new AsyncSubject();
  gameState$ = combineLatest([this.roomService.room$, this.roomService.game$]).pipe(
    map(([room, game]) => {
      const isSitting = room.users.slice(0, 2).find(u => u.id === this.userService.user?.id) != null;
      const alreadyJoined = game.players.find(p => p.id === this.userService.user?.id) != null;

      return { isSitting, alreadyJoined };
    }),
    takeUntil(this._destroy$),
  );

  constructor(private roomService: RoomWsService, private userService: UserService) {}

  ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  connectToGame(value: string): void {
    this.roomService.playerConnect(+value);
  }
}
