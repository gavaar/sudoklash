use actix_web::{get, web, HttpResponse, Responder};

use crate::db::AppState;
use crate::guards::AuthenticationGuard;

#[get("/users/me")]
pub async fn me(auth_guard: AuthenticationGuard, data: web::Data<AppState>) -> impl Responder {
  let db_data = data.users.lock().unwrap();

  let user = db_data
    .iter()
    .find(|user| user.id == auth_guard.user_id.to_owned());

  HttpResponse::Ok().json(user.unwrap())
}
