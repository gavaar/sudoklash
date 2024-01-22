use std::time::{Instant, Duration};

use actix::prelude::*;
use actix_web_actors::ws;
use serde::Deserialize;

use crate::models::{
  Room,
  messages::{UserConnect, UserDisconnect, ServerChat, RoomChat}
};

use crate::models::auth::User;

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

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

  // logic duplicated in game_socket. Extract?
  pub fn hb(&self, ctx: &mut ws::WebsocketContext<Self>) {
    ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
      if Instant::now().duration_since(act.hb) > CLIENT_TIMEOUT {
          println!("Coyo e su badre, se desconecto el menor!");

          ctx.stop();

          return;
      }

      ctx.ping(b"ping");
    });
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
    let Ok(msg) = item else {
      ctx.stop();
      return;
    };

    match msg {
      ws::Message::Text(text) => {
        let Ok(UserMessage { message }) = serde_json::from_str(text.to_string().as_str()) else {
          return eprintln!("user message not understood");
        };
        self.room_addr.do_send(RoomChat { user_id: self.user.id.to_owned(), message });
      }
      ws::Message::Ping(ping_msg) => {
        self.hb = Instant::now();
        ctx.pong(&ping_msg);
      }
      ws::Message::Pong(_) => {
        self.hb = Instant::now();
      }
      ws::Message::Binary(bin) => ctx.binary(bin),
      ws::Message::Close(reason) => {
        ctx.close(reason);
        ctx.stop();
      }
      ws::Message::Continuation(_) => {
        ctx.stop();
      }
      ws::Message::Nop => (),
    }
  }
}
