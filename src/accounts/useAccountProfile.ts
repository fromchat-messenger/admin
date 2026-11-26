import { useCallback, useEffect, useState } from "react";
import { getPageCache, setPageCache } from "@/cache/pageDataCache";
import { useAuth } from "@/auth/AuthContext";
import { apiFetch } from "@/api/client";
import type { AccountProfileCache, AccountUserProfile, ModerationEvent } from "@/accounts/accountProfileTypes";

export function accountProfileCacheKey(userId: number) {
  return `accounts:user:${userId}`;
}

export function useAccountProfile(userId: number | null) {
  const { session } = useAuth();
  const cacheKey = userId != null ? accountProfileCacheKey(userId) : "";
  const cached = cacheKey ? getPageCache<AccountProfileCache>(cacheKey) : undefined;

  const [profile, setProfile] = useState<AccountUserProfile | null>(cached?.profile ?? null);
  const [events, setEvents] = useState<ModerationEvent[]>(cached?.events ?? []);
  const [displayName, setDisplayName] = useState(cached?.displayName ?? "");
  const [bio, setBio] = useState(cached?.bio ?? "");
  const [loading, setLoading] = useState(Boolean(userId) && !cached);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session || userId == null || !Number.isFinite(userId)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [user, moderation] = await Promise.all([
        apiFetch<AccountUserProfile>(`/user/id/${userId}`, session.token),
        apiFetch<{ events: ModerationEvent[] }>(
          `/admin/moderation/events?limit=50&user_id=${userId}`,
          session.token,
        ),
      ]);
      const nextDisplay = user.display_name;
      const nextBio = user.bio ?? "";
      setProfile(user);
      setDisplayName(nextDisplay);
      setBio(nextBio);
      setEvents(moderation.events);
      setPageCache(cacheKey, {
        profile: user,
        events: moderation.events,
        displayName: nextDisplay,
        bio: nextBio,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [cacheKey, session, userId]);

  useEffect(() => {
    if (userId == null) {
      setProfile(null);
      setEvents([]);
      return;
    }
    const fromCache = getPageCache<AccountProfileCache>(accountProfileCacheKey(userId));
    if (fromCache) {
      setProfile(fromCache.profile);
      setDisplayName(fromCache.displayName);
      setBio(fromCache.bio);
      setEvents(fromCache.events);
    }
    void load();
  }, [userId, load]);

  function applyProfile(user: AccountUserProfile) {
    const nextBio = user.bio ?? "";
    setProfile(user);
    setDisplayName(user.display_name);
    setBio(nextBio);
    if (cacheKey) {
      setPageCache(cacheKey, {
        profile: user,
        events,
        displayName: user.display_name,
        bio: nextBio,
      });
    }
  }

  return {
    profile,
    events,
    displayName,
    setDisplayName,
    bio,
    setBio,
    loading,
    error,
    reload: load,
    applyProfile,
  };
}