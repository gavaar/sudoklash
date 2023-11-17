use reqwest::{Client, Url};

use crate::models::{error::ErrorResponse, GoogleUser};

pub async fn info(access_token: &str, id_token: &str) -> Result<GoogleUser, ErrorResponse> {
  let client = Client::new();

  let mut url = Url::parse("https://www.googleapis.com/oauth2/v1/userinfo").unwrap();
  url.query_pairs_mut().append_pair("alt", "json");
  url.query_pairs_mut().append_pair("access_token", access_token);

  let response = client.get(url)
    .bearer_auth(id_token)
    .send()
    .await
    .map_err(|_|
      ErrorResponse::BadGateway("An error occurred while trying to retrieve user information.".to_owned())
    )?;

  response.json::<GoogleUser>()
    .await
    .map_err(|_|
      ErrorResponse::BadGateway("An error occurred while trying to parse user information.".to_owned())
    )
}
