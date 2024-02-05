import { Injectable, signal } from '@angular/core';
import { UserService } from '../user';
import { Observable, take, tap } from 'rxjs';
import { WebSocketManager } from './websocket-manager';
import { environment } from 'src/environments/environment';

enum UserMessages {
  UserChat = 'UserChat',
  PlayerConnect = 'PlayerConnect',
  Turn = 'Turn',
}

export enum GameStates {
  Awaiting = "Awaiting",
  Started = "Started",
  Ended = "Ended",
}

interface UserChat {
  type: UserMessages.UserChat,
  message: string;
}

interface PlayerConnect {
  type: UserMessages.PlayerConnect,
  selection?: string;
}
export interface Turn {
  type: UserMessages.Turn,
  play: string;
  user_id: string;
  result: [number, number];
  sent_at: string; // Date
}

export interface Game {
  history: Turn[];
  game_status: GameStates;
  current_player_turn: boolean;
  players: [RoomUser, RoomUser];
  result: [string, string];
}

export interface RoomChat {
  user_id: string;
  message: string;
  sent_at: string; // Date
}

export interface RoomUser {
  id: string;
  username: string;
  avatar: string;
}

export interface RoomUpdate {
  id: string;
  game: Game;
  messages: RoomChat[];
  users: RoomUser[];
}

type UserMessage = PlayerConnect | Omit<Turn, 'result' | 'sent_at'> | UserChat;

const WSUrl = `${environment.websocketProtocol}${environment.apiUrl}/v1/rooms`;

const EMPTY_ROOM = {
  id: '',
  game: {
    current_player_turn: true,
    game_status: GameStates.Awaiting,
    history: [],
    players: <RoomUpdate['game']['players']>[
      { id: '', avatar: '', username: '' },
      { id: '', avatar: '', username: '' },
    ],
    result: ['', ''] as [string, string],
  },
  messages: [],
  users: [],
};

@Injectable({ providedIn: 'root' })
export class RoomWsService {
  private roomWs!: WebSocketManager<RoomUpdate, UserMessage>;
  private roomId = '';
  private get _playerSelectionMem() {
    return sessionStorage.getItem(`${this.roomId}_selection`) || '';
  }
  private set _playerSelectionMem(s: string) {    
    sessionStorage.setItem(`${this.roomId}_selection`, s.padStart(4, '0'));
  }

  playerSelection = signal('');

  room = signal<RoomUpdate>(EMPTY_ROOM);

  constructor(private userService: UserService) {}

  /**
   * Awaits for room initialization for component resolver use.
   */
  roomConnect(id: string | null):Observable<RoomUpdate> {
    let roomUrl = WSUrl;
    if (id) roomUrl += `/${id}`;
    roomUrl += encodeURI(`?token=${this.userService.token}`);

    this.roomWs = new WebSocketManager(roomUrl);

    return this.roomWs.socketUpdates$.pipe(
      take(1),
      tap((room) => {
        this.roomId = room.id;
        this.playerSelection.set(this._playerSelectionMem);
        this.connectSignals();
      }),
    );
  }

  destroy(): void {
    this.roomWs.destroy();
  }

  sendMessage(message: string) {
    this.roomWs.next({ message, type: UserMessages.UserChat });
  }

  playerConnect(selection: string): void {
    this.roomWs.next({ type: UserMessages.PlayerConnect, selection });
    this._playerSelectionMem = selection.toString();
    this.playerSelection.set(this._playerSelectionMem);
  }

  playTurn(turn: string): void {
    this.roomWs.next({ type:UserMessages.Turn, play: turn, user_id: this.userService.user!.id });
  }

  resetRoomMemory(): void {
    this.room.set(EMPTY_ROOM);
  }

  private connectSignals(): void {
    this.roomWs.socketUpdates$.subscribe((r) => this.room.set(r))
  }
}
