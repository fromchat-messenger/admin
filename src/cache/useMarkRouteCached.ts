import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { markRouteDataReady, routeOverlayKey } from "@/cache/pageDataCache";

export function useMarkRouteCachedWhenReady(ready: boolean, pathname?: string) {
  const location = useLocation();
  const routeKey = routeOverlayKey(pathname ?? location.pathname);

  useEffect(() => {
    if (ready) {
      markRouteDataReady(routeKey);
    }
  }, [ready, routeKey]);
}