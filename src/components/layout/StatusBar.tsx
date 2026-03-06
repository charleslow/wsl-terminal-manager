import { STATUS_COLORS } from "../../lib/constants";
import { useTerminalStore } from "../../stores/terminalStore";
import type { TerminalStatus } from "../../types/terminal";

export function StatusBar() {
  const { addTerminal, statusCounts, sessions, statusFilter, setStatusFilter } =
    useTerminalStore();
  const counts = statusCounts();
  const total = sessions.length;

  return (
    <div
      className="flex items-center px-4 shrink-0 border-t"
      style={{
        height: 48,
        backgroundColor: "#12121a",
        borderColor: "#2a2a3a",
      }}
    >
      {/* Add Terminal button */}
      <button
        onClick={() => addTerminal()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
        style={{ color: "#e2e2f0" }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 2v10M2 7h10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Add Terminal
      </button>

      <div
        className="w-px h-6 mx-3"
        style={{ backgroundColor: "#2a2a3a" }}
      />

      {/* Status chips */}
      <div className="flex items-center gap-2">
        <StatusChip
          label="Idle"
          count={counts.idle}
          color={STATUS_COLORS.idle}
          status="idle"
          active={statusFilter === "idle"}
          onClick={() => setStatusFilter(statusFilter === "idle" ? null : "idle")}
        />
        <StatusChip
          label="Processing"
          count={counts.processing}
          color={STATUS_COLORS.processing}
          status="processing"
          active={statusFilter === "processing"}
          onClick={() =>
            setStatusFilter(statusFilter === "processing" ? null : "processing")
          }
        />
        <StatusChip
          label="Done"
          count={counts.done}
          color={STATUS_COLORS.done}
          status="done"
          active={statusFilter === "done"}
          onClick={() => setStatusFilter(statusFilter === "done" ? null : "done")}
        />
        {counts.error > 0 && (
          <StatusChip
            label="Error"
            count={counts.error}
            color={STATUS_COLORS.error}
            status="error"
            active={statusFilter === "error"}
            onClick={() => setStatusFilter(statusFilter === "error" ? null : "error")}
          />
        )}
      </div>

      {/* Total */}
      <div className="ml-auto text-xs text-text-secondary">
        {total} terminal{total !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

function StatusChip({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color: string;
  status: TerminalStatus;
  active: boolean;
  onClick: () => void;
}) {
  if (count === 0 && !active) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all"
      style={{
        color: active ? color : "#8888a0",
        backgroundColor: active ? `${color}15` : "transparent",
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {count} {label}
    </button>
  );
}
