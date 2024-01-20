use reqwest::Client;

use crate::{
  models::{OAuthResponse, error::ErrorResponse},
  environment::Environment,
};

pub async fn request<'a>(
  authorization_code: &'a str,
  environment: &Environment,
) -> Result<OAuthResponse, ErrorResponse<'a>> {
  if authorization_code.is_empty() {
    return Err(ErrorResponse::Unauthorized("Code to request token was invalid or empty"));
  }

  let redirect_url = &environment.google_oauth_redirect_url;
  let client_secret = &environment.google_oauth_client_secret;
  let client_id = &environment.google_oauth_client_id;
  let root_url = "https://oauth2.googleapis.com/token";
  let client = Client::new();

  let params = [
    ("grant_type", "authorization_code"),
    ("redirect_uri", redirect_url.as_str()),
    ("client_id", client_id.as_str()),
    ("code", authorization_code),
    ("client_secret", client_secret.as_str()),
  ];

  let response = client.post(root_url)
    .form(&params)
    .send()
    .await
    .map_err(|_| ErrorResponse::BadGateway("Error posting token to Google"))?;

  response.json::<OAuthResponse>()
    .await
    .map_err(|_| ErrorResponse::BadGateway("Something went wrong when retrieving access token"))
}
