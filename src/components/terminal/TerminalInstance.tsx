import { useEffect, useRef, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { useTerminalStore } from "../../stores/terminalStore";

interface Props {
  id: string;
  miniature?: boolean;
}

export function TerminalInstance({ id, miniature = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { registerXterm, writeToTerminal, resizeTerminal, getXterm } =
    useTerminalStore();

  const setupTerminal = useCallback(() => {
    if (!containerRef.current) return;

    // Check if already registered — reuse existing terminal
    const existing = getXterm(id);
    if (existing && termRef.current === existing) {
      // Already mounted
      return;
    }

    if (existing) {
      // Re-attach existing terminal to new container
      termRef.current = existing;
      const fitAddon = new FitAddon();
      fitAddonRef.current = fitAddon;
      existing.loadAddon(fitAddon);
      containerRef.current.innerHTML = "";
      existing.open(containerRef.current);

      if (!miniature) {
        try {
          existing.loadAddon(new WebglAddon());
        } catch {
          // WebGL not available, DOM renderer is fine
        }
      }

      requestAnimationFrame(() => {
        try {
          fitAddon.fit();
        } catch {
          // ignore fit errors
        }
      });
      return;
    }

    const term = new Terminal({
      fontSize: miniature ? 9 : 14,
      fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
      theme: {
        background: "#12121a",
        foreground: "#e2e2f0",
        cursor: miniature ? "#12121a" : "#e2e2f0",
        selectionBackground: "#4a4a6a80",
        black: "#0a0a0f",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#f59e0b",
        blue: "#6366f1",
        magenta: "#a855f7",
        cyan: "#06b6d4",
        white: "#e2e2f0",
        brightBlack: "#8888a0",
        brightRed: "#f87171",
        brightGreen: "#4ade80",
        brightYellow: "#fbbf24",
        brightBlue: "#818cf8",
        brightMagenta: "#c084fc",
        brightCyan: "#22d3ee",
        brightWhite: "#ffffff",
      },
      cursorBlink: !miniature,
      cursorStyle: "bar",
      scrollback: 5000,
      allowProposedApi: true,
      disableStdin: miniature,
    });

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    containerRef.current.innerHTML = "";
    term.open(containerRef.current);

    if (!miniature) {
      try {
        term.loadAddon(new WebglAddon());
      } catch {
        // WebGL not available
      }

      term.onData((data) => {
        writeToTerminal(id, new TextEncoder().encode(data));
      });

      term.onResize(({ rows, cols }) => {
        resizeTerminal(id, rows, cols);
      });
    }

    termRef.current = term;
    registerXterm(id, term);

    requestAnimationFrame(() => {
      try {
        fitAddon.fit();
      } catch {
        // ignore
      }
    });
  }, [id, miniature, registerXterm, writeToTerminal, resizeTerminal, getXterm]);

  useEffect(() => {
    setupTerminal();

    return () => {
      // Don't dispose — the terminal persists across view changes
    };
  }, [setupTerminal]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current || miniature) return;

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        try {
          fitAddonRef.current?.fit();
        } catch {
          // ignore
        }
      });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [miniature]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${miniature ? "xterm-miniature pointer-events-none" : ""}`}
    />
  );
}
