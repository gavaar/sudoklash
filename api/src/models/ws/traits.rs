use std::time::{Duration, Instant};

use actix::{StreamHandler, Actor, AsyncContext, ActorContext};
use actix_web_actors::ws;

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);
const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

pub trait DefaultHandler
where Self: Actor<Context = ws::WebsocketContext<Self>> + StreamHandler<Result<ws::Message, ws::ProtocolError>> {
  fn get_hb(&self) -> Instant;
  fn set_hb(&mut self, instant: Instant);
  fn text_handler(&self, text: impl ToString);

  fn default_handler(&mut self, ctx: &mut ws::WebsocketContext<Self>, item: Result<ws::Message, ws::ProtocolError>) {
    let Ok(msg) = item else {
      ctx.stop();
      return;
    };

    match msg {
      ws::Message::Text(text) => {
        self.text_handler(text);
      }
      ws::Message::Ping(ping_msg) => {
        self.set_hb(Instant::now());
        ctx.pong(&ping_msg);
      }
      ws::Message::Pong(_) => {
        self.set_hb(Instant::now());
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

  fn hb(&self, ctx: &mut ws::WebsocketContext<Self>) {
    ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
      if Instant::now().duration_since(act.get_hb()) > CLIENT_TIMEOUT {
        println!("Coyo e su badre, se desconecto el menor!");

        ctx.stop();

        return;
      }

      ctx.ping(b"ping");
    });
  }
}
