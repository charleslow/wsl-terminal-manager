use portable_pty::MasterPty;
use std::io::Read;

/// Try to create a reader from a PtySession's master.
/// Returns a boxed Read trait object.
pub fn create_reader(master: &dyn MasterPty) -> Result<Box<dyn Read + Send>, String> {
    master
        .try_clone_reader()
        .map_err(|e| format!("Failed to clone reader: {}", e))
}
