import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NameplateComponent } from 'src/app/components/nameplate/nameplate.component';
import { RoomWsService } from 'src/app/services/websocket/room.wsService';

@Component({
  standalone: true,
  selector: 'user-list',
  imports: [NgIf, NgFor, NgClass, NameplateComponent],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  opened = signal(false);

  userMessage = this.roomService.room;
  gameMessage = this.roomService.game;

  restUsers = computed(() => {
    const users = this.userMessage()?.users;
    if (!this.opened() || !users)  {
      return [];
    }
    
    return users.slice(2);
  });

  readonly GRAY_IMG = 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';

  restUsersFn = (_i: number, user: { id: string }) => user.id;

  constructor(private roomService: RoomWsService) {}
}
