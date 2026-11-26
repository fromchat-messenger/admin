import { useEffect, useState } from "react";
import Button from "m3-expressive-react/Button";
import { useAuth } from "@/auth/AuthContext";
import { getPageCache, setPageCache } from "@/cache/pageDataCache";
import { useMarkRouteCachedWhenReady } from "@/cache/useMarkRouteCached";
import { useMainPaneBusy } from "@/layout/MainPaneBusy";
import { apiFetch } from "@/api/client";
import { PageHeader } from "@/components/PageHeader";
import page from "@/styles/admin-page.module.scss";

type FileRow = { stored_name: string; kind: string; size_bytes: number; modified_at: string };

type FilesCache = { files: FileRow[]; cursor: string | null };

export function FilesPage() {
  const { session } = useAuth();
  const [prefix, setPrefix] = useState("");
  const cacheKey = `files:${prefix}`;
  const initialCache = getPageCache<FilesCache>(cacheKey);
  const [files, setFiles] = useState<FileRow[]>(initialCache?.files ?? []);
  const [cursor, setCursor] = useState<string | null>(initialCache?.cursor ?? null);
  const [loading, setLoading] = useState(!initialCache);
  const [loadedOnce, setLoadedOnce] = useState(Boolean(initialCache));
  const [error, setError] = useState<string | null>(null);

  useMainPaneBusy(loading, "Loading files…");
  useMarkRouteCachedWhenReady(loadedOnce);

  useEffect(() => {
    const cached = getPageCache<FilesCache>(cacheKey);
    if (cached) {
      setFiles(cached.files);
      setCursor(cached.cursor);
    } else {
      setFiles([]);
      setCursor(null);
    }
  }, [cacheKey]);

  async function load(next?: string | null) {
    if (!session) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "100", prefix });
      if (next) {
        params.set("cursor", next);
      }
      const data = await apiFetch<{ files: FileRow[]; next_cursor: string | null }>(
        `/admin/files?${params}`,
        session.token,
      );
      setFiles((prev) => {
        const nextFiles = next ? [...prev, ...data.files] : data.files;
        if (!next) {
          setPageCache(cacheKey, { files: nextFiles, cursor: data.next_cursor });
          setLoadedOnce(true);
        }
        return nextFiles;
      });
      setCursor(data.next_cursor);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load files";
      setError(message);
      if (!next) {
        setFiles([]);
        setCursor(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [session, prefix]);

  return (
    <div className={page.page}>
      <PageHeader title="Files" subtitle="Browse stored objects via the main API proxy" />
      {error ? (
        <p className={page.hint} role="status">
          {error}
        </p>
      ) : null}
      <div className={`${page.surfaceCard} ${page.toolbar}`}>
        <input
          aria-label="Prefix filter"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="Filter by path prefix…"
          className={page.input}
        />
        <Button variant="filled" onClick={() => void load()}>
          Refresh
        </Button>
      </div>
      <div className={page.tableWrap}>
        <table className={page.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.stored_name}>
                <td>
                  <div>{file.stored_name}</div>
                  <div className={page.muted}>{file.kind}</div>
                </td>
                <td>{(file.size_bytes / 1024).toFixed(1)} KB</td>
                <td className={page.actions}>
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