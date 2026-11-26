import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import TextField from "m3-expressive-react/TextField";
import Button from "m3-expressive-react/Button";
import LoadingIndicator from "m3-expressive-react/LoadingIndicator";
import { motion } from "framer-motion";
import { useAuth } from "@/auth/AuthContext";
import { pageTransition } from "@/motion/spring";
import styles from "./LoginPage.module.scss";

export function LoginPage() {
  const { session, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-hidden>
        <div className={styles.heroInner}>
          <span className={styles.heroMark}>
            <span className="material-symbols-rounded">forum</span>
          </span>
          <h1 className={styles.heroTitle}>Operate your instance with confidence</h1>
          <p className={styles.heroCopy}>
            Users, moderation, compliance exports, and live health metrics in one console built for
            FromChat administrators.
          </p>
          <ul className={styles.heroList}>
            <li>
              <span className="material-symbols-rounded">monitoring</span> Live host metrics
            </li>
            <li>
              <span className="material-symbols-rounded">shield</span> Moderation &amp; audit trail
            </li>
            <li>
              <span className="material-symbols-rounded">lock</span> Compliance-mode bundle export
            </li>
          </ul>
        </div>
      </section>

      <motion.section
        className={styles.formPane}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={pageTransition}
      >
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...pageTransition, delay: 0.06 }}
        >
          <h2 className={styles.title}>Sign in</h2>
          <p className={styles.subtitle}>Administrator account only (user id 1).</p>
          <form className={styles.form} onSubmit={onSubmit}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" variant="filled" disabled={loading} className={styles.submit}>
              {loading ? <LoadingIndicator /> : "Continue"}
            </Button>
          </form>
        </motion.div>
        <p className={styles.foot}>FromChat Admin · Material 3 Expressive</p>
      </motion.section>
    </div>
  );
}

export function LoginRoot() {
  return <LoginPage />;
}