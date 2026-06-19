#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod signaling;
mod virtual_camera;

use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;

#[derive(Default)]
struct AppState {
    signaling_tx: Option<tokio::sync::mpsc::Sender<String>>,
    virtual_cam_active: bool,
}

type State = Arc<Mutex<AppState>>;

#[tauri::command]
async fn start_signaling_server(
    port: u16,
    state: tauri::State<'_, State>,
    app: tauri::AppHandle,
) -> Result<(), String> {
    let state = Arc::clone(&state);
    let tx = signaling::start(port, app).await.map_err(|e| e.to_string())?;
    state.lock().await.signaling_tx = Some(tx);
    Ok(())
}

#[tauri::command]
async fn stop_signaling_server(state: tauri::State<'_, State>) -> Result<(), String> {
    state.lock().await.signaling_tx = None;
    Ok(())
}

#[tauri::command]
async fn send_signaling_message(
    message: String,
    state: tauri::State<'_, State>,
) -> Result<(), String> {
    if let Some(tx) = &state.lock().await.signaling_tx {
        tx.send(message).await.map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn set_virtual_camera_active(
    active: bool,
    state: tauri::State<'_, State>,
) -> Result<(), String> {
    state.lock().await.virtual_cam_active = active;
    virtual_camera::set_active(active);
    Ok(())
}

#[tauri::command]
async fn push_frame_to_virtual_camera(frame: Vec<u8>) -> Result<(), String> {
    virtual_camera::push_frame(&frame).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_local_ip() -> String {
    local_ip_address::local_ip()
        .map(|ip| ip.to_string())
        .unwrap_or_else(|_| "127.0.0.1".to_string())
}

#[tokio::main]
async fn main() {
    env_logger::init();
    let state: State = Arc::new(Mutex::new(AppState::default()));

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            start_signaling_server,
            stop_signaling_server,
            send_signaling_message,
            set_virtual_camera_active,
            push_frame_to_virtual_camera,
            get_local_ip,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
