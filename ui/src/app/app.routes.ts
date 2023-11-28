import { Routes, ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { userGuard } from './guards/user.guard';
import { inject } from '@angular/core';
import { RoomWsService } from './services/websocket/room.wsService';
import { tap } from 'rxjs';
import { Location } from '@angular/common';

const roomServiceInitializer: ResolveFn<any> = (route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
  const roomService = inject(RoomWsService);
  const location = inject(Location);
  const roomId = route.paramMap.get('id');

  return roomService.roomConnect(roomId).pipe(
    tap(({room_id}) => location.replaceState(`/room/${room_id}`)),
  );
}

export const routes: Routes = [
  { path: '', loadComponent: () => import('./routes/home/home.component').then(c => c.HomeComponent) },
  { path: 'how-to-play', loadComponent: () => import('./routes/how_to_play/how_to_play.component').then(c => c.HowToPlayComponent) },
  {
    path: 'room',
    children: [
      {
        path: ':id',
        loadComponent: () => import('./routes/room/room.component').then(c => c.RoomComponent),
        resolve: { room: roomServiceInitializer },
      },
      {
        path: '',
        loadComponent: () => import('./routes/room/room.component').then(c => c.RoomComponent),
        resolve: { room: roomServiceInitializer },
      },
    ],
    canActivateChild: [userGuard],
  },
];
