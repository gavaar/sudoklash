use actix::prelude::*;

use super::traits::ToServerChat;

#[derive(Message, Clone)]
#[rtype(result = "()")]
pub struct RoomChat {
  pub user_id: String,
  pub message: String,
}
impl ToServerChat for RoomChat {
  fn to_user_message(&self) -> RoomChat { self.to_owned() }
}
