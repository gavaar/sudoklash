use actix_web::{get, web::{Data, Payload, Path}, HttpResponse, Error};
use actix_web_actors::ws;

use crate::{
  db::AppState,
  routes::rooms::join_room_request::JoinRoomRequest,
  guards::UserFromQueryParams,
  models::{
    error::ErrorResponse,
    auth::User,
    ws::GameSocket,
  },
  utils::{user_uuid_from_req, find_or_create_room},
};

#[get("/game/{room_id}")]
pub async fn game(req: UserFromQueryParams, room_request: Path<JoinRoomRequest>, data: Data<AppState>, stream: Payload) -> Result<HttpResponse, Error> {
  let join_room = find_or_create_room(&room_request.room_id.to_owned(), &mut data.rooms.lock().unwrap())?;

  // todo: to be moved when I use a real db
  let user_id = match user_uuid_from_req(&req) {
    Ok(uuid) => uuid,
    Err(err) => return Err(Error::from(err)),
  };
  let user: User = match data.users.lock().unwrap().iter().find(|user| user.id == user_id.to_string()) {
    Some(user) => user.to_owned(),
    None => return Err(Error::from(ErrorResponse::NotFound("User from request token not found".to_string()))),
  };

  let game_socket = GameSocket::new(user, join_room);
  let resp = ws::start(game_socket, &req.req, stream);

  Ok(resp?)
}
