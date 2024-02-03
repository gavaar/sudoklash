import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RoomWsService } from 'src/app/services/websocket/room.wsService';
import { PlayPadComponent } from '../play-pad/play-pad.component';
import { NameplateComponent } from 'src/app/components/nameplate/nameplate.component';
import { UserService } from 'src/app/services';

@Component({
  standalone: true,
  imports: [NgIf, PlayPadComponent, NameplateComponent],
  selector: 'game-awaiting',
  templateUrl: './game-awaiting.component.html',
  styleUrls: ['./game-awaiting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameAwaitingComponent {
  gameState = computed(() => {
    const room = this.roomService.room();

    if (!room) {
      return { isSitting: false, alreadyJoined: false };
    }

    const isSitting = room.users.slice(0, 2).find(u => u.id === this.userService.user?.id) != null;
    const alreadyJoined = room.game.players.find(p => p.id === this.userService.user?.id) != null;

    return { isSitting, alreadyJoined };
  });

  constructor(private roomService: RoomWsService, private userService: UserService) {}

  connectToGame(value: string): void {
    this.roomService.playerConnect(value);
  }
}
