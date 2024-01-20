use std::{sync::{Arc, Mutex}, collections::HashMap};

use actix::Addr;

use crate::{
  models::{
    auth::User,
    Room
  },
  environment::Environment,
};

pub struct AppState {
  pub users: Arc<Mutex<Vec<User>>>,
  pub rooms: Arc<Mutex<HashMap<String, Addr<Room>>>>,
  pub env: Environment,
}
impl AppState {
  pub fn init() -> AppState {
    AppState {
      users: Arc::new(Mutex::new(Vec::new())),
      rooms: Arc::new(Mutex::new(HashMap::new())),
      env: Environment::init(),
    }
  }
}
