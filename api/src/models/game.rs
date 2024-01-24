use std::collections::HashSet;

use chrono::Utc;
use serde::Serialize;

use super::messages::{Player, Turn};

#[derive(PartialEq, Serialize, Clone)]
pub enum GameStatus {
  Awaiting,
  Started,
  Ended,
}

// separate game (state) from gamers (socket)
#[derive(Serialize, Clone)]
pub struct Game {
  pub history: Vec<Turn>,
  pub game_status: GameStatus,
  pub current_player_turn: bool, // true = 1, false = 0
  pub players: (Player, Player),
}
impl Default for Game {
  fn default() -> Self {
    Game {
      players: (Player::empty(), Player::empty()),
      history: Vec::new(),
      current_player_turn: true,
      game_status: GameStatus::Awaiting,
    }
  }
}
impl Game {
  // return true if user could join
  pub fn assing_player(&mut self, player: Player) -> bool {
    if self.players.0.id == player.id ||
       self.players.1.id == player.id {
      eprintln!("You have already joined!");
      return false;
    }

    if self.players.0.id.is_empty() {
      self.players.0 = player;
      return true;
    } else if self.players.1.id.is_empty() {
      self.players.1 = player;
      self.game_status = GameStatus::Started;
      return true;
    } else {
      eprintln!("Can't join game: two users are already playing");
      return false;
    }
  }

  // TODO: lot's of cloning here
  pub fn play_turn(&mut self, mut new_turn: Turn) {
    if self.game_status == GameStatus::Awaiting {
      eprintln!("Game has not started!!");
      return;
    }

    let (current_player, enemy_player) = if self.current_player_turn
      { (self.players.0.to_owned(), self.players.1.to_owned()) } else
      { (self.players.1.to_owned(), self.players.0.to_owned()) };

    if new_turn.user_id != current_player.id {
      eprintln!("It's not the players turn");
      return;
    }

    let str_play = new_turn.play.to_string();
    let chars = str_play.chars().into_iter();
    let play_chars: HashSet<char> = chars.to_owned().collect();

    // if original input is less than 4, or any got removed by being duplicated, we err.
    if play_chars.len() != 4 || str_play.len() != 4 {
      eprintln!("Wrong number of characters on play");
      return;
    }

    new_turn.hit_dead_against_selection(enemy_player.selection);
    new_turn.sent_at = Utc::now();

    if new_turn.result.1 == 4 {
      self.game_status = GameStatus::Ended;
    }

    self.history.push(new_turn.to_owned());
    self.current_player_turn = !self.current_player_turn;
  }
}
