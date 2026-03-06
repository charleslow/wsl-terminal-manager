import { invoke, Channel } from "@tauri-apps/api/core";
import type { TerminalSession, TerminalStatus } from "../types/terminal";

interface PtyOutput {
  id: string;
  data: number[];
}

interface StatusChange {
  id: string;
  status: TerminalStatus;
}

interface SpawnOptions {
  title?: string;
  rows?: number;
  cols?: number;
  onOutput: (id: string, data: Uint8Array) => void;
  onStatus: (id: string, status: TerminalStatus) => void;
}

export async function spawnTerminal(opts: SpawnOptions): Promise<TerminalSession> {
  const onOutput = new Channel<PtyOutput>();
  onOutput.onmessage = (msg) => {
    opts.onOutput(msg.id, new Uint8Array(msg.data));
  };

  const onStatus = new Channel<StatusChange>();
  onStatus.onmessage = (msg) => {
    opts.onStatus(msg.id, msg.status);
  };

  const result = await invoke<{
    id: string;
    title: string;
    status: TerminalStatus;
    created_at: number;
  }>("spawn_terminal", {
    title: opts.title,
    rows: opts.rows,
    cols: opts.cols,
    onOutput,
    onStatus,
  });

  return {
    id: result.id,
    title: result.title,
    status: result.status,
    createdAt: result.created_at,
  };
}

export async function writeToTerminal(id: string, data: Uint8Array): Promise<void> {
  await invoke("write_to_terminal", { id, data: Array.from(data) });
}

export async function resizeTerminal(id: string, rows: number, cols: number): Promise<void> {
  await invoke("resize_terminal", { id, rows, cols });
}

export async function closeTerminal(id: string): Promise<void> {
  await invoke("close_terminal", { id });
}

export async function setTerminalTitle(id: string, title: string): Promise<void> {
  await invoke("set_terminal_title", { id, title });
}

export async function listTerminals(): Promise<TerminalSession[]> {
  const results = await invoke<
    { id: string; title: string; status: TerminalStatus; created_at: number }[]
  >("list_terminals");

  return results.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    createdAt: r.created_at,
  }));
}
