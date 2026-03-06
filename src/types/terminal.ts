export type TerminalStatus = "idle" | "processing" | "done" | "error";

export interface TerminalSession {
  id: string;
  title: string;
  status: TerminalStatus;
  createdAt: number;
}
