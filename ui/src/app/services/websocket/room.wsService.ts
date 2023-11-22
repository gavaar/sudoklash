import { Injectable, signal } from '@angular/core';
import { UserService } from '../user';
import { Observable, filter, take, tap } from 'rxjs';
import { WebSocketManager } from './websocket-manager';
import { environment } from 'src/environments/environment';

export interface RoomUser {
  id: string;
  username: string;
  avatar: string;
}

export interface RoomMessage {
  message: string;
  room_id: string;
  users: RoomUser[];
  sent_at: string; // Date
}
interface UserClientMessage {
  message: string;
  username?: string;
}

export enum GameStatus {
  Awaiting = "Awaiting",
  Started = "Started",
  Ended = "Ended",
}
interface GameUserConnect {
  selection?: number;
}
interface GameUserTurn {
  play: string;
  user_id: string;
}
export interface GameServerTurn extends GameUserTurn {
  result: [number, number];
  played_at: number; // Date
}
export interface GameServerMessage {
  history: GameServerTurn[];
  game_status: GameStatus,
  current_player_turn: boolean; // t = player_0, f = player_1
  players: [RoomUser, RoomUser]
}
type GameUserMessage = GameUserConnect | GameUserTurn;

const WSUrl = `${environment.websocketProtocol}${environment.apiUrl}/v1/rooms`;

@Injectable({ providedIn: 'root' })
export class RoomWsService {
  private roomWs!: WebSocketManager<RoomMessage, UserClientMessage>;
  private gameWs!: WebSocketManager<GameServerMessage, GameUserMessage>;
  private roomId = '';
  private get _playerSelectionMem() {
    return sessionStorage.getItem(`${this.roomId}_selection`) || '';
  }
  private set _playerSelectionMem(s: string) {    
    sessionStorage.setItem(`${this.roomId}_selection`, s.padStart(4, '0'));
  }

  playerSelection = signal('');

  get room$(): Observable<RoomMessage> {
    return this.roomWs.socketUpdates$;
  }
  get game$(): Observable<GameServerMessage> {
    return this.gameWs.socketUpdates$;
  }

  get room(): RoomMessage {
    return this.roomWs.current;
  }

  constructor(private userService: UserService) {}

  /**
   * Awaits for room initialization for component resolver use.
   */
  roomConnect(id: string | null):Observable<RoomMessage> {
    let roomUrl = WSUrl;
    if (id) roomUrl += `/${id}`;
    roomUrl += encodeURI(`?token=${this.userService.token}`);

    this.roomWs = new WebSocketManager<RoomMessage, UserClientMessage>(roomUrl);

    return this.room$.pipe(
      filter(v => v.room_id != null),
      take(1),
      tap(({room_id}) => {
        this.roomId = room_id;
        this.playerSelection.set(this._playerSelectionMem);
        const gameUrl = `${WSUrl}/game/${room_id}?token=${this.userService.token}`;
        this.gameWs = new WebSocketManager<GameServerMessage, GameUserMessage>(gameUrl);
      }),
    );
  }

  destroy(): void {
    this.roomWs.destroy();
    this.gameWs.destroy();
  }

  // ROOM
  sendMessage(message: string) {
    this.roomWs.next({ message });
  }

  // GAME
  playerConnect(selection: number): void {
    this.gameWs.next({ selection });
    this._playerSelectionMem = selection.toString();
    this.playerSelection.set(this._playerSelectionMem);
  }

  playTurn(turn: string): void {
    this.gameWs.next({ play: turn, user_id: this.userService.user!.id });
  }
}
