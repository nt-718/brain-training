use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct GoogleTokenInfo {
    pub sub: String,          // Google user ID
    pub email: String,
    pub name: String,
    pub picture: Option<String>,
    pub aud: String,          // Client ID
}

/// Verify a Google ID token by calling Google's tokeninfo endpoint.
/// In production, consider using local JWT verification with Google's public keys.
pub async fn verify_google_token(id_token: &str) -> Result<GoogleTokenInfo, String> {
    let url = format!(
        "https://oauth2.googleapis.com/tokeninfo?id_token={}",
        id_token
    );

    let resp = reqwest::get(&url)
        .await
        .map_err(|e| format!("Failed to reach Google: {}", e))?;

    if !resp.status().is_success() {
        return Err("Invalid Google token".to_string());
    }

    let info: GoogleTokenInfo = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse Google response: {}", e))?;

    Ok(info)
}
