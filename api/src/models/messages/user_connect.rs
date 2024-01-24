use actix::prelude::*;

use crate::models::{auth::User, ws::UserSocket};

#[derive(Message, Clone)]
#[rtype(result = "()")]
pub struct UserConnect {
  pub user: User,
  pub socket_addr: Addr<UserSocket>,
}