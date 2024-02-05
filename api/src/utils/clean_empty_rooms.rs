use std::collections::HashMap;

use actix::Addr;

use crate::models::Room;


pub fn clear_empty_rooms(rooms: &mut HashMap<String, Addr<Room>>) {
  rooms.retain(|_, room_addr: &mut Addr<Room>| room_addr.connected());
}
