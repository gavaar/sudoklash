use actix_web::routes;
use actix_web::{web::{Data, Payload, Path}, HttpResponse, Error};
use actix_web_actors::ws;

use crate::db::AppState;
use crate::guards::UserFromQueryParams;
use crate::models::auth::User;
use crate::models::{
  error::ErrorResponse,
  ws::UserSocket,
};
use crate::utils::{find_or_create_room, user_uuid_from_req};

use super::JoinRoomRequest;

#[routes]
#[get("")]
#[get("/{room_id}")]
pub async fn room(req: UserFromQueryParams, room_request: Path<JoinRoomRequest>, data: Data<AppState>, stream: Payload) -> Result<HttpResponse, Error> {
  let join_room = find_or_create_room(&room_request.room_id, &mut data.rooms.lock().unwrap())?;

  let user_id = match user_uuid_from_req(&req) {
    Ok(uuid) => uuid,
    Err(err) => return Err(Error::from(err)),
  };
  let user: User = match data.users.lock().unwrap().iter().find(|user| user.id == user_id.to_string()) {
    Some(user) => user.to_owned(),
    None => return Err(Error::from(ErrorResponse::NotFound("User from request token not found".to_string()))),
  };

  // todo: to be moved when I use a real db
  let user_socket = UserSocket::new(user, join_room.to_owned());
  let resp = ws::start(user_socket, &req.req, stream);

  Ok(resp?)
}
