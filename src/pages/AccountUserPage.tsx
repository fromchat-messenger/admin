import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "m3-expressive-react/Button";
import TextField from "m3-expressive-react/TextField";
import IconButton from "m3-expressive-react/IconButton";
import { useAuth } from "@/auth/AuthContext";
import { apiFetch, ApiError } from "@/api/client";
import { PageHeader } from "@/components/PageHeader";
import { StatusChip } from "@/components/StatusChip";
import { UserAvatar } from "@/components/UserAvatar";
import page from "@/styles/admin-page.module.scss";
import styles from "./AccountUserPage.module.scss";

type UserProfile = {
  id: number;
  username: string;
  display_name: string;
  bio: string | null;
  online: boolean;
  last_seen: string | null;
  created_at: string | null;
  verified: boolean;
  verification_status: string;
  suspended: boolean;
  suspension_reason: string | null;
  suspended_until: string | null;
  deleted: boolean;
};

type ModerationEvent = {
  id: number;
  created_at: string | null;
  source: string;
  reason_code: string | null;
  reason_detail: string | null;
  text_preview: string | null;
};

function formatLastSeen(online: boolean, lastSeen: string | null) {
  if (online) {
    return "Online now";
  }
  if (!lastSeen) {
    return "—";
  }
  return new Date(lastSeen).toLocaleString();
}

export function AccountUserPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const numericId = Number(userId);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<ModerationEvent[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [filterSample, setFilterSample] = useState("");
  const [filterResult, setFilterResult] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session || !Number.isFinite(numericId)) {
      return;
    }
    setLoading(true);
    try {
      const [user, moderation] = await Promise.all([
        apiFetch<UserProfile>(`/user/id/${numericId}`, session.token),
        apiFetch<{ events: ModerationEvent[] }>(
          `/admin/moderation/events?limit=50&user_id=${numericId}`,
          session.token,
        ),
      ]);
      setProfile(user);
      setDisplayName(user.display_name);
      setBio(user.bio ?? "");
      setEvents(moderation.events);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [session, numericId]);

  useEffect(() => {
    void load();
  }, [load]);

  const flags = useMemo(() => {
    if (!profile) {
      return [];
    }
    const items: { key: string; status: Parameters<typeof StatusChip>[0]["status"]; label: string }[] = [];
    if (profile.id === 1) {
      items.push({ key: "owner", status: "owner", label: "Owner" });
    }
    if (profile.verified) {
      items.push({ key: "verified", status: "verified", label: "Verified" });
    }
    if (profile.suspended) {
      items.push({ key: "suspended", status: "suspended", label: "Suspended" });
    }
    if (profile.deleted) {
      items.push({ key: "deleted", status: "deleted", label: "Deleted" });
    }
    if (profile.online) {
      items.push({ key: "online", status: "active", label: "Online" });
    }
    return items;
  }, [profile]);

  async function act(path: string, body?: object) {
    if (!session) {
      return;
    }
    setMessage(null);
    try {
      await apiFetch(path, session.token, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
      setMessage("Saved");
      await load();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Action failed");
    }
  }

  async function saveProfile() {
    if (!session || !profile) {
      return;
    }
    setMessage(null);
    try {
      const updated = await apiFetch<UserProfile>(`/admin/users/${profile.id}`, session.token, {
        method: "PUT",
        body: JSON.stringify({ display_name: displayName, bio }),
      });
      setProfile(updated);
      setMessage("Profile updated");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function runFilterCheck() {
    if (!session) {
      return;
    }
    const data = await apiFetch<{ allowed: boolean; reason_detail: string }>("/admin/filter/check", session.token, {
      method: "POST",
      body: JSON.stringify({ text: filterSample }),
    });
    setFilterResult(data.allowed ? "Allowed" : data.reason_detail || "Blocked");
  }

  if (loading && !profile) {
    return <p className={page.muted}>Loading…</p>;
  }

  if (!profile) {
    return <p className={page.message}>{message ?? "User not found"}</p>;
  }

  return (
    <div className={page.page}>
      <PageHeader
        title={profile.display_name || profile.username}
        subtitle={`@${profile.username} · id ${profile.id}`}
        actions={
          <IconButton
            variant="tonal"
            icon={<span className="material-symbols-rounded">arrow_back</span>}
            aria-label="Back to accounts"
            onClick={() => navigate("/accounts")}
          />
        }
      />

      <div className={`${page.surfaceCard} ${styles.hero}`}>
        <UserAvatar name={profile.display_name || profile.username} size="md" />
        <div className={styles.heroMeta}>
          <div className={styles.flagRow}>
            {flags.map((flag) => (
              <StatusChip key={flag.key} status={flag.status}>
                {flag.label}
              </StatusChip>
            ))}
          </div>
          <p className={page.muted}>Last activity: {formatLastSeen(profile.online, profile.last_seen)}</p>
        </div>
      </div>

      <div className={page.twoCol}>
        <section className={`${page.surfaceCard} ${page.section}`}>
          <h2>Profile</h2>
          <TextField label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <TextField label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <Button variant="filled" onClick={() => void saveProfile()}>
            Save profile
          </Button>
        </section>

        <section className={`${page.surfaceCard} ${page.section}`}>
          <h2>Activity</h2>
          <dl className={page.dl}>
            <dt>Last activity</dt>
            <dd>{formatLastSeen(profile.online, profile.last_seen)}</dd>
            <dt>Registered</dt>
            <dd>{profile.created_at ? new Date(profile.created_at).toLocaleString() : "—"}</dd>
            {profile.suspended_until ? (
              <>
                <dt>Suspended until</dt>
                <dd>{new Date(profile.suspended_until).toLocaleString()}</dd>
              </>
            ) : null}
          </dl>
          {profile.id !== 1 ? (
            <div className={styles.actions}>
              <Button variant="tonal" onClick={() => act(`/user/${profile.id}/verify`)}>
                {profile.verified ? "Unverify" : "Verify"}
              </Button>
              {profile.suspended ? (
                <Button variant="tonal" onClick={() => act(`/user/${profile.id}/unsuspend`)}>
                  Unsuspend
                </Button>
              ) : (
                <Button
                  variant="tonal"
                  onClick={() => act(`/user/${profile.id}/suspend`, { reason: "Admin panel suspension" })}
                >
                  Suspend
                </Button>
              )}
              <Button variant="outlined" onClick={() => act(`/user/${profile.id}/delete`)}>
                Delete
              </Button>
            </div>
          ) : null}
        </section>
      </div>

      <section className={`${page.surfaceCard} ${page.section}`}>
        <h2>Chat filter check</h2>
        <TextField label="Sample text" value={filterSample} onChange={(e) => setFilterSample(e.target.value)} />
        <div className={styles.inlineActions}>
          <Button variant="filled" onClick={() => void runFilterCheck()}>
            Run check
          </Button>
          {filterResult ? <span className={page.muted}>{filterResult}</span> : null}
        </div>
      </section>

      <section className={`${page.surfaceCard} ${page.section}`}>
        <h2>Moderation triggers</h2>
        {events.length === 0 ? (
          <p className={page.muted}>No filter or moderation events for this user.</p>
        ) : (
          <ul className={styles.eventList}>
            {events.map((event) => (
              <li key={event.id}>
                <strong>{event.source}</strong>
                <span className={page.muted}>
                  {event.created_at ? new Date(event.created_at).toLocaleString() : "—"}
                </span>
                <p>{event.text_preview || event.reason_detail || event.reason_code || "—"}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {message ? <p className={page.message}>{message}</p> : null}
    </div>
  );
}
