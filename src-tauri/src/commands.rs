use crate::pty::manager::PtyManager;
use crate::pty::reader::create_reader;
use crate::terminal::state::{TerminalInfo, TerminalStatus};
use crate::terminal::status_detector::StatusDetector;
use parking_lot::Mutex;
use std::collections::HashMap;
use std::io::Read;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{ipc::Channel, State};
use uuid::Uuid;

pub struct AppState {
    pub pty_manager: PtyManager,
    pub terminals: Mutex<HashMap<String, TerminalInfo>>,
    pub detectors: Mutex<HashMap<String, Arc<Mutex<StatusDetector>>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            pty_manager: PtyManager::new(),
            terminals: Mutex::new(HashMap::new()),
            detectors: Mutex::new(HashMap::new()),
        }
    }
}

#[derive(Clone, serde::Serialize)]
pub struct PtyOutput {
    pub id: String,
    pub data: Vec<u8>,
}

#[derive(Clone, serde::Serialize)]
pub struct StatusChange {
    pub id: String,
    pub status: TerminalStatus,
}

#[tauri::command]
pub fn spawn_terminal(
    state: State<'_, AppState>,
    title: Option<String>,
    rows: Option<u16>,
    cols: Option<u16>,
    on_output: Channel<PtyOutput>,
    on_status: Channel<StatusChange>,
) -> Result<TerminalInfo, String> {
    let id = Uuid::new_v4().to_string();
    let r = rows.unwrap_or(24);
    let c = cols.unwrap_or(80);

    state.pty_manager.spawn(&id, r, c)?;

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;

    let title = title.unwrap_or_else(|| format!("Terminal {}", state.terminals.lock().len() + 1));

    let info = TerminalInfo {
        id: id.clone(),
        title,
        status: TerminalStatus::Idle,
        created_at: now,
    };

    state.terminals.lock().insert(id.clone(), info.clone());

    let detector = Arc::new(Mutex::new(StatusDetector::new()));
    state.detectors.lock().insert(id.clone(), detector.clone());

    // Spawn reader thread
    let session = state
        .pty_manager
        .get_session(&id)
        .ok_or("Session not found after spawn")?;

    let reader = {
        let session = session.lock();
        create_reader(&*session.master)?
    };

    let output_id = id.clone();
    let status_id = id.clone();

    std::thread::spawn(move || {
        read_pty_loop(reader, output_id, status_id, on_output, on_status, detector);
    });

    Ok(info)
}

fn read_pty_loop(
    mut reader: Box<dyn Read + Send>,
    output_id: String,
    status_id: String,
    on_output: Channel<PtyOutput>,
    on_status: Channel<StatusChange>,
    detector: Arc<Mutex<StatusDetector>>,
) {
    let mut buf = [0u8; 4096];
    let mut last_status = TerminalStatus::Idle;

    loop {
        match reader.read(&mut buf) {
            Ok(0) => {
                // EOF - process exited
                {
                    let mut det = detector.lock();
                    det.on_exit();
                }
                let _ = on_status.send(StatusChange {
                    id: status_id.clone(),
                    status: TerminalStatus::Done,
                });
                break;
            }
            Ok(n) => {
                let data = buf[..n].to_vec();

                // Update detector
                {
                    let mut det = detector.lock();
                    det.on_output(&data);
                }

                // Send output
                let _ = on_output.send(PtyOutput {
                    id: output_id.clone(),
                    data,
                });

                // Check status change
                let current_status = detector.lock().status();
                if current_status != last_status {
                    last_status = current_status.clone();
                    let _ = on_status.send(StatusChange {
                        id: status_id.clone(),
                        status: current_status,
                    });
                }
            }
            Err(_) => {
                {
                    let mut det = detector.lock();
                    det.on_exit();
                }
                let _ = on_status.send(StatusChange {
                    id: status_id.clone(),
                    status: TerminalStatus::Done,
                });
                break;
            }
        }
    }
}

#[tauri::command]
pub fn write_to_terminal(state: State<'_, AppState>, id: String, data: Vec<u8>) -> Result<(), String> {
    state.pty_manager.write(&id, &data)
}

#[tauri::command]
pub fn resize_terminal(
    state: State<'_, AppState>,
    id: String,
    rows: u16,
    cols: u16,
) -> Result<(), String> {
    state.pty_manager.resize(&id, rows, cols)
}

#[tauri::command]
pub fn close_terminal(state: State<'_, AppState>, id: String) -> Result<(), String> {
    state.terminals.lock().remove(&id);
    state.detectors.lock().remove(&id);
    state.pty_manager.close(&id)
}

#[tauri::command]
pub fn set_terminal_title(state: State<'_, AppState>, id: String, title: String) -> Result<(), String> {
    let mut terminals = state.terminals.lock();
    if let Some(info) = terminals.get_mut(&id) {
        info.title = title;
        Ok(())
    } else {
        Err(format!("Terminal {} not found", id))
    }
}

#[tauri::command]
pub fn list_terminals(state: State<'_, AppState>) -> Vec<TerminalInfo> {
    let terminals = state.terminals.lock();
    let mut list: Vec<TerminalInfo> = terminals.values().cloned().collect();
    list.sort_by_key(|t| t.created_at);
    list
}
