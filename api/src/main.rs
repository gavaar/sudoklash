
use actix_cors::Cors;
use actix_web::http::header;
use actix_web::middleware::Logger;
use actix_web::{App, HttpServer, web};

mod db;
mod environment;
mod guards;
mod models;
mod utils;
mod routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let db = db::AppState::init();
    let app_data = web::Data::new(db);
    let client_origin = app_data.env.client_origin.to_owned();

    println!("{}", format!("\n\n🚀 Server started successfully on {}:8080", &client_origin));

    HttpServer::new(move || {
        let cors = Cors::default()
            // .allowed_origin("sudoklash.fly.dev") todo: find the correct origins allowed
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![
                header::CONTENT_TYPE,
                header::AUTHORIZATION,
                header::ACCEPT,
            ])
            .expose_headers(vec!["sudo_token"])
            .supports_credentials();

        App::new()
            .app_data(app_data.clone())
            .configure(routes::init)
            .wrap(cors)
            .wrap(Logger::default())
    })
    .bind((client_origin, 8080))?
    .run()
    .await
}
