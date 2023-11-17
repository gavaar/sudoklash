use std::sync::MutexGuard;
use chrono::Utc;
use serde::Deserialize;
use uuid::Uuid;

use crate::models::auth::User;

#[derive(Deserialize)]
pub struct GoogleUser {
  pub id: String,
  pub email: String,
  pub verified_email: bool,
  pub name: String,
  pub given_name: String,
  pub family_name: String,
  pub picture: String,
}
impl GoogleUser {
  // dbwork: use a real database;
  pub fn to_user<'a>(&self, db_data: &mut MutexGuard<'_, Vec<User>>) -> User {
    let datetime = Utc::now();
    let email = self.email.to_lowercase();
    let user_result = db_data.iter_mut().find(|user| user.email == email);

    if let Some(user) = user_result {
      let mut updated = user.updatedAt;

      if user.name != self.name {
        user.name = self.name.to_owned();
        updated = datetime;
      }
      if user.email != email {
        user.email = email.to_owned();
        updated = datetime;
      }
      if user.photo != self.picture {
        user.photo = self.picture.to_owned();
        updated = datetime;
      }

      user.updatedAt = updated;

      return user.to_owned();
    } else {
      let user_data = User {
        id: Uuid::new_v4().to_string(),
        name: self.name.to_owned(),
        email,
        provider: "Google".to_string(),
        photo: self.picture.to_owned(),
        createdAt: datetime,
        updatedAt: datetime,
      };

      db_data.push(user_data.to_owned());
      return user_data;
    }
  }
}
