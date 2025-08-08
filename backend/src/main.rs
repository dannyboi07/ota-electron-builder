mod server;

#[tokio::main]
async fn main() {
    println!("Hello, world!");

    server::Server::new(9000).start().await;
}
