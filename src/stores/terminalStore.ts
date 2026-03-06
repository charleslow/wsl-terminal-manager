import { create } from "zustand";
import type { TerminalSession, TerminalStatus } from "../types/terminal";
import {
  spawnTerminal,
  writeToTerminal,
  resizeTerminal,
  closeTerminal as closeTerminalCmd,
  setTerminalTitle as setTitleCmd,
} from "../lib/tauri-commands";
import { Terminal } from "@xterm/xterm";

interface TerminalStore {
  sessions: TerminalSession[];
  expandedId: string | null;
  xtermInstances: Map<string, Terminal>;
  statusFilter: TerminalStatus | null;

  addTerminal: (title?: string) => Promise<void>;
  removeTerminal: (id: string) => Promise<void>;
  setExpanded: (id: string | null) => void;
  updateStatus: (id: string, status: TerminalStatus) => void;
  setTitle: (id: string, title: string) => Promise<void>;
  registerXterm: (id: string, term: Terminal) => void;
  unregisterXterm: (id: string) => void;
  getXterm: (id: string) => Terminal | undefined;
  writeToTerminal: (id: string, data: Uint8Array) => Promise<void>;
  resizeTerminal: (id: string, rows: number, cols: number) => Promise<void>;
  setStatusFilter: (status: TerminalStatus | null) => void;
  filteredSessions: () => TerminalSession[];
  statusCounts: () => Record<TerminalStatus, number>;
}

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  sessions: [],
  expandedId: null,
  xtermInstances: new Map(),
  statusFilter: null,

  addTerminal: async (title?: string) => {
    const session = await spawnTerminal({
      title,
      onOutput: (id, data) => {
        const term = get().xtermInstances.get(id);
        if (term) {
          term.write(data);
        }
      },
      onStatus: (id, status) => {
        get().updateStatus(id, status);
      },
    });
    set((state) => ({ sessions: [...state.sessions, session] }));
  },

  removeTerminal: async (id: string) => {
    await closeTerminalCmd(id);
    const term = get().xtermInstances.get(id);
    if (term) {
      term.dispose();
    }
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      expandedId: state.expandedId === id ? null : state.expandedId,
    }));
    get().xtermInstances.delete(id);
  },

  setExpanded: (id: string | null) => set({ expandedId: id }),

  updateStatus: (id: string, status: TerminalStatus) => {
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, status } : s)),
    }));
  },

  setTitle: async (id: string, title: string) => {
    await setTitleCmd(id, title);
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, title } : s)),
    }));
  },

  registerXterm: (id: string, term: Terminal) => {
    get().xtermInstances.set(id, term);
  },

  unregisterXterm: (id: string) => {
    get().xtermInstances.delete(id);
  },

  getXterm: (id: string) => {
    return get().xtermInstances.get(id);
  },

  writeToTerminal: async (id: string, data: Uint8Array) => {
    await writeToTerminal(id, data);
  },

  resizeTerminal: async (id: string, rows: number, cols: number) => {
    await resizeTerminal(id, rows, cols);
  },

  setStatusFilter: (status: TerminalStatus | null) => set({ statusFilter: status }),

  filteredSessions: () => {
    const { sessions, statusFilter } = get();
    if (!statusFilter) return sessions;
    return sessions.filter((s) => s.status === statusFilter);
  },

  statusCounts: () => {
    const counts: Record<TerminalStatus, number> = {
      idle: 0,
      processing: 0,
      done: 0,
      error: 0,
    };
    for (const s of get().sessions) {
      counts[s.status]++;
    }
    return counts;
  },
}));
