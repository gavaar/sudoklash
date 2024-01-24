use actix::Message;
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};

#[derive(Message, Serialize, Deserialize, Clone)]
#[rtype(result = "()")]
pub struct Turn {
  pub play: String,
  pub user_id: String,
  // (hit, dead)
  #[serde(skip_deserializing)]
  pub result: (u8, u8),
  #[serde(skip_deserializing)]
  pub sent_at: DateTime<Utc>,
}
impl Turn {
  pub fn hit_dead_against_selection(&mut self, selection: u16) {
    self.result = (0, 0);
    let mut selection_chars: Vec<char> = selection.to_string().chars().collect();
    if selection_chars.len() < 4 {
      selection_chars.push('0');
      selection_chars.rotate_right(1);
    }
    self.play.to_string().char_indices().for_each(|(index, played_char)| {
      match selection_chars.get(index) {
        Some(selection_char) => {
          if selection_char == &played_char { self.result.1 += 1 }
          else if selection_chars.contains(&played_char) { self.result.0 += 1 }
        }
        _ => eprintln!("Something went wrong when checking for the play's result"),
      }
    });
  }
}
