use actix_web::{get, HttpResponse, Responder, web, HttpRequest};

use crate::{
  guards::AuthenticationGuard,
  models::auth::User,
  db::AppState,
};

mod oauth;

#[get("/temp_user")]
async fn temp_user(_: HttpRequest, data: web::Data<AppState>) -> impl Responder {
  let db_data = &mut data.users.lock().unwrap();
  let user = User::temp();
  let token = oauth::access_token::build(&user.id, &data.env);
  match token {
    Err(e) => e.throw(),
    Ok(token) => {
      db_data.push(user);

      HttpResponse::Ok()
        .append_header(("sudo_token", token))
        .finish()
    }
  }
}

#[get("/logout")]
async fn logout(_: AuthenticationGuard) -> impl Responder {
  HttpResponse::Ok()
    .append_header(("sudo_token", ""))
    .finish()
}

pub fn routes(conf: &mut web::ServiceConfig) {
  let scope = web::scope("/sessions")
    .service(temp_user)
    .service(logout)
    .service(oauth::google);

  conf.service(scope);
}
