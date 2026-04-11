use serde::{Deserialize, Serialize};
use chrono::NaiveDateTime;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: u64,
    pub google_id: String,
    pub name: String,
    pub email: String,
    pub photo_url: Option<String>,
    pub created_at: NaiveDateTime,
}
