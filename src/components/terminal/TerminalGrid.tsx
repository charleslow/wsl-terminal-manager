import { AnimatePresence, LayoutGroup } from "motion/react";
import { TerminalCard } from "./TerminalCard";
import { TerminalExpanded } from "./TerminalExpanded";
import { useTerminalStore } from "../../stores/terminalStore";

export function TerminalGrid() {
  const { sessions, expandedId, filteredSessions } = useTerminalStore();
  const visible = filteredSessions();
  const expandedSession = sessions.find((s) => s.id === expandedId);

  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-20">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              className="mx-auto"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="#8888a0"
                strokeWidth="1.5"
              />
              <path d="M7 8l3 3-3 3" stroke="#8888a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 16h5" stroke="#8888a0" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-text-secondary text-lg mb-2">No terminals yet</p>
          <p className="text-text-secondary text-sm opacity-60">
            Press <kbd className="px-1.5 py-0.5 rounded bg-elevated text-text-primary text-xs">Ctrl+N</kbd> or click <strong>+ Add Terminal</strong> below
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto p-5">
      <LayoutGroup>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
          }}
        >
          <AnimatePresence>
            {visible.map((session) => (
              <div
                key={session.id}
                style={{ height: 320 }}
              >
                <TerminalCard session={session} />
              </div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {expandedSession && (
            <TerminalExpanded
              key={`expanded-${expandedSession.id}`}
              session={expandedSession}
            />
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
