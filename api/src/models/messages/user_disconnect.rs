use actix::prelude::*;

use super::{
  RoomChat,
  traits::ToServerChat,
};

#[derive(Message)]
#[rtype(result = "()")]
pub struct UserDisconnect {
  pub user_id: String,
  pub username: String,
}
impl ToServerChat for UserDisconnect {
  fn to_user_message(&self) -> RoomChat {
    RoomChat {
      user_id: self.user_id.to_owned(),
      message: format!("{} just disconnected...", self.username.to_string()),
    }
  }
}
