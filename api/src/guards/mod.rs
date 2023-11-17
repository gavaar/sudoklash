use std::future::{ready, Ready};
use serde::Deserialize;
use actix_web::{
    dev::Payload,
    http, web, FromRequest, HttpRequest,
};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};

use crate::{
    db::AppState,
    models::{TokenClaims, error::ErrorResponse}
};

fn extract_user_from_token(token: &str, db_data: &web::Data<AppState>) -> Option<String> {
    let jwt_secret = db_data.env.jwt_secret.to_owned();
    let decode: Result<jsonwebtoken::TokenData<TokenClaims>, jsonwebtoken::errors::Error> = decode::<TokenClaims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_ref()),
        &Validation::new(Algorithm::HS256),
    );

    match decode {
        Ok(result) => {
            let db_data = db_data.users.lock().unwrap();
            let user = db_data
                .iter()
                .find(|user| user.id == result.claims.sub.to_owned());

            if let None = user {
                return None;
            }
            
            Some(result.claims.sub)
        }
        Err(_) => None,
    }
}

fn extract_user_from_req(req: &HttpRequest) -> Option<String> {
    let token = req.headers()
        .get(http::header::AUTHORIZATION)
        .map(|h|
            h.to_str().unwrap().split_at(7).1.to_owned()
        );

    if let None = token {
        return None;
    }

    let db_data: &web::Data<AppState> = req.app_data::<web::Data<AppState>>().unwrap();

    extract_user_from_token(token.unwrap().as_str(), db_data)
}


#[derive(Deserialize, Debug)]
struct QueryParams {
  token: String,
}

pub struct UserFromQueryParams {
    pub user_id: Option<String>,
    pub req: HttpRequest,
}
impl FromRequest for UserFromQueryParams {
    type Error = ErrorResponse;
    type Future = Ready<Result<Self, ErrorResponse>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let token = match web::Query::<QueryParams>::from_query(req.query_string()) {
            Ok(token_response) => token_response.token.to_owned(),
            Err(_) => return ready(Err(ErrorResponse::BadGateway("Wrong query params".to_string()))),
        };
        let db_data: &web::Data<AppState> = req.app_data::<web::Data<AppState>>().unwrap();
   
        ready(Ok(UserFromQueryParams { user_id: extract_user_from_token(token.as_str(), db_data), req: req.to_owned() }))
    }
}

pub struct AuthenticatedUser {
    pub user_id: Option<String>,
    pub req: HttpRequest,
}
impl FromRequest for AuthenticatedUser {
    type Error = ErrorResponse;
    type Future = Ready<Result<Self, ErrorResponse>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        ready(Ok(AuthenticatedUser { user_id: extract_user_from_req(req), req: req.to_owned() }))
    }
}

pub struct AuthenticationGuard {
    pub user_id: String,
}
impl FromRequest for AuthenticationGuard {
    type Error = ErrorResponse;
    type Future = Ready<Result<Self, ErrorResponse>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let user = extract_user_from_req(req);
        if let None = user {
            return ready(Err(ErrorResponse::Unauthorized("You need to login to see that".to_string())));
        }

        ready(Ok(AuthenticationGuard { user_id: user.unwrap() }))
    }
}
