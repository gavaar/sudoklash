use actix::prelude::*;
use chrono::{DateTime, Utc};
use serde::Serialize;

use crate::models::room::RoomUser;

#[derive(Message, Serialize, Clone)]
#[rtype(result = "()")]
pub struct ServerChat {
  pub room_id: String,
  pub users: Vec<RoomUser>,
  pub message: String,
  pub sent_at: DateTime<Utc>,
}
