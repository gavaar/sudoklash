use actix::prelude::*;
use chrono::{DateTime, Utc};
use serde::Serialize;

#[derive(Message, Serialize, Clone)]
#[rtype(result = "()")]
pub struct RoomChat {
  pub user_id: String,
  pub message: String,
  pub sent_at: DateTime<Utc>,
}
