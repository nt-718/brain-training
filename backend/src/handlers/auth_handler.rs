use axum::{extract::State, http::{HeaderMap, StatusCode}, Json};
use serde::{Deserialize, Serialize};
use sqlx::MySqlPool;

use crate::auth::{google, jwt};
use crate::config::Config;

#[derive(Deserialize)]
pub struct GoogleAuthRequest {
    pub id_token: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserInfo,
}

#[derive(Serialize)]
pub struct UserInfo {
    pub id: u64,
    pub name: String,
    pub display_name: Option<String>,
    pub email: String,
    pub photo_url: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateDisplayNameRequest {
    pub display_name: String,
}

pub async fn google_auth(
    State((pool, config)): State<(MySqlPool, Config)>,
    Json(body): Json<GoogleAuthRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, String)> {
    // 1. Verify the Google ID token
    let google_info = google::verify_google_token(&body.id_token)
        .await
        .map_err(|e| (StatusCode::UNAUTHORIZED, e))?;

    // 2. Optionally verify audience matches our client ID
    if !config.google_client_id.is_empty() && google_info.aud != config.google_client_id {
        return Err((
            StatusCode::UNAUTHORIZED,
            "Token audience mismatch".to_string(),
        ));
    }

    // 3. Upsert user
    sqlx::query(
        r#"INSERT INTO users (google_id, name, email, photo_url)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name = VALUES(name),
             email = VALUES(email),
             photo_url = VALUES(photo_url)"#,
    )
    .bind(&google_info.sub)
    .bind(&google_info.name)
    .bind(&google_info.email)
    .bind(&google_info.picture)
    .execute(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))?;

    // 4. Fetch the user to get their ID and display_name
    let row: (u64, String, Option<String>, String, Option<String>) = sqlx::query_as(
        "SELECT id, name, display_name, email, photo_url FROM users WHERE google_id = ?",
    )
    .bind(&google_info.sub)
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))?;

    let (user_id, name, display_name, email, photo_url) = row;

    // 5. Create JWT
    let token = jwt::create_jwt(user_id, &name, &config.jwt_secret)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("JWT error: {}", e)))?;

    Ok(Json(AuthResponse {
        token,
        user: UserInfo {
            id: user_id,
            name,
            display_name,
            email,
            photo_url,
        },
    }))
}

/// GET /api/auth/config — Return the Google Client ID for frontend initialization
pub async fn auth_config(
    State((_pool, config)): State<(MySqlPool, Config)>,
) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "google_client_id": config.google_client_id
    }))
}

/// PATCH /api/user/display_name — Update the logged-in user's display name
pub async fn update_display_name(
    State((pool, config)): State<(MySqlPool, Config)>,
    headers: HeaderMap,
    Json(body): Json<UpdateDisplayNameRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    // Verify JWT
    let auth_header = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::UNAUTHORIZED, "Missing Authorization header".to_string()))?;
    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or((StatusCode::UNAUTHORIZED, "Invalid Authorization format".to_string()))?;
    let claims = crate::auth::jwt::verify_jwt(token, &config.jwt_secret)
        .map_err(|e| (StatusCode::UNAUTHORIZED, format!("Invalid token: {}", e)))?;

    let display_name = body.display_name.trim().to_string();
    if display_name.is_empty() || display_name.len() > 50 {
        return Err((StatusCode::BAD_REQUEST, "display_name must be 1–50 characters".to_string()));
    }

    sqlx::query("UPDATE users SET display_name = ? WHERE id = ?")
        .bind(&display_name)
        .bind(claims.sub)
        .execute(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))?;

    Ok(Json(serde_json::json!({ "display_name": display_name })))
}
