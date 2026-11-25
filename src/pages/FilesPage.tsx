import { useEffect, useState } from "react";
import Button from "m3-expressive-react/Button";
import LoadingIndicator from "m3-expressive-react/LoadingIndicator";
import { useAuth } from "@/auth/AuthContext";
import { apiFetch } from "@/api/client";
import styles from "./AccountsPage.module.scss";

type FileRow = { stored_name: string; kind: string; size_bytes: number; modified_at: string };

export function FilesPage() {
  const { session } = useAuth();
  const [files, setFiles] = useState<FileRow[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [prefix, setPrefix] = useState("");

  async function load(next?: string | null) {
    if (!session) {
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ limit: "100", prefix });
    if (next) {
      params.set("cursor", next);
    }
    const data = await apiFetch<{ files: FileRow[]; next_cursor: string | null }>(
      `/admin/files?${params}`,
      session.token,
    );
    setFiles((prev) => (next ? [...prev, ...data.files] : data.files));
    setCursor(data.next_cursor);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [session, prefix]);

  return (
    <div className={styles.page}>
      <h1>Files</h1>
      <div className={styles.toolbar}>
        <input
          aria-label="Prefix filter"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="Prefix filter"
          className={styles.input}
        />
        <Button variant="filled" onClick={() => void load()}>
          Refresh
        </Button>
      </div>
      {loading && !files.length ? <LoadingIndicator /> : null}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.stored_name}>
                <td>
                  <div>{file.stored_name}</div>
                  <div className={styles.muted}>{file.kind}</div>
                </td>
                <td>{(file.size_bytes / 1024).toFixed(1)} KB</td>
                <td className={styles.actions}>
                  <Button
                    variant="text"
                    onClick={() => {
                      if (!session) {
                        return;
                      }
                      if (confirm(`Delete ${file.stored_name}?`)) {
                        void apiFetch(`/admin/files/${encodeURIComponent(file.stored_name)}`, session.token, {
                          method: "DELETE",
                        }).then(() => load());
                      }
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {cursor ? (
        <Button variant="outlined" onClick={() => void load(cursor)}>
          Load more
        </Button>
      ) : null}
    </div>
  );
}