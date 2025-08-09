mod server;

#[tokio::main]
async fn main() {
    println!("Hello, world!");

    server::Server::new(7000).start().await;
}
