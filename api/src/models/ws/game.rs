use std::time::{Instant, Duration};

use actix::prelude::*;
use actix_web_actors::ws::{WebsocketContext, self};

use crate::models::{
  messages::{PlayerConnect, Player, UserConnect, Tick, UserDisconnect},
  Room,
  turn::Turn,
  auth::User
};

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

// separate game (state) from gamers (socket)
pub struct GameSocket {
  user: User,
  room_addr: Addr<Room>,
  hb: Instant,
}
impl GameSocket {
  pub fn new(user: User, room_addr: Addr<Room>) -> GameSocket {
    GameSocket {
      user,
      room_addr,
      hb: Instant::now(),
    }
  }

  // logic duplicated in user_socket. Extract?
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
impl Actor for GameSocket {
  type Context = WebsocketContext<Self>;

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
}
impl Handler<Tick> for GameSocket {
  type Result = ();

  fn handle(&mut self, tick: Tick, ctx: &mut Self::Context) -> Self::Result {
    let message = serde_json::to_string(&tick.0).unwrap_or(String::default());
    ctx.text(message);
  }
}
impl Handler<UserDisconnect> for GameSocket {
  type Result = ();

  fn handle(&mut self, _: UserDisconnect, ctx: &mut Self::Context) -> Self::Result {
    ctx.stop();
  }
}
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for GameSocket {
  fn handle(&mut self, item: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
    let msg = match item {
      Err(_) => {
        ctx.stop();
        return;
      }
      Ok(msg) => msg
    };

    match msg {
      ws::Message::Text(text) => {
        let turn_result: Result<Turn, _> = serde_json::from_str(text.to_string().as_str());
        if let Ok(turn) = turn_result {
          self.room_addr.do_send(turn);
          return;
        }

        let connect_result: Result<PlayerConnect, _> = serde_json::from_str(text.to_string().as_str());
        if let Ok(connect) = connect_result {
          let player = Player {
            id: self.user.id.to_owned(),
            avatar: self.user.photo.to_owned(),
            username: self.user.name.to_owned(),
            selection: connect.selection,
          };
          self.room_addr.do_send(player);
          return;
        }

        eprintln!("Game message was not understood");
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
