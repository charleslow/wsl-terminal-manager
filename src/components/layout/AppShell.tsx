import { TerminalGrid } from "../terminal/TerminalGrid";
import { StatusBar } from "./StatusBar";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

export function AppShell() {
  useKeyboardShortcuts();

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: "#0a0a0f" }}>
      {/* Title bar area */}
      <div
        className="flex items-center px-4 shrink-0 select-none"
        data-tauri-drag-region
        style={{
          height: 40,
          backgroundColor: "#0a0a0f",
          borderBottom: "1px solid #2a2a3a",
        }}
      >
        <span className="text-sm font-semibold text-text-secondary tracking-wide">
          Terminal Orchestrator
        </span>
      </div>

      {/* Main content */}
      <TerminalGrid />

      {/* Status bar */}
      <StatusBar />
    </div>
  );
}
