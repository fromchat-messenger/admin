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
      <motion.section
        className={styles.card}
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={pageTransition}
      >
        <h1 className={styles.title}>FromChat Admin</h1>
        <p className={styles.subtitle}>Sign in with your administrator account.</p>
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
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <Button type="submit" variant="filled" disabled={loading} className={styles.submit}>
            {loading ? <LoadingIndicator /> : "Sign in"}
          </Button>
        </form>
      </motion.section>
    </div>
  );
}

export function LoginRoot() {
  return <LoginPage />;
}