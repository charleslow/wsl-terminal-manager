import { useState, useRef, useEffect, useCallback } from "react";
import { STATUS_COLORS } from "../../lib/constants";
import type { TerminalStatus } from "../../types/terminal";

interface Props {
  title: string;
  status: TerminalStatus;
  fontSize?: number;
  onRename: (newTitle: string) => void;
}

export function TerminalTitle({ title, status, fontSize = 16, onRename }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const glowColor = STATUS_COLORS[status];

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const confirm = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) {
      onRename(trimmed);
    } else {
      setDraft(title);
    }
    setEditing(false);
  }, [draft, title, onRename]);

  const cancel = useCallback(() => {
    setDraft(title);
    setEditing(false);
  }, [title]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={confirm}
        onKeyDown={(e) => {
          if (e.key === "Enter") confirm();
          if (e.key === "Escape") cancel();
          e.stopPropagation();
        }}
        onClick={(e) => e.stopPropagation()}
        className="bg-transparent border-none outline-none font-bold text-white"
        style={{
          fontSize,
          textShadow: `0 0 12px ${glowColor}, 0 0 24px ${glowColor}40`,
          width: "100%",
        }}
      />
    );
  }

  return (
    <h3
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      className="font-bold text-white truncate cursor-default select-none"
      style={{
        fontSize,
        textShadow: `0 0 12px ${glowColor}, 0 0 24px ${glowColor}40`,
      }}
    >
      {title}
    </h3>
  );
}
