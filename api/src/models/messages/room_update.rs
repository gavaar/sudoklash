use actix::Message;

#[derive(Message)]
#[rtype(result = "()")]
pub struct RoomUpdate(pub String);
