use std::collections::HashMap;

use actix::{Addr, Actor};

use crate::models::Room;

fn create_new_room(rooms: &mut HashMap<String, Addr<Room>>) -> &Addr<Room> {
  let new_room = Room::default();
  let new_room_id = new_room.id.to_owned();
  rooms.insert(new_room.id.to_owned(), new_room.start());

  rooms.get(&new_room_id).unwrap()
}

pub fn find_or_create_room<'a>(room_id: &Option<String>, rooms: &'a mut HashMap<String, Addr<Room>>) -> &'a Addr<Room> {
  if room_id.is_none() || !rooms.contains_key(room_id.as_ref().unwrap()) {
    return create_new_room(rooms);
  }
 
  return rooms.get(room_id.as_ref().unwrap()).unwrap();
}
