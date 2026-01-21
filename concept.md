# Terminal Orchestrator

## Purpose

A desktop application to monitor and manage multiple terminal sessions running in parallel - specifically designed for running multiple Claude Code instances across different dev environments.

## Motivation

- Running parallel Claude sessions across multiple projects/containers
- Need visibility into what each terminal is doing (processing vs idle vs done)
- Want to quickly switch between terminals without losing context
- Desire for native desktop notifications when tasks complete
- Current workflow: Windows → WSL → Docker containers

## Core Features

1. **Dashboard Grid View** - See all terminals at a glance with status indicators
2. **Status Detection** - Visual indicators showing:
   - ● Idle (waiting for input)
   - ◉ Processing (actively running)
   - ✓ Done (process exited)
3. **Zoom In/Out** - Click a terminal to expand, zoom out to grid view
4. **Status Bar** - Summary of all terminal states
5. **Desktop Notifications** - Alert when terminals complete tasks

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **App Shell** | Tauri 2.0 | Fast, lightweight (~10MB), native performance, cross-platform |
| **Frontend** | React + TypeScript | Familiar, flexible, component-based UI |
| **Terminal Emulation** | xterm.js | Battle-tested terminal emulator for web |
| **Styling** | Tailwind CSS | Rapid UI development |
| **Backend** | Rust | Native PTY handling, process management, performance |
| **PTY Handling** | portable-pty (Rust crate) | Cross-platform pseudo-terminal support |
| **IPC** | Tauri Commands | Type-safe communication between React and Rust |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Tauri Application                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   React Frontend (Webview)                               │
│   ┌─────────────────────────────────────────────────┐   │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │   │
│   │  │Terminal1│ │Terminal2│ │Terminal3│  Grid     │   │
│   │  │ ● idle  │ │◉ active │ │✓ done   │  View     │   │
│   │  └─────────┘ └─────────┘ └─────────┘           │   │
│   ├─────────────────────────────────────────────────┤   │
│   │  [Status Bar: 2 processing │ 1 idle │ 1 done]  │   │
│   └─────────────────────────────────────────────────┘   │
│                          │                               │
│                    Tauri IPC                             │
│                          │                               │
│   Rust Backend           ▼                               │
│   ┌─────────────────────────────────────────────────┐   │
│   │  • PTY Management (spawn, read, write)          │   │
│   │  • Process Lifecycle                            │   │
│   │  • Status Detection (output pattern matching)   │   │
│   │  • Desktop Notifications                        │   │
│   └─────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Status Detection Strategy

Detect terminal state by analyzing PTY output:

- **Processing**: Recent output activity, no shell prompt detected
- **Idle/Waiting**: Shell prompt pattern visible (e.g., `$`, `❯`, or Claude's `>`)
- **Done**: PTY process has exited

## Project Structure (Planned)

```
terminal-orchestrator/
├── src/                      # React frontend
│   ├── components/
│   │   ├── TerminalGrid.tsx  # Grid view of all terminals
│   │   ├── TerminalCard.tsx  # Individual terminal preview
│   │   ├── TerminalFull.tsx  # Expanded terminal view
│   │   └── StatusBar.tsx     # Bottom status summary
│   ├── hooks/
│   │   └── useTerminal.ts    # Terminal state management
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/                # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── pty.rs            # PTY spawning and management
│   │   ├── terminal.rs       # Terminal state tracking
│   │   └── notifications.rs  # Desktop notification integration
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Target Platform

- Primary: Windows (via WSL2)
- Potential: Native Linux, macOS

## Open Questions

- [ ] Keyboard shortcuts for navigation between terminals?
- [ ] Save/restore terminal sessions?
- [ ] Custom prompt detection patterns per terminal?
- [ ] Integration with specific dev environments (Docker, SSH)?
