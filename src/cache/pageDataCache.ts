const dataStore = new Map<string, unknown>();
const readyRoutes = new Set<string>();

export function routeOverlayKey(pathname: string): string {
  return pathname.replace(/\/accounts\/\d+.*/, "/accounts");
}

export function getPageCache<T>(key: string): T | undefined {
  const value = dataStore.get(key);
  return value === undefined ? undefined : (value as T);
}

export function setPageCache<T>(key: string, value: T): void {
  dataStore.set(key, value);
}

export function hasPageCache(key: string): boolean {
  return dataStore.has(key);
}

export function markRouteDataReady(routeKey: string): void {
  readyRoutes.add(routeKey);
}

export function hasRouteDataReady(routeKey: string): boolean {
  return readyRoutes.has(routeKey);
}