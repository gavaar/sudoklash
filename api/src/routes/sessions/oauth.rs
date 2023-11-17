use actix_web::{get, web, Responder, HttpResponse};
use crate::{
  db::AppState,
  models::{OAuthResponse, GoogleUserQuery},
};

mod users;
pub mod access_token;

//https://accounts.google.com/o/oauth2/auth?scope=https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email&response_type=code&access_type=offline&redirect_uri=http://localhost:8000/v1/sessions/oauth/google&client_id=921222346302-33pgvo300556qde30v87ot2gqmeikp87.apps.googleusercontent.com
#[get("/oauth/google")]
pub async fn google(query: web::Query<GoogleUserQuery>, data: web::Data<AppState>) -> impl Responder {
  let token_response: OAuthResponse = match access_token::request(&query.code, &data.env).await {
    Ok(token) => token,
    Err(error) => return error.throw(),
  };

  let google_user = match users::info(&token_response.access_token, &token_response.id_token).await {
    Ok(google_user) => google_user,
    Err(error) => return error.throw(),
  };

  let user = google_user.to_user(&mut data.users.lock().unwrap());
  let token_result = access_token::build(&user.id, &data.env);

  match token_result {
    Err(e) => e.throw(),
    Ok(token) =>
      HttpResponse::Found()
        .append_header(("sudo_token", token))
        .finish(),
  }
}
