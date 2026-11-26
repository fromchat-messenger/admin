import { FormEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TextField from "m3-expressive-react/TextField";
import { useAuth } from "@/auth/AuthContext";
import { LoginErrorBanner } from "@/components/LoginErrorBanner";
import { LoginSubmitButton } from "@/components/LoginSubmitButton";
import { pageTransition } from "@/motion/spring";
import styles from "./LoginPage.module.scss";

const ERROR_VISIBLE_MS = 3000;

const loginReveal = {
  ...pageTransition,
  mass: 0.72,
};

const loginLeave = {
  ...pageTransition,
  stiffness: 420,
  damping: 36,
  mass: 0.55,
};

export function LoginPage() {
  const navigate = useNavigate();
  const { session, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const freshLoginRef = useRef(false);

  useEffect(() => {
    if (!error) {
      return;
    }
    const timeout = window.setTimeout(() => setError(null), ERROR_VISIBLE_MS);
    return () => window.clearTimeout(timeout);
  }, [error]);

  useEffect(() => {
    if (session && !freshLoginRef.current && !leaving) {
      navigate("/dashboard", { replace: true });
    }
  }, [session, leaving, navigate]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading || leaving) {
      return;
    }
    setError(null);
    setLoading(true);
    try {
      freshLoginRef.current = true;
      await login(username.trim(), password);
      setLeaving(true);
    } catch (err) {
      freshLoginRef.current = false;
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={
        leaving
          ? { opacity: 0, scale: 0.97, filter: "blur(6px)" }
          : { opacity: 1, scale: 1, filter: "blur(0px)" }
      }
      style={{ transformOrigin: "center center" }}
      transition={leaving ? loginLeave : loginReveal}
      onAnimationComplete={() => {
        if (leaving) {
          navigate("/dashboard", { replace: true, state: { fromLogin: true } });
        }
      }}
    >
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...loginReveal, delay: 0.04 }}
      >
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
            startIcon={
              <span className="material-symbols-rounded" aria-hidden>
                person
              </span>
            }
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
            startIcon={
              <span className="material-symbols-rounded" aria-hidden>
                lock
              </span>
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <LoginErrorBanner message={error}>
            <LoginSubmitButton loading={loading} />
          </LoginErrorBanner>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function LoginRoot() {
  return <LoginPage />;
}