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

export function TerminalCard({ session }: Props) {
  const { setExpanded, removeTerminal, setTitle } = useTerminalStore();
  const elapsed = getElapsed(session.createdAt);

  return (
    <motion.div
      layoutId={`terminal-${session.id}`}
      onClick={() => setExpanded(session.id)}
      className="terminal-card flex flex-col rounded-xl overflow-hidden cursor-pointer"
      style={{
        backgroundColor: "#12121a",
        border: "1px solid #2a2a3a",
        boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 0 0 0 ${STATUS_COLORS[session.status]}00`,
      }}
      whileHover={{
        y: -2,
        boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 20px ${STATUS_COLORS[session.status]}15`,
        borderColor: "#4a4a6a",
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Header - 40px */}
      <div
        className="flex items-center gap-2 px-3 shrink-0"
        style={{ height: 40 }}
      >
        <StatusIndicator status={session.status} />
        <div className="flex-1 min-w-0">
          <TerminalTitle
            title={session.title}
            status={session.status}
            fontSize={16}
            onRename={(t) => setTitle(session.id, t)}
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeTerminal(session.id);
          }}
          className="text-text-secondary hover:text-white transition-colors p-1 rounded hover:bg-white/10"
          title="Close terminal"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 3l8 8M11 3l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Terminal preview */}
      <div className="flex-1 min-h-0 px-1">
        <TerminalInstance id={session.id} miniature />
      </div>

      {/* Footer - 28px */}
      <div
        className="flex items-center gap-2 px-3 text-xs shrink-0"
        style={{
          height: 28,
          borderTop: "1px solid #2a2a3a",
          color: "#8888a0",
        }}
      >
        <span style={{ color: STATUS_COLORS[session.status] }}>
          {STATUS_LABELS[session.status]}
        </span>
        <span>·</span>
        <span>{elapsed}</span>
      </div>
    </motion.div>
  );
}

function getElapsed(createdAt: number): string {
  const diff = Math.floor((Date.now() - createdAt) / 1000);
  if (diff < 60) return `${diff}s`;
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}
