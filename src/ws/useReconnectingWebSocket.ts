import { useEffect, useState } from "react";
import { createReconnectingWebSocket } from "@/ws/reconnectingWebSocket";
import { registerReconnectingWebSocket } from "@/ws/adminWebSocketCoordinator";
import type { ReconnectingWebSocketCallbacks } from "@/ws/reconnectingWebSocket";

export type UseReconnectingWebSocketOptions = ReconnectingWebSocketCallbacks & {
  url: string | null;
  token: string | null | undefined;
  enabled?: boolean;
};

export function useReconnectingWebSocket({
  url,
  token,
  enabled = true,
  onConnecting,
  onConnected,
  onDisconnected,
  onMessage,
}: UseReconnectingWebSocketOptions): boolean {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !url) {
      setConnected(false);
      return;
    }

    const handle = createReconnectingWebSocket({
      url,
      getToken: () => token,
      onConnecting: () => {
        setConnected(false);
        onConnecting?.();
      },
      onConnected: () => {
        setConnected(true);
        onConnected?.();
      },
      onDisconnected: () => {
        setConnected(false);
        onDisconnected?.();
      },
      onMessage,
    });

    return registerReconnectingWebSocket(handle);
  }, [enabled, url, token, onConnecting, onConnected, onDisconnected, onMessage]);

  return connected;
}