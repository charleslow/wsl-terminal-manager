# Terminal Orchestrator - Execution Plan

## Phase 1: Project Scaffolding

### 1.1 Initialize Tauri + React Project
- Run `pnpm create tauri-app@latest` with React + TypeScript template
- Configure Vite for development
- Set up Tailwind CSS
- Verify the app builds and runs

### 1.2 Configure Development Environment
- Set up ESLint and Prettier
- Configure TypeScript strict mode
- Add necessary Rust dependencies to `Cargo.toml`:
  - `portable-pty` for PTY management
  - `serde` for serialization
  - `tokio` for async runtime

---

## Phase 2: Rust Backend - PTY Management

### 2.1 PTY Spawning (`src-tauri/src/pty.rs`)
- Create `PtySession` struct to hold PTY state
- Implement `spawn_pty()` function:
  - Accept shell command (bash, zsh, etc.)
  - Accept optional working directory
  - Return session ID
- Handle PTY read/write streams

### 2.2 Terminal State Management (`src-tauri/src/terminal.rs`)
- Create `TerminalState` enum: `Idle`, `Processing`, `Done`
- Implement state machine for tracking terminal status
- Create `TerminalManager` to track multiple sessions
- Implement status detection via output pattern matching:
  - Detect shell prompts (`$`, `❯`, `>`)
  - Track output activity timestamps
  - Detect process exit

### 2.3 Tauri Commands
- `create_terminal(shell, cwd)` → `terminal_id`
- `write_to_terminal(terminal_id, data)`
- `read_from_terminal(terminal_id)` → `Vec<u8>`
- `get_terminal_status(terminal_id)` → `TerminalState`
- `list_terminals()` → `Vec<TerminalInfo>`
- `close_terminal(terminal_id)`

### 2.4 Event System
- Emit events on terminal output
- Emit events on status change
- Emit events on process exit

---

## Phase 3: React Frontend - Core Components

### 3.1 Terminal Integration with xterm.js
- Install `xterm` and `xterm-addon-fit`
- Create `useTerminal` hook:
  - Connect to Tauri backend
  - Handle input/output streaming
  - Manage terminal lifecycle

### 3.2 TerminalCard Component
- Display terminal preview (last N lines)
- Show status indicator (●/◉/✓)
- Show terminal title/identifier
- Handle click to expand

### 3.3 TerminalGrid Component
- Responsive grid layout (2x2, 3x3, etc.)
- Drag-and-drop reordering (stretch goal)
- Add new terminal button

### 3.4 TerminalFull Component
- Full xterm.js terminal view
- Proper focus handling
- Back button to return to grid

### 3.5 StatusBar Component
- Count terminals by status
- Quick navigation to specific terminal
- Global actions (add terminal, etc.)

---

## Phase 4: State Management & Routing

### 4.1 Application State
- Use Zustand or React Context for state
- Track:
  - List of terminal sessions
  - Current view (grid vs. focused)
  - Currently focused terminal ID

### 4.2 View Navigation
- Grid view (default)
- Focused view (single terminal expanded)
- Smooth transitions between views

---

## Phase 5: Desktop Notifications

### 5.1 Notification System (`src-tauri/src/notifications.rs`)
- Use `tauri-plugin-notification`
- Trigger on terminal status change to "Done"
- Trigger on specific output patterns (configurable)

### 5.2 Notification Preferences
- Enable/disable per terminal
- Custom trigger patterns
- Sound options

---

## Phase 6: Polish & UX

### 6.1 Keyboard Shortcuts
- `Ctrl+1-9` to switch terminals
- `Escape` to return to grid
- `Ctrl+N` to create new terminal
- `Ctrl+W` to close current terminal

### 6.2 Visual Polish
- Dark theme (terminal-friendly)
- Smooth animations
- Loading states
- Error handling UI

### 6.3 Configuration
- Default shell selection
- Custom prompt patterns
- Window behavior settings

---

## Phase 7: Testing & Documentation

### 7.1 Testing
- Unit tests for Rust backend
- Component tests for React
- Integration tests for IPC

### 7.2 Documentation
- README with setup instructions
- Architecture documentation
- Contributing guidelines

---

## Recommended Build Order

1. **MVP (Phases 1-3)**: Get a working grid of terminals
2. **Usable (Phase 4-5)**: Add state management and notifications
3. **Polished (Phase 6-7)**: Keyboard shortcuts, config, tests

---

## Technical Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| PTY handling complexity | Start with `portable-pty` examples, test on WSL early |
| xterm.js performance | Use virtual scrolling, limit buffer size |
| Status detection accuracy | Allow custom regex patterns, tune thresholds |
| Windows/WSL compatibility | Test frequently, use Tauri's cross-platform APIs |

---

## Dependencies Summary

### Rust (Cargo.toml)
```toml
[dependencies]
tauri = { version = "2", features = ["shell-open"] }
portable-pty = "0.8"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
```

### Node.js (package.json via pnpm)
```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "xterm": "^5",
    "xterm-addon-fit": "^0.8",
    "zustand": "^4"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2",
    "typescript": "^5",
    "tailwindcss": "^3",
    "vite": "^5"
  }
}
```

---

## Quick Start Commands

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Create new Tauri project
pnpm create tauri-app@latest terminal-orchestrator --template react-ts

# Navigate to project
cd terminal-orchestrator

# Install dependencies
pnpm install

# Add additional dependencies
pnpm add xterm xterm-addon-fit zustand
pnpm add -D tailwindcss postcss autoprefixer

# Initialize Tailwind
pnpm exec tailwindcss init -p

# Run development server
pnpm tauri dev
```
