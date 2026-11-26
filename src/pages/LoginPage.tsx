import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import TextField from "m3-expressive-react/TextField";
import Button from "m3-expressive-react/Button";
import LoadingIndicator from "m3-expressive-react/LoadingIndicator";
import { useAuth } from "@/auth/AuthContext";
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
      <div className={styles.card}>
        <header className={styles.intro}>
          <img className={styles.logo} src="/logo-square.png" width={72} height={72} alt="" />
          <h1 className={styles.heading}>FromChat Admin login</h1>
          <p className={styles.disclaimer}>
            If you aren&apos;t an admin, you have nothing to do here. Close the tab.
          </p>
        </header>

        <form className={styles.form} onSubmit={onSubmit}>
          <TextField
            className={styles.field}
            variant="outlined"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <TextField
            className={styles.field}
            variant="outlined"
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
          <Button
            type="submit"
            variant="filled"
            size="sm"
            shape="square"
            disabled={loading}
            className={styles.submit}
          >
            {loading ? <LoadingIndicator /> : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export function LoginRoot() {
  return <LoginPage />;
}