import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoomWsService } from 'src/app/services/websocket/room.wsService';

@Component({
  standalone: true,
  selector: 'home',
  imports: [RouterLink, NgIf, NgClass],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  roomId?: string;

  constructor(private roomService: RoomWsService) {}

  ngOnInit(): void {
    this.roomId = this.roomService.room()?.id;
  }
}
