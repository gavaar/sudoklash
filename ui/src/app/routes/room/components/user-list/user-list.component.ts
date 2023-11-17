import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, map, of, switchMap } from 'rxjs';
import { NameplateComponent } from 'src/app/components/nameplate/nameplate.component';
import { RoomWsService } from 'src/app/services/websocket/room.wsService';

@Component({
  standalone: true,
  selector: 'user-list',
  imports: [NgIf, NgFor, NgClass, AsyncPipe, NameplateComponent],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  open = new BehaviorSubject(false);

  userMessage = this.roomService.room$;
  gameMessage = this.roomService.game$;
  restUsers = this.open.pipe(
    switchMap((opened: boolean) => {
      if (!opened) {
        return of([]);
      }

      return this.roomService.room$.pipe(map(roomUsers => roomUsers.users.slice(2)));
    }),
  );

  readonly GRAY_IMG = 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';

  restUsersFn = (_i: number, user: { id: string }) => user.id;

  constructor(private roomService: RoomWsService) {}
}
