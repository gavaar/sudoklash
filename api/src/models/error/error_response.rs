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
pub enum ErrorResponse<'a> {
  NotFound(&'a str),
  Unauthorized(&'a str),
  BadGateway(&'a str),
}
impl<'a> ErrorResponse<'a> {
  fn error_builder(&self) -> (u16, HttpResponseBuilder, &str) {
    match self {
      ErrorResponse::Unauthorized(message) => (401, HttpResponse::Unauthorized(), message),
      ErrorResponse::NotFound(message) => (404, HttpResponse::NotFound(), message),
      ErrorResponse::BadGateway(message) => (502, HttpResponse::BadGateway(), message),
    }
  }

  pub fn throw(&'a self) -> HttpResponse {
    let (status, mut response_builder, message) = self.error_builder();
    let error_body = ErrorBody { status, message: message.to_string() };

    response_builder.json(error_body)
  }
}

impl<'a> Display for ErrorResponse<'a> {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    let (status, _, message) = self.error_builder();
    write!(f, "{}: {}", status, message)
  }
}
impl<'a> ResponseError for ErrorResponse<'a> {
  fn error_response(&self) -> HttpResponse<BoxBody> {
    self.throw()
  }
}
