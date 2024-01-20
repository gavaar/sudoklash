use chrono::{Utc, Duration};
use jsonwebtoken::{Header, EncodingKey, encode};

use crate::{environment::Environment, models::{TokenClaims, error::ErrorResponse}};

pub fn build<'a>(user_id: &'a String, environment: &Environment) -> Result<String, ErrorResponse<'a>> {
  let jwt_secret = environment.jwt_secret.to_owned();
  let now = Utc::now();
  let iat = now.timestamp() as usize;
  let exp = (now + Duration::minutes(environment.jwt_max_age)).timestamp() as usize;
  let claims: TokenClaims = TokenClaims {
    sub: user_id.to_owned(),
    exp,
    iat,
  };

  encode(
    &Header::default(),
    &claims,
    &EncodingKey::from_secret(jwt_secret.as_ref())
  ).map_err(|_| ErrorResponse::Unauthorized("Error encoding user claims"))
}
