use std::time::Instant;

use actix::prelude::*;
use actix_web_actors::ws;
use serde::Deserialize;

use crate::models::{
  Room,
  messages::{UserConnect, UserDisconnect, ServerChat, RoomChat}
};

use crate::models::auth::User;

use super::traits::DefaultHandler;

#[derive(Deserialize)]
struct UserMessage {
  message: String,
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
impl Handler<ServerChat> for UserSocket {
  type Result = ();
  
  fn handle(&mut self, msg: ServerChat, ctx: &mut Self::Context) -> Self::Result {
    let ws_message = serde_json::to_string(&msg).unwrap_or(String::from(r#"{ error: "UserSocket: error deserializing" }"#));
    ctx.text(ws_message);
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
    let Ok(UserMessage { message }) = serde_json::from_str(text.to_string().as_str()) else {
      return eprintln!("user message not understood");
    };
    self.room_addr.do_send(RoomChat { user_id: self.user.id.to_owned(), message });
  }
}
