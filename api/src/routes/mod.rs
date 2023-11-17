mod ping;
mod rooms;
pub mod sessions;
mod users;

use actix_web::web;

pub fn init(conf: &mut web::ServiceConfig) {
  let scope = web::scope("/v1")
    .service(ping::ping)
    .service(users::me)
    .configure(rooms::routes)
    .configure(sessions::routes);

  conf.service(scope);
}
