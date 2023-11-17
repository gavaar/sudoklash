use actix_web::{web, Responder};
use actix_web::{get, HttpResponse};
use serde_json::json;

mod game;
mod join_room_request;
mod room;

use join_room_request::JoinRoomRequest;

#[get("/ping")]
async fn ping() -> impl Responder {
  HttpResponse::Ok().json(json!({"status": "success", "message": "Pong from ROOMS :D"}))
}

pub fn routes(conf: &mut web::ServiceConfig) {
  let scope = web::scope("/rooms")
    .service(ping)
    .service(game::game)
    .service(room::room);

  conf.service(scope);
}
