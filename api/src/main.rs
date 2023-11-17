
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

    println!("\n\n🚀 Server started successfully on localhost:8000");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:4200")
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
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}
