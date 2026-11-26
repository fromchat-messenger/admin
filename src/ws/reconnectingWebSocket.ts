import { RECONNECT_DELAY_MS } from "@/ws/constants";

/** Mirrors `WebSocketManager` foreground gating (`keepWebSocketAliveInBackground() == false`). */
const KEEP_WEBSOCKET_ALIVE_IN_BACKGROUND = false;

const FOREGROUND_DELAY_CHUNK_MS = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function awaitForeground(): Promise<void> {
  if (KEEP_WEBSOCKET_ALIVE_IN_BACKGROUND) {
    return;
  }
  if (document.visibilityState === "visible") {
    return;
  }
  await new Promise<void>((resolve) => {
    const onChange = () => {
      if (document.visibilityState === "visible") {
        document.removeEventListener("visibilitychange", onChange);
        resolve();
      }
    };
    document.addEventListener("visibilitychange", onChange);
  });
}

/** Like Android `delayWhileForeground`. */
async function delayWhileForeground(totalMs: number, isStopped: () => boolean): Promise<void> {
  let remaining = totalMs;
  while (remaining > 0 && !isStopped()) {
    await awaitForeground();
    const chunk = Math.min(FOREGROUND_DELAY_CHUNK_MS, remaining);
    await sleep(chunk);
    remaining -= chunk;
  }
}

export type ReconnectingWebSocketCallbacks = {
  onConnecting?: () => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onMessage: (data: string) => void;
};

export type ReconnectingWebSocketOptions = ReconnectingWebSocketCallbacks & {
  url: string;
  /** When empty, the loop stays in CONNECTING and retries (same as Android with no token). */
  getToken: () => string | null | undefined;
};

export type ReconnectingWebSocketHandle = {
  connect: (forceRestart?: boolean) => void;
  disconnect: () => void;
  readonly isConnected: boolean;
};

export function createReconnectingWebSocket(
  options: ReconnectingWebSocketOptions,
): ReconnectingWebSocketHandle {
  let stopped = true;
  let loopGeneration = 0;
  let socket: WebSocket | null = null;

  const isStopped = () => stopped;

  const openOneSession = (): Promise<void> => {
    const token = options.getToken()?.trim();
    if (!token) {
      return Promise.resolve();
    }

    const url = options.url;
    return new Promise((resolve) => {
      const ws = new WebSocket(url);
      socket = ws;

      ws.onopen = () => {
        options.onConnected?.();
      };

      ws.onmessage = (event) => {
        options.onMessage(String(event.data));
      };

      ws.onerror = () => {
        /* close follows */
      };

      ws.onclose = () => {
        if (socket === ws) {
          socket = null;
        }
        options.onDisconnected?.();
        resolve();
      };
    });
  };

  const runLoop = async (generation: number) => {
    while (!stopped && generation === loopGeneration) {
      await awaitForeground();

      const token = options.getToken()?.trim();
      if (!token) {
        options.onConnecting?.();
        await delayWhileForeground(RECONNECT_DELAY_MS, isStopped);
        continue;
      }

      options.onConnecting?.();

      try {
        await openOneSession();
      } catch {
        /* logged by transport; reconnect in finally */
      } finally {
        if (stopped || generation !== loopGeneration) {
          return;
        }
        options.onDisconnected?.();
        await awaitForeground();
        await delayWhileForeground(RECONNECT_DELAY_MS, isStopped);
      }
    }
  };

  const connect = (forceRestart = false) => {
    if (forceRestart) {
      stopped = true;
      socket?.close();
      socket = null;
    } else if (!stopped) {
      if (socket?.readyState === WebSocket.OPEN) {
        options.onConnected?.();
      }
      return;
    }

    stopped = false;
    loopGeneration += 1;
    const generation = loopGeneration;
    options.onConnecting?.();
    void runLoop(generation);
  };

  const disconnect = () => {
    stopped = true;
    loopGeneration += 1;
    socket?.close();
    socket = null;
  };

  return {
    connect,
    disconnect,
    get isConnected() {
      return socket?.readyState === WebSocket.OPEN;
    },
  };
}