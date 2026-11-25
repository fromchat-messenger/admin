import { useCallback, useEffect, useState } from "react";
import Button from "m3-expressive-react/Button";
import TextField from "m3-expressive-react/TextField";
import LoadingIndicator from "m3-expressive-react/LoadingIndicator";
import { useAuth } from "@/auth/AuthContext";
import { apiFetch, ApiError } from "@/api/client";
import styles from "./AccountsPage.module.scss";

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

export function AccountsPage() {
  const { session } = useAuth();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const limit = 20;

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
    <div className={styles.page}>
      <h1>Accounts</h1>
      <div className={styles.toolbar}>
        <TextField label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button variant="filled" onClick={() => { setOffset(0); void load(); }}>
          Search
        </Button>
      </div>
      {loading ? (
        <LoadingIndicator />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.display_name}</strong>
                    <div className={styles.muted}>@{user.username} · id {user.id}</div>
                  </td>
                  <td>
                    {user.deleted ? "Deleted" : user.suspended ? "Suspended" : "Active"}
                    {user.suspended_until ? (
                      <div className={styles.muted}>Until {new Date(user.suspended_until).toLocaleString()}</div>
                    ) : null}
                  </td>
                  <td className={styles.actions}>
                    {user.id !== 1 ? (
                      <>
                        <Button
                          variant="text"
                          onClick={() =>
                            act(`/user/${user.id}/verify`)
                          }
                        >
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
                        <Button
                          variant="text"
                          onClick={() => act(`/user/${user.id}/delete`)}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <span className={styles.muted}>Owner</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className={styles.pager}>
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
      {message ? <p className={styles.message}>{message}</p> : null}
    </div>
  );
}