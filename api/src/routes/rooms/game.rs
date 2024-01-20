use actix_web::{get, web::{Data, Payload, Path}, HttpResponse, Error};
use actix_web_actors::ws;

use crate::{
  db::AppState,
  routes::rooms::join_room_request::JoinRoomRequest,
  guards::UserFromQueryParams,
  models::{
    error::ErrorResponse,
    ws::GameSocket,
  },
  utils::{user_uuid_from_req, find_or_create_room},
};

#[get("/game/{room_id}")]
pub async fn game(req: UserFromQueryParams, room_request: Path<JoinRoomRequest>, data: Data<AppState>, stream: Payload) -> Result<HttpResponse, Error> {
  let mut rooms = data.rooms.lock().unwrap();
  let join_room = find_or_create_room(&room_request.room_id.to_owned(), &mut rooms);

  // todo: to be moved when I use a real db
  let user_id = match user_uuid_from_req(&req) {
    Ok(uuid) => uuid,
    Err(err) => return Err(Error::from(err)),
  };

  let user = match data.users.lock().unwrap().iter().find(|user| user.id.as_str() == user_id) {
    Some(user) => user.to_owned(),
    None => return Err(Error::from(ErrorResponse::NotFound("User from request token not found"))),
  };

  let game_socket = GameSocket::new(user, join_room.to_owned());
  let resp = ws::start(game_socket, &req.req, stream);

  Ok(resp?)
}
