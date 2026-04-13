mod auth;
mod config;
mod db;
mod handlers;
mod models;

use axum::{routing::{get, patch, post}, Router};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;
use tracing_subscriber;

use crate::config::Config;
use crate::handlers::{auth_handler, score_handler};

#[tokio::main]
async fn main() {
    // Load .env
    dotenvy::dotenv().ok();

    // Init tracing
    tracing_subscriber::fmt::init();

    // Load config
    let config = Config::from_env();
    let port = config.port;

    // Connect to DB
    let pool = db::create_pool(&config.database_url).await;
    tracing::info!("Connected to MySQL");

    // Run migrations (split into individual statements since sqlx doesn't support multi-statement)
    let migration_sql = include_str!("../migrations/001_init.sql");
    for stmt in migration_sql.split(';') {
        let stmt = stmt.trim();
        if !stmt.is_empty() {
            sqlx::query(stmt).execute(&pool).await.ok();
        }
    }
    let migration_sql2 = include_str!("../migrations/002_add_is_crown.sql");
    for stmt in migration_sql2.split(';') {
        let stmt = stmt.trim();
        if !stmt.is_empty() {
            sqlx::query(stmt).execute(&pool).await.ok();
        }
    }
    let migration_sql3 = include_str!("../migrations/003_add_display_name.sql");
    for stmt in migration_sql3.split(';') {
        let stmt = stmt.trim();
        if !stmt.is_empty() {
            sqlx::query(stmt).execute(&pool).await.ok();
        }
    }
    tracing::info!("Migrations applied");

    // Shared state: (pool, config)
    let state = (pool, config);

    // CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Static file serving: serve the frontend from parent directory
    // In production, nginx handles this; locally, the Rust server serves everything
    let static_dir = std::env::var("STATIC_DIR")
        .unwrap_or_else(|_| "../".to_string());
    tracing::info!("Serving static files from: {}", static_dir);

    // Routes: API routes first, then fallback to static files
    let app = Router::new()
        .route("/api/auth/google", post(auth_handler::google_auth))
        .route("/api/auth/config", get(auth_handler::auth_config))
        .route("/api/user/display_name", patch(auth_handler::update_display_name))
        .route("/api/scores", post(score_handler::save_score))
        .route("/api/scores/leaderboard", get(score_handler::leaderboard))
        .route("/api/scores/global", get(score_handler::global_ranking))
        .route("/api/scores/global/weekly", get(score_handler::weekly_global_ranking))
        .route("/api/scores/my/records", get(score_handler::my_records))
        .route("/api/scores/my/history", get(score_handler::my_history))
        .route("/api/scores/me", get(score_handler::my_score))
        .layer(cors)
        .with_state(state)
        .fallback_service(ServeDir::new(&static_dir));

    let addr = format!("0.0.0.0:{}", port);
    tracing::info!("Server starting on http://localhost:{}", port);

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind");

    axum::serve(listener, app)
        .await
        .expect("Server error");
}
