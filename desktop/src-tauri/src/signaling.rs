use anyhow::Result;
use futures_util::{SinkExt, StreamExt};
use tauri::{AppHandle, Manager};
use tokio::net::TcpListener;
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::Message;

pub async fn start(
    port: u16,
    app: AppHandle,
) -> Result<mpsc::Sender<String>> {
    let (tx, mut rx) = mpsc::channel::<String>(32);
    let addr = format!("0.0.0.0:{}", port);
    let listener = TcpListener::bind(&addr).await?;
    log::info!("Signaling server listening on {}", addr);

    tokio::spawn(async move {
        if let Ok((stream, peer)) = listener.accept().await {
            log::info!("Mobile connected from {}", peer);
            app.emit_all("mobile-connection", true).ok();

            let ws = tokio_tungstenite::accept_async(stream).await.unwrap();
            let (mut ws_tx, mut ws_rx) = ws.split();

            // Forward messages from Tauri -> Mobile
            let fwd = tokio::spawn(async move {
                while let Some(msg) = rx.recv().await {
                    ws_tx.send(Message::Text(msg)).await.ok();
                }
            });

            // Forward messages from Mobile -> Tauri events
            while let Some(Ok(msg)) = ws_rx.next().await {
                if let Message::Text(text) = msg {
                    app.emit_all("signaling-message", text).ok();
                }
            }

            fwd.abort();
            log::info!("Mobile disconnected");
            app.emit_all("mobile-connection", false).ok();
        }
    });

    Ok(tx)
}
