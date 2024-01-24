use std::time::Instant;

use actix::prelude::*;
use actix_web_actors::ws;
use chrono::Utc;
use serde::Deserialize;

use crate::models::{
  Room,
  messages::{UserConnect, UserDisconnect, RoomChat, PlayerConnect, Turn, Player},
};

use crate::models::auth::User;

mod traits;
use traits::DefaultHandler;

use super::messages::RoomUpdate;

#[derive(Deserialize)]
struct UserChat {
  message: String,
}

#[derive(Deserialize)]
#[serde(tag = "type")]
enum UserMessage {
  PlayerConnect(PlayerConnect),
  Turn(Turn),
  UserChat(UserChat),
}

pub struct UserSocket {
  user: User,
  hb: Instant,
  room_addr: Addr<Room>,
}
impl UserSocket {
  pub fn new(user: User, room_addr: Addr<Room>) -> UserSocket {
    UserSocket { user, room_addr, hb: Instant::now() }
  }
}
impl Actor for UserSocket {
  type Context = ws::WebsocketContext<Self>;

  fn started(&mut self, ctx: &mut Self::Context) {
    self.hb(ctx);

    let user = self.user.to_owned();
    let socket_addr = ctx.address();

    self.room_addr
      .send(UserConnect { user, socket_addr })
      .into_actor(self)
      .then(|res, _, ctx| {
        match res {
          Ok(_) => (),
          _ => ctx.stop(),
        }
        fut::ready(())
      })
      .wait(ctx);
  }

  fn stopping(&mut self, _: &mut Self::Context) -> actix::Running {
    let user_id = self.user.id.to_owned();
    let username = self.user.name.to_owned();
    self.room_addr.do_send(UserDisconnect { user_id, username });
    Running::Stop
  }
}
impl Handler<RoomUpdate> for UserSocket {
  type Result = (); 

  fn handle(&mut self, msg: RoomUpdate, ctx: &mut Self::Context) -> Self::Result {
    ctx.text(msg.0);
  }
}
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for UserSocket {
  fn handle(&mut self, item: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
    self.default_handler(ctx, item);
  }
}
impl DefaultHandler for UserSocket {
  fn get_hb(&self) -> Instant { self.hb }
  fn set_hb(&mut self, instant: Instant) { self.hb = instant; }

  fn text_handler(&self, text: impl ToString) {
    let Ok(understood_message) = serde_json::from_str(text.to_string().as_str()) else {
      return eprintln!("game message not understood");
    };

    match understood_message {
      UserMessage::Turn(turn) => self.room_addr.do_send(turn),
      UserMessage::PlayerConnect(PlayerConnect { selection }) => {
        let player = Player {
          selection,
          id: self.user.id.to_owned(),
          avatar: self.user.photo.to_owned(),
          username: self.user.name.to_owned(),
        };
        self.room_addr.do_send(player);
      }
      UserMessage::UserChat(UserChat { message }) => {
        let room_chat = RoomChat {
          message,
          user_id: self.user.id.to_owned(),
          sent_at: Utc::now(),
        };
        self.room_addr.do_send(room_chat);
      }
    }
  }
}
