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
  pub fn hit_dead_against_selection(&mut self, selection: &String) {
    self.result = (0, 0);
    let selection_chars: Vec<char> = selection.chars().collect();
    
    self.play.char_indices().for_each(|(index, played_char)| {
      let Some(selection_char) = selection_chars.get(index) else {
        eprintln!("Something went wrong when checking for the play's result at {index}");
        return;
      };

      if selection_char == &played_char { self.result.1 += 1 }
      else if selection_chars.contains(&played_char) { self.result.0 += 1 }       
    });
  }
}
