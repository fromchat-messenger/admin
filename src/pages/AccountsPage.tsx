import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "m3-expressive-react/Button";
import TextField from "m3-expressive-react/TextField";
import { useAuth } from "@/auth/AuthContext";
import { useMainPaneBusy } from "@/layout/MainPaneBusy";
import { apiFetch, ApiError } from "@/api/client";
import { PageHeader } from "@/components/PageHeader";
import { StatusChip } from "@/components/StatusChip";
import { UserAvatar } from "@/components/UserAvatar";
import page from "@/styles/admin-page.module.scss";

type UserRow = {
  id: number;
  username: string;
  display_name: string;
  suspended: boolean;
  suspension_reason: string | null;
  suspended_until: string | null;
  verified: boolean;
  deleted: boolean;
};

type Segment = "all" | "active" | "suspended";

export function AccountsPage() {
  const { session } = useAuth();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState("");
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
        status: "all",
      });
      if (q.trim()) {
        params.set("q", q.trim());
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
  }, [session, offset, q]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (segment === "all") {
      return rows;
    }
    if (segment === "active") {
      return rows.filter((user) => !user.deleted && !user.suspended);
    }
    return rows.filter((user) => user.suspended && !user.deleted);
  }, [rows, segment]);

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
                onClick={() => setSegment(key)}
              >
                {key === "all" ? "All" : key === "active" ? "Active" : "Suspended"}
              </button>
            ))}
          </div>
        }
      />

      <div className={`${page.surfaceCard} ${page.toolbar}`}>
        <TextField label="Search users" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button
          variant="filled"
          onClick={() => {
            setOffset(0);
            void load();
          }}
        >
          Search
        </Button>
      </div>

      {!loading || rows.length > 0 ? (
        <div className={page.tableWrap}>
          <table className={page.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={page.userCell}>
                      <UserAvatar name={user.display_name || user.username} />
                      <div className={page.userMeta}>
                        <strong>{user.display_name}</strong>
                        <span className={page.muted}>
                          @{user.username} · id {user.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {user.id === 1 ? (
                      <StatusChip status="owner">Owner</StatusChip>
                    ) : user.deleted ? (
                      <StatusChip status="deleted">Deleted</StatusChip>
                    ) : user.suspended ? (
                      <div>
                        <StatusChip status="suspended">Suspended</StatusChip>
                        {user.suspended_until ? (
                          <p className={page.muted}>
                            Until {new Date(user.suspended_until).toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <StatusChip status="active">Active</StatusChip>
                    )}
                    {user.verified && user.id !== 1 ? (
                      <div className={page.verifiedRow}>
                        <StatusChip status="verified">Verified</StatusChip>
                      </div>
                    ) : null}
                  </td>
                  <td className={page.actions}>
                    {user.id !== 1 ? (
                      <>
                        <Button variant="text" onClick={() => act(`/user/${user.id}/verify`)}>
                          {user.verified ? "Unverify" : "Verify"}
                        </Button>
                        {user.suspended ? (
                          <Button variant="text" onClick={() => act(`/user/${user.id}/unsuspend`)}>
                            Unsuspend
                          </Button>
                        ) : (
                          <Button
                            variant="text"
                            onClick={() =>
                              act(`/user/${user.id}/suspend`, { reason: "Admin panel suspension" })
                            }
                          >
                            Suspend
                          </Button>
                        )}
                        <Button variant="text" onClick={() => act(`/user/${user.id}/delete`)}>
                          Delete
                        </Button>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className={page.pager}>
        <Button variant="outlined" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>
          Previous
        </Button>
        <span>
          {offset + 1}–{Math.min(offset + limit, total)} of {total}
        </span>
        <Button variant="outlined" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}>
          Next
        </Button>
      </div>
      {message ? <p className={page.message}>{message}</p> : null}
    </div>
  );
}