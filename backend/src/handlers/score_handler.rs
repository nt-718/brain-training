use axum::{
    extract::{Query, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use sqlx::MySqlPool;

use crate::auth::jwt;
use crate::config::Config;
use crate::models::score::{
    LeaderboardEntry, LeaderboardQuery, MyBestScore, MyScoreQuery, SaveScoreRequest,
};

/// Extract user_id from Authorization header
fn extract_user_id(headers: &HeaderMap, jwt_secret: &str) -> Result<u64, (StatusCode, String)> {
    let auth_header = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::UNAUTHORIZED, "Missing Authorization header".to_string()))?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or((StatusCode::UNAUTHORIZED, "Invalid Authorization format".to_string()))?;

    let claims = jwt::verify_jwt(token, jwt_secret)
        .map_err(|e| (StatusCode::UNAUTHORIZED, format!("Invalid token: {}", e)))?;

    Ok(claims.sub)
}

/// POST /api/scores — Save a score (JWT required)
pub async fn save_score(
    State((pool, config)): State<(MySqlPool, Config)>,
    headers: HeaderMap,
    Json(body): Json<SaveScoreRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    let user_id = extract_user_id(&headers, &config.jwt_secret)?;

    sqlx::query(
        "INSERT INTO scores (user_id, game_id, difficulty, score, is_crown) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(user_id)
    .bind(&body.game_id)
    .bind(&body.difficulty)
    .bind(body.score)
    .bind(body.is_crown.unwrap_or(false))
    .execute(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))?;

    Ok(StatusCode::CREATED)
}

/// GET /api/scores/leaderboard — Get top scores for a game+difficulty
pub async fn leaderboard(
    State((pool, _config)): State<(MySqlPool, Config)>,
    Query(q): Query<LeaderboardQuery>,
) -> Result<Json<Vec<LeaderboardEntry>>, (StatusCode, String)> {
    let limit = q.limit.unwrap_or(10).min(100);

    let entries: Vec<LeaderboardEntry> = if q.difficulty == "all" {
        sqlx::query_as(
            r#"SELECT
                 CAST(RANK() OVER (ORDER BY s.best_score DESC) AS SIGNED) as `rank`,
                 u.name as user_name,
                 u.photo_url,
                 s.best_score as score,
                 u.id as user_id
               FROM (
                 SELECT user_id, MAX(score) as best_score
                 FROM scores
                 WHERE game_id = ?
                 GROUP BY user_id
               ) s
               JOIN users u ON u.id = s.user_id
               ORDER BY s.best_score DESC
               LIMIT ?"#,
        )
        .bind(&q.game_id)
        .bind(limit)
        .fetch_all(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))?
    } else {
        sqlx::query_as(
            r#"SELECT
                 CAST(RANK() OVER (ORDER BY s.best_score DESC) AS SIGNED) as `rank`,
                 u.name as user_name,
                 u.photo_url,
                 s.best_score as score,
                 u.id as user_id
               FROM (
                 SELECT user_id, MAX(score) as best_score
                 FROM scores
                 WHERE game_id = ? AND difficulty = ?
                 GROUP BY user_id
               ) s
               JOIN users u ON u.id = s.user_id
               ORDER BY s.best_score DESC
               LIMIT ?"#,
        )
        .bind(&q.game_id)
        .bind(&q.difficulty)
        .bind(limit)
        .fetch_all(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))?
    };

    Ok(Json(entries))
}

/// GET /api/scores/me — Get my best score for a game+difficulty
pub async fn my_score(
    State((pool, config)): State<(MySqlPool, Config)>,
    headers: HeaderMap,
    Query(q): Query<MyScoreQuery>,
) -> Result<Json<MyBestScore>, (StatusCode, String)> {
    let user_id = extract_user_id(&headers, &config.jwt_secret)?;

    // Get my best score
    let best: Option<(i32,)> = sqlx::query_as(
        "SELECT MAX(score) FROM scores WHERE user_id = ? AND game_id = ? AND difficulty = ?",
    )
    .bind(user_id)
    .bind(&q.game_id)
    .bind(&q.difficulty)
    .fetch_optional(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))?;

    let score = best.and_then(|b| Some(b.0));

    // Get my rank
    let rank: Option<(i64,)> = if score.is_some() {
        sqlx::query_as(
            r#"SELECT COUNT(*) + 1
               FROM (
                 SELECT user_id, MAX(score) as best_score
                 FROM scores
                 WHERE game_id = ? AND difficulty = ?
                 GROUP BY user_id
               ) s
               WHERE s.best_score > ?"#,
        )
        .bind(&q.game_id)
        .bind(&q.difficulty)
        .bind(score.unwrap())
        .fetch_optional(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))?
    } else {
        None
    };

    Ok(Json(MyBestScore {
        score,
        rank: rank.map(|r| r.0),
    }))
}

/// GET /api/scores/global — Get global ranking (sum of each user's best score per game)
pub async fn global_ranking(
    State((pool, _config)): State<(MySqlPool, Config)>,
) -> Result<Json<Vec<LeaderboardEntry>>, (StatusCode, String)> {
    let entries: Vec<LeaderboardEntry> = sqlx::query_as(
        r#"SELECT
             CAST(RANK() OVER (ORDER BY total DESC) AS SIGNED) as `rank`,
             u.name as user_name,
             u.photo_url,
             CAST(total AS SIGNED) as score,
             u.id as user_id
           FROM (
             SELECT user_id, SUM(has_crown) as total
             FROM (
               SELECT user_id, game_id, MAX(CAST(is_crown AS UNSIGNED)) as has_crown
               FROM scores
               GROUP BY user_id, game_id
             ) per_game
             GROUP BY user_id
           ) agg
           JOIN users u ON u.id = agg.user_id
           ORDER BY total DESC
           LIMIT 10"#,
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))?;

    Ok(Json(entries))
}

/// GET /api/scores/global/weekly — Get weekly global ranking (crowns earned in the last 7 days)
pub async fn weekly_global_ranking(
    State((pool, _config)): State<(MySqlPool, Config)>,
) -> Result<Json<Vec<LeaderboardEntry>>, (StatusCode, String)> {
    let entries: Vec<LeaderboardEntry> = sqlx::query_as(
        r#"SELECT
             CAST(RANK() OVER (ORDER BY total DESC) AS SIGNED) as `rank`,
             u.name as user_name,
             u.photo_url,
             CAST(total AS SIGNED) as score,
             u.id as user_id
           FROM (
             SELECT user_id, SUM(has_crown) as total
             FROM (
               SELECT user_id, game_id, MAX(CAST(is_crown AS UNSIGNED)) as has_crown
               FROM scores
               WHERE played_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
               GROUP BY user_id, game_id
             ) per_game
             GROUP BY user_id
           ) agg
           JOIN users u ON u.id = agg.user_id
           ORDER BY total DESC
           LIMIT 10"#,
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))?;

    Ok(Json(entries))
}
