use core::fmt;
use std::fmt::Display;

use actix_web::{HttpResponse, HttpResponseBuilder, ResponseError, body::BoxBody};
use serde::Serialize;

#[derive(Serialize)]
struct ErrorBody {
  pub status: u16,
  pub message: String,
}

#[derive(Debug)]
pub enum ErrorResponse {
  NotFound(String),
  Unauthorized(String),
  BadGateway(String),
}
impl ErrorResponse {
  fn error_builder(&self) -> (u16, HttpResponseBuilder, String) {
    match self {
      ErrorResponse::Unauthorized(message) => (401, HttpResponse::Unauthorized(), message.to_owned()),
      ErrorResponse::NotFound(message) => (404, HttpResponse::NotFound(), message.to_owned()),
      ErrorResponse::BadGateway(message) => (502, HttpResponse::BadGateway(), message.to_owned()),
    }
  }

  pub fn throw(&self) -> HttpResponse {
    let (status, mut response_builder, message) = self.error_builder();
    let error_body = ErrorBody { status, message };

    response_builder.json(error_body)
  }
}

impl Display for ErrorResponse {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    let (status, _, message) = self.error_builder();
    write!(f, "{}: {}", status, message)
  }
}
impl ResponseError for ErrorResponse {
  fn error_response(&self) -> HttpResponse<BoxBody> {
    self.throw()
  }
}
