use actix::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Deserialize)]
pub struct PlayerConnect {
  pub selection: String,
}

#[derive(Serialize, Message, Debug, Clone)]
#[rtype(result = "()")]
pub struct Player {
  pub id: String,
  pub username: String,
  pub avatar: String,
  #[serde(skip_serializing)]
  pub selection: String,
}
impl Player {
  pub fn empty() -> Player {
    Player {
      id: String::from(""),
      avatar: String::from(""),
      username: String::from(""),
      selection: String::from(""),
    }
  }
}
