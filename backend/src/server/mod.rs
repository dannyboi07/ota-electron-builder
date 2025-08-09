use axum::{Router, response::Json, routing::get};
use serde_json::{Value, json};
use tower_http::cors::{Any, CorsLayer};

pub struct Server {
    port: u64,
}

impl Server {
    pub fn new(port: u64) -> Self {
        Server { port }
    }

    pub async fn start(self) {
        let cors = CorsLayer::new()
            .allow_origin(Any)
            .allow_headers(Any)
            .allow_methods(Any);
        let app = Router::new().route("/", get(root)).layer(cors);

        let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", self.port))
            .await
            .unwrap();

        axum::serve(listener, app).await.unwrap();
    }
}

async fn root() -> Json<Value> {
    Json(json!({ "status": "success", "data": "Hello World!" }))
}
