use uuid::Uuid;

use crate::{guards::UserFromQueryParams, models::error::ErrorResponse};

pub fn user_uuid_from_req(req: &UserFromQueryParams) -> Result<Uuid, ErrorResponse> {
  let user_id = match &req.user_id {
    Some(id) => match Uuid::parse_str(&id) {
      Ok(uuid) => uuid,
      Err(err) => return Err(ErrorResponse::BadGateway(err.to_string())),
    },
    None => return Err(ErrorResponse::Unauthorized(String::from("No token was found from room request"))),
  };

  Ok(user_id)
}
