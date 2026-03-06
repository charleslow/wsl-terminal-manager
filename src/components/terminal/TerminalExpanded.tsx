import { motion } from "motion/react";
import { StatusIndicator } from "./StatusIndicator";
import { TerminalTitle } from "./TerminalTitle";
import { TerminalInstance } from "./TerminalInstance";
import { STATUS_COLORS, STATUS_LABELS } from "../../lib/constants";
import { useTerminalStore } from "../../stores/terminalStore";
import type { TerminalSession } from "../../types/terminal";

interface Props {
  session: TerminalSession;
}

export function TerminalExpanded({ session }: Props) {
  const { setExpanded, removeTerminal, setTitle } = useTerminalStore();

  return (
    <motion.div
      layoutId={`terminal-${session.id}`}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "#0a0a0f" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{
          height: 48,
          borderBottom: "1px solid #2a2a3a",
          backgroundColor: "#12121a",
        }}
      >
        {/* Back button */}
        <button
          onClick={() => setExpanded(null)}
          className="text-text-secondary hover:text-white transition-colors p-1.5 rounded hover:bg-white/10"
          title="Back to grid (Escape)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <StatusIndicator status={session.status} size={12} />

        <div className="flex-1 min-w-0">
          <TerminalTitle
            title={session.title}
            status={session.status}
            fontSize={20}
            onRename={(t) => setTitle(session.id, t)}
          />
        </div>

        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            color: STATUS_COLORS[session.status],
            backgroundColor: `${STATUS_COLORS[session.status]}15`,
          }}
        >
          {STATUS_LABELS[session.status]}
        </span>

        <button
          onClick={() => {
            setExpanded(null);
            removeTerminal(session.id);
          }}
          className="text-text-secondary hover:text-status-error transition-colors p-1.5 rounded hover:bg-white/10"
          title="Close terminal"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Terminal */}
      <div className="flex-1 min-h-0 p-1">
        <TerminalInstance id={session.id} />
      </div>
    </motion.div>
  );
}
