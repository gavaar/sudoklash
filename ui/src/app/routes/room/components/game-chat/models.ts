import { RoomUser } from 'src/app/services/websocket/room.wsService';

export type PositionedUser = RoomUser & { position: 'left' | 'right', color: string };

export enum MessageType {
  Server,
  User,
  Turn,
}

export interface GameMessage {
  type: MessageType;
  sent_at: number;
  message?: string[];
  author?: PositionedUser;
  play?: string;
  hit?: number;
  dead?: number;
}

export interface ServerMessage extends GameMessage {
  type: MessageType.Server;
  message: [string];
  sent_at: number;
}

export interface UserMessage extends GameMessage {
  type: MessageType.User;
  message: string[];
  sent_at: number;
  author: PositionedUser;
}

export interface TurnMessage extends GameMessage {
  type: MessageType.Turn;
  author: PositionedUser;
  play: string;
  sent_at: number;
  hit: number;
  dead: number;
}
