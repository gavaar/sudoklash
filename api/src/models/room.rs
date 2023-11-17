use std::{collections::HashMap, time::Instant};

use actix::prelude::*;
use uuid::Uuid;
use serde::Serialize;

use super::{
  ws::{GameSocket, UserSocket},
  messages::{
    ServerChat, UserDisconnect, UserConnect, RoomChat,
    traits::ToServerChat, Player, Tick
  },
  Game, Turn, GameStatus
};

#[derive(Serialize, Clone, Debug)]
pub struct RoomUser {
  id: String,
  username: String,
  avatar: String,
  #[serde(skip_serializing)]
  addr: Addr<UserSocket>,
  #[serde(skip_serializing)]
  pub join_date: Instant,
}

pub struct Room {
  pub id: Uuid,
  pub game: Game,
  pub users: HashMap<String, RoomUser>,
  pub gamers: HashMap<String, Addr<GameSocket>>,
}
impl Default for Room {
  fn default() -> Self {
    Room {
      id: Uuid::new_v4(),
      game: Game::new(),
      users: HashMap::new(),
      gamers: HashMap::new(),
    }
  }
}

impl Actor for Room {
  type Context = Context<Self>;
}

impl Handler<Player> for Room {
  type Result = ();

  fn handle(&mut self, player_message: Player, _: &mut Self::Context) -> Self::Result {
    self.game.assing_player(player_message);
    self.send_game_update();
  }
}

impl Handler<Turn> for Room {
  type Result = ();

  fn handle(&mut self, turn: Turn, _: &mut Self::Context) -> Self::Result {
    self.game.play_turn(turn);
    self.send_game_update();
    if self.game.game_status == GameStatus::Ended {
      self.close_game();
    }
  }
}

impl Handler<UserConnect<GameSocket>> for Room {
  type Result = ();

  fn handle(&mut self, user_connect_game_socket: UserConnect<GameSocket>, _: &mut Self::Context) -> Self::Result {
    self.gamers.insert(user_connect_game_socket.user.id, user_connect_game_socket.socket_addr);
    self.send_game_update();
  }
}

impl Handler<UserConnect<UserSocket>> for Room {
  type Result = ();

  fn handle(&mut self, user_connect_user_socket: UserConnect<UserSocket>, _: &mut Self::Context) -> Self::Result {
    if self.users.len() > 5 {
      eprintln!("Room is full");
      return;
    }

    let room_user = RoomUser {
      id: user_connect_user_socket.user.id.to_owned(),
      avatar: user_connect_user_socket.user.photo.to_owned(),
      username: user_connect_user_socket.user.name.to_owned(),
      join_date: Instant::now(),
      addr: user_connect_user_socket.socket_addr.to_owned(),
    };

    self.users.insert(room_user.id.to_owned(), room_user);
    
    let bot_message = user_connect_user_socket.to_chat_message(self, "_ROOM_");
    self.send_message(bot_message, None);
  }
}

impl Handler<UserDisconnect> for Room {
  type Result = ();

  fn handle(&mut self, disconnect_msg: UserDisconnect, _: &mut Self::Context) -> Self::Result {
    if let Some(_user) = self.users.remove(&disconnect_msg.user_id) {
      let message = disconnect_msg.to_chat_message(self, "_ROOM_");
      self.send_message(message, Some(&disconnect_msg.user_id));
    }
  }
}

impl Handler<RoomChat> for Room {
  type Result = ();

  fn handle(&mut self, connect_msg: RoomChat, _: &mut Self::Context) -> Self::Result {
    self.send_message(connect_msg.to_chat_message(self, &connect_msg.user_id), None);
  }
}

impl Room {
  fn send_message(&self, message: ServerChat, id_to_skip: Option<&String>) {
    self.users.iter().for_each(|user| {
      if Some(user.0) != id_to_skip {
        let _ = user.1.addr.do_send(message.to_owned());
      }
    });
  }

  fn send_game_update(&self) {
    self.gamers.iter().for_each(|gamer| {
      gamer.1.do_send(Tick(self.game.to_owned()))
    });
  }

  fn close_game(&self) {
    self.gamers.iter().for_each(|gamer| {
      let user_id = gamer.0;
      let username = self.users.get(user_id).unwrap().username.to_owned();
      gamer.1.do_send(UserDisconnect { user_id: user_id.to_owned(), username });
    });
  }
}
