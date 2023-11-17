use actix::Message;

use crate::models::Game;

#[derive(Message)]
#[rtype(result = "()")]
pub struct Tick(pub Game);
