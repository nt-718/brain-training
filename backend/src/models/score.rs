use serde::{Deserialize, Serialize};
use chrono::NaiveDateTime;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Score {
    pub id: u64,
    pub user_id: u64,
    pub game_id: String,
    pub difficulty: String,
    pub score: i32,
    pub is_crown: bool,
    pub played_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct SaveScoreRequest {
    pub game_id: String,
    pub difficulty: String,
    pub score: i32,
    pub is_crown: Option<bool>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct LeaderboardEntry {
    pub rank: i64,
    pub user_name: String,
    pub photo_url: Option<String>,
    pub score: i32,
    pub user_id: u64,
}

#[derive(Debug, Deserialize)]
pub struct LeaderboardQuery {
    pub game_id: String,
    pub difficulty: String,
    pub limit: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct MyScoreQuery {
    pub game_id: String,
    pub difficulty: String,
}

#[derive(Debug, Serialize)]
pub struct MyBestScore {
    pub score: Option<i32>,
    pub rank: Option<i64>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct MyRecord {
    pub game_id: String,
    pub difficulty: String,
    pub max_score: i32,
    pub min_score: i32,
    pub play_count: i64,
    pub has_crown: bool,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct ScoreHistory {
    pub game_id: String,
    pub difficulty: String,
    pub score: i32,
    pub played_at: NaiveDateTime,
}
