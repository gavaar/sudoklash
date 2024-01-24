use actix::Addr;
use chrono::{DateTime, Utc};
use serde::Serialize;

use crate::models::ws::UserSocket;

#[derive(Serialize, Clone, Debug)]
pub struct RoomUser {
  pub id: String,
  pub username: String,
  pub avatar: String,
  #[serde(skip_serializing)]
  pub addr: Addr<UserSocket>,
  #[serde(skip_serializing)]
  pub join_date: DateTime<Utc>,
}
