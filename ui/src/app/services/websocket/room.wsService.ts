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
  type: 'PlayerConnect',
  selection?: number;
}
interface GameUserTurn {
  type: 'Turn',
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

  room = signal<RoomMessage | null>(null);
  game = signal<GameServerMessage | null>(null);

  constructor(private userService: UserService) {}

  /**
   * Awaits for room initialization for component resolver use.
   */
  roomConnect(id: string | null):Observable<RoomMessage> {
    let roomUrl = WSUrl;
    if (id) roomUrl += `/${id}`;
    roomUrl += encodeURI(`?token=${this.userService.token}`);

    this.roomWs = new WebSocketManager<RoomMessage, UserClientMessage>(roomUrl);

    return this.roomWs.socketUpdates$.pipe(
      take(1),
      tap(({room_id}) => {
        this.roomId = room_id;
        this.playerSelection.set(this._playerSelectionMem);
        const gameUrl = `${WSUrl}/game/${room_id}?token=${this.userService.token}`;
        this.gameWs = new WebSocketManager<GameServerMessage, GameUserMessage>(gameUrl);
        this.connectSignals();
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
    this.gameWs.next({ type: 'PlayerConnect', selection });
    this._playerSelectionMem = selection.toString();
    this.playerSelection.set(this._playerSelectionMem);
  }

  playTurn(turn: string): void {
    this.gameWs.next({ type: 'Turn', play: turn, user_id: this.userService.user!.id });
  }

  private connectSignals(): void {
    this.roomWs.socketUpdates$.subscribe((r) => this.room.set(r))
    this.gameWs.socketUpdates$.subscribe((r) => this.game.set(r))
  }
}
