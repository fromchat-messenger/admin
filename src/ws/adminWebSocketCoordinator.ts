import {
  NETWORK_AVAILABLE_DEBOUNCE_MS,
  SERVER_REACHABLE_DEBOUNCE_MS,
} from "@/ws/constants";
import type { ReconnectingWebSocketHandle } from "@/ws/reconnectingWebSocket";

const KEEP_WEBSOCKET_ALIVE_IN_BACKGROUND = false;

const sessions = new Set<ReconnectingWebSocketHandle>();

let hooksInstalled = false;
let lastOnNetworkAvailableMs = 0;
let lastServerReachableNotifyMs = 0;

function onNetworkLost() {
  for (const session of sessions) {
    session.disconnect();
  }
}

function onNetworkAvailable() {
  if (!KEEP_WEBSOCKET_ALIVE_IN_BACKGROUND && document.visibilityState !== "visible") {
    return;
  }

  const now = Date.now();
  if (now - lastOnNetworkAvailableMs < NETWORK_AVAILABLE_DEBOUNCE_MS) {
    return;
  }
  lastOnNetworkAvailableMs = now;

  for (const session of sessions) {
    if (session.isConnected) {
      continue;
    }
    session.connect(true);
  }
}

export function notifyServerLikelyReachable(hasAuthToken: boolean) {
  if (!KEEP_WEBSOCKET_ALIVE_IN_BACKGROUND && document.visibilityState !== "visible") {
    return;
  }
  if (!hasAuthToken) {
    return;
  }

  const now = Date.now();
  if (now - lastServerReachableNotifyMs < SERVER_REACHABLE_DEBOUNCE_MS) {
    return;
  }
  lastServerReachableNotifyMs = now;

  for (const session of sessions) {
    if (session.isConnected) {
      return;
    }
    session.connect(true);
  }
}

function onTabVisible() {
  if (document.visibilityState !== "visible") {
    return;
  }
  for (const session of sessions) {
    if (!session.isConnected) {
      session.connect(false);
    }
  }
}

function installGlobalHooks() {
  if (hooksInstalled || typeof window === "undefined") {
    return;
  }
  hooksInstalled = true;

  window.addEventListener("online", onNetworkAvailable);
  window.addEventListener("offline", onNetworkLost);
  document.addEventListener("visibilitychange", onTabVisible);
}

export function registerReconnectingWebSocket(
  handle: ReconnectingWebSocketHandle,
): () => void {
  installGlobalHooks();
  sessions.add(handle);
  handle.connect(false);
  return () => {
    sessions.delete(handle);
    handle.disconnect();
  };
}