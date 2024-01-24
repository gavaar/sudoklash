use std::collections::HashMap;
use actix::prelude::*;
use chrono::Utc;
use serde::Serialize;
use uuid::Uuid;
use super::{
  messages::{
    UserDisconnect, UserConnect, RoomChat,
    Player, Turn, RoomUpdate,
  },
  Game,
};
mod room_user;
pub use room_user::RoomUser;

static ROOM_USERNAME: &str = "_ROOM_";

#[derive(Serialize)]
pub struct Room {
  pub id: String,
  pub game: Game,
  pub messages: Vec<RoomChat>,
  pub users: Vec<RoomUser>,
  #[serde(skip_serializing)]
  user_history: HashMap<String, RoomUser>,
}
impl Room {
  fn send_room_update(&self) {
    for user in self.users.iter() {
      user.addr.do_send(self.to_room_update());
    }
  }

  fn to_room_update(&self) -> RoomUpdate {
    let Ok(room_str) = serde_json::to_string(self) else {
      eprintln!("error 500 when parsing room");
      return RoomUpdate(String::new());
    };

    RoomUpdate(room_str)
  }

  fn server_message(&mut self, message: String) {
    let server_chat = RoomChat {
      message,
      user_id: ROOM_USERNAME.to_string(),
      sent_at: Utc::now(),
    };
    self.messages.push(server_chat);
  }
}

impl Default for Room {
  fn default() -> Self {
    Room {
      id: Uuid::new_v4().to_string(),
      game: Game::default(),
      messages: vec![],
      users: vec![],
      user_history: HashMap::new(),
    }
  }
}
impl Actor for Room {
  type Context = Context<Self>;
}
impl Handler<Player> for Room {
  type Result = ();

  fn handle(&mut self, player: Player, _: &mut Self::Context) -> Self::Result {
    if self.game.assing_player(player) {
      self.send_room_update();
    };
  }
}
impl Handler<Turn> for Room {
  type Result = ();

  fn handle(&mut self, turn: Turn, _: &mut Self::Context) -> Self::Result {
    self.game.play_turn(turn);
    self.send_room_update();
  }
}
impl Handler<UserConnect> for Room {
  type Result = ();

  fn handle(&mut self, user_connect_user_socket: UserConnect, _: &mut Self::Context) -> Self::Result {
    if self.users.len() > 9 {
      eprintln!("Room is full");
      return;
    }

    let room_user = if self.user_history.contains_key(&user_connect_user_socket.user.id) {
      let mut user = self.user_history.remove(&user_connect_user_socket.user.id).expect("this should not fail");
      user.addr = user_connect_user_socket.socket_addr.to_owned();
      user
    } else {
      RoomUser {
        join_date: Utc::now(),
        id: user_connect_user_socket.user.id.to_owned(),
        avatar: user_connect_user_socket.user.photo.to_owned(),
        username: user_connect_user_socket.user.name.to_owned(),
        addr: user_connect_user_socket.socket_addr.to_owned(),
      }
    };

    self.server_message(format!("{} connected!", room_user.username));
    self.users.push(room_user);
    self.send_room_update();
  }
}
impl Handler<UserDisconnect> for Room {
  type Result = ();

  fn handle(&mut self, disconnect_msg: UserDisconnect, _: &mut Self::Context) -> Self::Result {
    let Some(user_pos) = self.users.iter().position(|u| u.id == disconnect_msg.user_id) else {
      eprintln!("User was not connected to this room?");
      return;
    };

    let user = self.users.remove(user_pos);
    self.user_history.insert(user.id.to_owned(), user);
    self.server_message(format!("{} just disconnected...", disconnect_msg.username));
    self.send_room_update();
  }
}
impl Handler<RoomChat> for Room {
  type Result = ();

  fn handle(&mut self, room_chat: RoomChat, _: &mut Self::Context) -> Self::Result {
    self.messages.push(room_chat);
    self.send_room_update();
  }
}
