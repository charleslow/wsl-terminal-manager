mod commands;
mod pty;
mod terminal;

use commands::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            commands::spawn_terminal,
            commands::write_to_terminal,
            commands::resize_terminal,
            commands::close_terminal,
            commands::set_terminal_title,
            commands::list_terminals,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
