import { STATUS_COLORS } from "../../lib/constants";
import type { TerminalStatus } from "../../types/terminal";

interface Props {
  status: TerminalStatus;
  size?: number;
}

export function StatusIndicator({ status, size = 10 }: Props) {
  const color = STATUS_COLORS[status];
  const isProcessing = status === "processing";

  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size }}
    >
      {isProcessing && (
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ backgroundColor: color, opacity: 0.4 }}
        />
      )}
      <span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}
