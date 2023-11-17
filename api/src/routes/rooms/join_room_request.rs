use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct JoinRoomRequest {
  pub room_id: Option<String>
}
