import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "m3-expressive-react/SearchBar";
import { useAuth } from "@/auth/AuthContext";
import { useMainPaneBusy } from "@/layout/MainPaneBusy";
import { apiFetch } from "@/api/client";
import { PageHeader } from "@/components/PageHeader";
import { StatusChip } from "@/components/StatusChip";
import { TablePager } from "@/components/TablePager";
import { UserAvatar } from "@/components/UserAvatar";
import page from "@/styles/admin-page.module.scss";

type UserRow = {
  id: number;
  username: string;
  display_name: string;
  suspended: boolean;
  suspended_until: string | null;
  verified: boolean;
  deleted: boolean;
  online?: boolean;
  last_seen?: string | null;
  verification_status?: string;
};

type Segment = "all" | "active" | "suspended";

const STATUS_BY_SEGMENT: Record<Segment, "all" | "active" | "suspended"> = {
  all: "all",
  active: "active",
  suspended: "suspended",
};

function formatLastSeen(online: boolean | undefined, lastSeen: string | null | undefined) {
  if (online) {
    return "Online";
  }
  if (!lastSeen) {
    return "—";
  }
  return new Date(lastSeen).toLocaleString();
}

function userFlags(user: UserRow) {
  const flags: { key: string; status: Parameters<typeof StatusChip>[0]["status"]; label: string }[] = [];
  if (user.id === 1) {
    flags.push({ key: "owner", status: "owner", label: "Owner" });
  }
  if (user.verified) {
    flags.push({ key: "verified", status: "verified", label: "Verified" });
  }
  if (user.suspended) {
    flags.push({ key: "suspended", status: "suspended", label: "Suspended" });
  }
  if (user.deleted) {
    flags.push({ key: "deleted", status: "deleted", label: "Deleted" });
  }
  if (user.online) {
    flags.push({ key: "online", status: "active", label: "Online" });
  }
  return flags;
}

export function AccountsPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<Segment>("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const limit = 20;

  useMainPaneBusy(loading && rows.length === 0, "Loading accounts…");

  const load = useCallback(async () => {
    if (!session) {
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
        status: STATUS_BY_SEGMENT[segment],
      });
      if (query.trim()) {
        params.set("q", query.trim());
      }
      const data = await apiFetch<{ users: UserRow[]; total: number }>(
        `/admin/users?${params}`,
        session.token,
      );
      setRows(data.users);
      setTotal(data.total);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [session, offset, query, segment]);

  useEffect(() => {
    void load();
  }, [load]);

  function openUser(userId: number) {
    navigate(`/accounts/${userId}`, { state: { aospForward: true } });
  }

  return (
    <div className={page.page}>
      <PageHeader
        title="Accounts"
        subtitle={`${total} registered · search and moderate from this list`}
        actions={
          <div className={page.segmented} role="tablist" aria-label="Filter accounts">
            {(["all", "active", "suspended"] as const).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                data-active={segment === key}
                aria-selected={segment === key}
                onClick={() => {
                  setSegment(key);
                  setOffset(0);
                }}
              >
                {key === "all" ? "All" : key === "active" ? "Active" : "Suspended"}
              </button>
            ))}
          </div>
        }
      />

      <div className={page.searchDock}>
        <SearchBar
          className={page.searchBar}
          value={q}
          onChange={(_, value) => setQ(value)}
          onSearch={(value) => {
            setQuery(value);
            setOffset(0);
          }}
          placeholder="Search users"
          inputProps={{ "aria-label": "Search users" }}
        />
      </div>

      {!loading || rows.length > 0 ? (
        <div className={page.tableWrap}>
          <table className={page.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>ID</th>
                <th>Flags</th>
                <th>Last activity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id} className={page.clickableRow} onClick={() => openUser(user.id)}>
                  <td>
                    <div className={page.userCell}>
                      <UserAvatar name={user.display_name || user.username} />
                      <div className={page.userMeta}>
                        <strong>{user.display_name}</strong>
                        <span className={page.muted}>@{user.username}</span>
                      </div>
                    </div>
                  </td>
                  <td>{user.id}</td>
                  <td>
                    <div className={page.flagWrap}>
                      {userFlags(user).map((flag) => (
                        <StatusChip key={flag.key} status={flag.status}>
                          {flag.label}
                        </StatusChip>
                      ))}
                    </div>
                  </td>
                  <td className={page.muted}>{formatLastSeen(user.online, user.last_seen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <TablePager
        offset={offset}
        limit={limit}
        total={total}
        onPrevious={() => setOffset(Math.max(0, offset - limit))}
        onNext={() => setOffset(offset + limit)}
      />
      {message ? <p className={page.message}>{message}</p> : null}
    </div>
  );
}