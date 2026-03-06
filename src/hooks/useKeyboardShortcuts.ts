import { useEffect } from "react";
import { useTerminalStore } from "../stores/terminalStore";

export function useKeyboardShortcuts() {
  const { setExpanded, expandedId, filteredSessions, addTerminal } = useTerminalStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Escape: collapse expanded terminal
      if (e.key === "Escape" && expandedId) {
        e.preventDefault();
        setExpanded(null);
        return;
      }

      // Ctrl+N: new terminal
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        addTerminal();
        return;
      }

      // Ctrl+1-9: jump to terminal by index
      if (e.ctrlKey && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const idx = parseInt(e.key) - 1;
        const sessions = filteredSessions();
        if (idx < sessions.length) {
          setExpanded(sessions[idx].id);
        }
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [expandedId, setExpanded, filteredSessions, addTerminal]);
}
