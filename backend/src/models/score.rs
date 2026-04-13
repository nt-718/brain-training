use serde::{Deserialize, Serialize};
use chrono::NaiveDateTime;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Score {
    pub id: u64,
    pub user_id: u64,
    pub game_id: String,
    pub difficulty: String,
    pub score: f64,
    pub is_crown: bool,
    pub played_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct SaveScoreRequest {
    pub game_id: String,
    pub difficulty: String,
    pub score: f64,
    pub is_crown: Option<bool>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct LeaderboardEntry {
    pub rank: i64,
    pub user_name: String,
    pub photo_url: Option<String>,
    pub score: f64,
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
    pub score: Option<f64>,
    pub rank: Option<i64>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct MyRecord {
    pub game_id: String,
    pub difficulty: String,
    pub max_score: f64,
    pub min_score: f64,
    pub play_count: i64,
    pub has_crown: bool,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct ScoreHistory {
    pub game_id: String,
    pub difficulty: String,
    pub score: f64,
    pub played_at: NaiveDateTime,
}
