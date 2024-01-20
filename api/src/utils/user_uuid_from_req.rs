use uuid::Uuid;

use crate::{guards::UserFromQueryParams, models::error::ErrorResponse};

pub fn user_uuid_from_req(req: &UserFromQueryParams) -> Result<String, ErrorResponse<'static>> {
  let Some(found_token_id) = &req.user_id else {
    return Err(ErrorResponse::Unauthorized("No token was found from room request"));
  };

  if Uuid::parse_str(&found_token_id).is_err() {
    return Err(ErrorResponse::Unauthorized("Wrong token format"));
  }

  return Ok(found_token_id.to_owned());
}
