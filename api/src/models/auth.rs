mod google_user;
mod user;

use serde::{Serialize, Deserialize};

pub use google_user::GoogleUser;
pub use user::User;

#[derive(Deserialize)]
pub struct OAuthResponse {
  pub access_token: String,
  pub id_token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenClaims {
  pub sub: String,
  pub iat: usize,
  pub exp: usize,
}

#[derive(Debug, Deserialize)]
pub struct GoogleUserQuery {
  pub code: String,
}
