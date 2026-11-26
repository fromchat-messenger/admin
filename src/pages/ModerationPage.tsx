import { useEffect, useState } from "react";
import Button from "m3-expressive-react/Button";
import TextField from "m3-expressive-react/TextField";
import { useAuth } from "@/auth/AuthContext";
import { useMainPaneBusy } from "@/layout/MainPaneBusy";
import { apiFetch } from "@/api/client";
import { PageHeader } from "@/components/PageHeader";
import page from "@/styles/admin-page.module.scss";

export function ModerationPage() {
  const { session } = useAuth();
  const [words, setWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const [testText, setTestText] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [events, setEvents] = useState<
    { id: number; created_at: string; source: string; reason_detail: string; text_preview: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filterOff, setFilterOff] = useState(false);

  useMainPaneBusy(loading, "Loading moderation data…");

  async function refresh() {
    if (!session) {
      return;
    }
    setLoading(true);
    try {
      const [blocklist, log] = await Promise.all([
        apiFetch<{ words: string[] }>("/moderation/blocklist", session.token).catch(() => {
          setFilterOff(true);
          return { words: [] as string[] };
        }),
        apiFetch<{ events: typeof events }>("/admin/moderation/events?limit=50", session.token),
      ]);
      setWords(blocklist.words);
      setEvents(log.events);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [session]);

  return (
    <div className={page.page}>
      <PageHeader title="Moderation" subtitle="Blocklist, filter testing, and flagged content events" />
      {filterOff ? (
        <p className={page.hint}>
          Chat filter is disabled on this instance; blocklist editing is unavailable. Enable the filter
          service in production for full parity.
        </p>
      ) : null}

      <div className={page.twoCol}>
        <section className={`${page.surfaceCard} ${page.section}`}>
          <h2>Blocklist</h2>
          <div className={page.wordList}>
            {words.map((word) => (
              <span key={word} className={page.chip}>
                {word}
              </span>
            ))}
            {!words.length && !loading ? <p className={page.muted}>No blocked words yet.</p> : null}
          </div>
          <div className={page.toolbar}>
            <TextField label="Add word" value={newWord} onChange={(e) => setNewWord(e.target.value)} />
            <Button
              variant="filled"
              disabled={filterOff}
              onClick={() =>
                session &&
                apiFetch("/moderation/blocklist", session.token, {
                  method: "POST",
                  body: JSON.stringify({ words: [newWord.trim()] }),
                }).then(() => refresh())
              }
            >
              Add
            </Button>
          </div>
        </section>

        <section className={`${page.surfaceCard} ${page.section}`}>
          <h2>Filter tester</h2>
          <TextField label="Text" value={testText} onChange={(e) => setTestText(e.target.value)} />
          <Button
            variant="outlined"
            onClick={() =>
              session &&
              apiFetch<{ allowed: boolean; reason_detail: string }>("/admin/filter/check", session.token, {
                method: "POST",
                body: JSON.stringify({ text: testText }),
              }).then((r) => setTestResult(r.allowed ? "Allowed" : r.reason_detail))
            }
          >
            Check
          </Button>
          {testResult ? <p className={page.message}>{testResult}</p> : null}
        </section>
      </div>

      <section className={`${page.surfaceCard} ${page.section}`}>
        <h2>Flagged events</h2>
        <div className={page.tableWrap}>
          <table className={page.table}>
            <thead>
              <tr>
                <th>When</th>
                <th>Source</th>
                <th>Reason</th>
                <th>Preview</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{new Date(event.created_at).toLocaleString()}</td>
                  <td>{event.source}</td>
                  <td>{event.reason_detail}</td>
                  <td>{event.text_preview}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}