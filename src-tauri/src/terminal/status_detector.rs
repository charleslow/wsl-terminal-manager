use super::state::TerminalStatus;
use std::time::Instant;

/// Detects terminal status by analyzing PTY output patterns.
pub struct StatusDetector {
    last_output: Instant,
    last_prompt: Option<Instant>,
    has_exited: bool,
    quiet_threshold_ms: u128,
}

impl StatusDetector {
    pub fn new() -> Self {
        Self {
            last_output: Instant::now(),
            last_prompt: None,
            has_exited: false,
            quiet_threshold_ms: 1000,
        }
    }

    pub fn on_output(&mut self, data: &[u8]) {
        self.last_output = Instant::now();

        // Check for common shell prompt patterns
        let text = String::from_utf8_lossy(data);
        if self.looks_like_prompt(&text) {
            self.last_prompt = Some(Instant::now());
        } else {
            self.last_prompt = None;
        }
    }

    pub fn on_exit(&mut self) {
        self.has_exited = true;
    }

    pub fn status(&self) -> TerminalStatus {
        if self.has_exited {
            return TerminalStatus::Done;
        }

        let since_output = self.last_output.elapsed().as_millis();

        // If we saw a prompt recently and output has been quiet, we're idle
        if let Some(prompt_time) = self.last_prompt {
            let since_prompt = prompt_time.elapsed().as_millis();
            if since_prompt < self.quiet_threshold_ms && since_output >= 200 {
                return TerminalStatus::Idle;
            }
        }

        // If output was recent, we're processing
        if since_output < self.quiet_threshold_ms {
            return TerminalStatus::Processing;
        }

        // Quiet for a while — likely idle
        TerminalStatus::Idle
    }

    fn looks_like_prompt(&self, text: &str) -> bool {
        let trimmed = text.trim_end();
        if trimmed.is_empty() {
            return false;
        }

        // Get the last line
        let last_line = trimmed.lines().last().unwrap_or("");
        let last_line = last_line.trim();

        // Strip ANSI escape sequences for matching
        let clean = strip_ansi(last_line);
        let clean = clean.trim();

        // Common prompt endings
        clean.ends_with('$')
            || clean.ends_with('#')
            || clean.ends_with('>')
            || clean.ends_with('%')
            || clean.ends_with("❯")
            || clean.ends_with("➜")
    }
}

fn strip_ansi(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '\x1b' {
            // Skip ESC [ ... final_byte
            if chars.peek() == Some(&'[') {
                chars.next();
                while let Some(&nc) = chars.peek() {
                    chars.next();
                    if nc.is_ascii_alphabetic() || nc == '~' {
                        break;
                    }
                }
            }
        } else {
            result.push(c);
        }
    }
    result
}
