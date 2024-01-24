use actix::prelude::*;

#[derive(Message)]
#[rtype(result = "()")]
pub struct UserDisconnect {
  pub user_id: String,
  pub username: String,
}
