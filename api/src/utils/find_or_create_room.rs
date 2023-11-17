use std::{collections::HashMap, str::FromStr};

use actix::{Addr, Actor};
use uuid::Uuid;

use crate::models::{error::ErrorResponse, Room};

fn find_room(room_id: &Option<String>, rooms: &HashMap<Uuid, Addr<Room>>) -> Result<Addr<Room>, ErrorResponse> {
  if let Some(found_room) = room_id {
    if let Ok(room_uuid) = Uuid::from_str(found_room.as_str()) {
      if let Some(found_room) = rooms.get(&room_uuid) {
        Ok(found_room.to_owned())
      }
      else {
        Err(ErrorResponse::NotFound("Room not found".to_string()))
      }
    } else {
      Err(ErrorResponse::Unauthorized(String::from("Could not parse room_id")))
    }
  } else {
    Err(ErrorResponse::NotFound("Room not found".to_string()))
  }
}

pub fn find_or_create_room(room_id: &Option<String>, rooms: &mut HashMap<Uuid, Addr<Room>>) -> Result<Addr<Room>, ErrorResponse> {
  match find_room(room_id, rooms) {
    Ok(found_room) => Ok(found_room),
    Err(ErrorResponse::NotFound(_)) => {
      let new_room = Room::default();
      let new_room_id = new_room.id;
      let new_room_addr = new_room.start();

      rooms.insert(new_room_id, new_room_addr.to_owned());

      Ok(new_room_addr)
    },
    Err(error) => return Err(error)
  }
}
