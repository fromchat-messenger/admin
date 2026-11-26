import { useEffect, useMemo, useState, type ReactNode } from "react";
import Button from "m3-expressive-react/Button";
import Dialog from "m3-expressive-react/Dialog";
import IconButton from "m3-expressive-react/IconButton";
import List, { ListItem } from "m3-expressive-react/List";
import TextField from "m3-expressive-react/TextField";
import { useAuth } from "@/auth/AuthContext";
import { apiFetch, ApiError } from "@/api/client";
import { ProfileActionButton } from "@/accounts/ProfileActionButton";
import type { AccountUserProfile } from "@/accounts/accountProfileTypes";
import { useAccountProfile } from "@/accounts/useAccountProfile";
import { UserAvatar } from "@/components/UserAvatar";
import styles from "@/accounts/accountProfile.module.scss";

const DISPLAY_NAME_MAX = 64;
const BIO_MAX = 500;

type AccountProfileDialogProps = {
  userId: number | null;
  open: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
};

function formatLastSeen(online: boolean, lastSeen: string | null) {
  if (online) {
    return "Online now";
  }
  if (!lastSeen) {
    return "Recently";
  }
  return new Date(lastSeen).toLocaleString();
}

function formatMemberSince(createdAt: string | null) {
  if (!createdAt) {
    return "—";
  }
  return new Date(createdAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function profileLink(username: string, id: number) {
  const name = username.trim();
  if (name) {
    return `https://fromchat.ru/@${name}`;
  }
  return `https://fromchat.ru/?u=${id}`;
}

function verificationBadge(status: string, verified: boolean) {
  if (!verified) {
    return null;
  }
  if (status === "warning") {
    return (
      <span className={`material-symbols-rounded ${styles.verifiedIcon}`} style={{ color: "#ffa000" }} title="Similar verified">
        warning
      </span>
    );
  }
  if (status === "blocked") {
    return (
      <span className={`material-symbols-rounded ${styles.verifiedIcon}`} style={{ color: "var(--md-sys-color-error)" }} title="Blocked">
        block
      </span>
    );
  }
  return (
    <span className={`material-symbols-rounded ${styles.verifiedIcon}`} title="Verified account">
      verified
    </span>
  );
}

export function AccountProfileDialog({ userId, open, onClose, onProfileUpdated }: AccountProfileDialogProps) {
  const { session } = useAuth();
  const {
    profile,
    events,
    displayName,
    setDisplayName,
    bio,
    setBio,
    loading,
    error,
    reload,
    applyProfile,
  } = useAccountProfile(open ? userId : null);

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [savedDisplayName, setSavedDisplayName] = useState("");
  const [savedBio, setSavedBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [filterSample, setFilterSample] = useState("");
  const [filterResult, setFilterResult] = useState<string | null>(null);
  const [adminBusy, setAdminBusy] = useState(false);
  const [confirm, setConfirm] = useState<
    null | "verify" | "unverify" | "suspend" | "unsuspend" | "delete"
  >(null);
  const [suspendReason, setSuspendReason] = useState("");

  useEffect(() => {
    if (!open) {
      setMode("view");
      setConfirm(null);
      setFilterResult(null);
    }
  }, [open]);

  useEffect(() => {
    if (profile) {
      setSavedDisplayName(profile.display_name);
      setSavedBio(profile.bio ?? "");
    }
  }, [profile?.id, profile?.display_name, profile?.bio]);

  const displayLabel = profile?.display_name?.trim() || profile?.username || "";
  const usernameVisible = profile?.username?.trim() || "";
  const showAdmin = profile != null && profile.id !== 1;

  const editDirty = displayName.trim() !== savedDisplayName.trim() || bio.trim() !== savedBio.trim();
  const displayNameError =
    displayName.trim().length === 0 || displayName.trim().length > DISPLAY_NAME_MAX;
  const bioError = bio.length > BIO_MAX;
  const canSaveEdit = !saving && editDirty && !displayNameError && !bioError;

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  async function runFilterCheck() {
    if (!session || !filterSample.trim()) {
      return;
    }
    const data = await apiFetch<{ allowed: boolean; reason_detail: string }>("/admin/filter/check", session.token, {
      method: "POST",
      body: JSON.stringify({ text: filterSample }),
    });
    setFilterResult(data.allowed ? "Allowed" : data.reason_detail || "Blocked");
  }

  async function adminAction(path: string, body?: object): Promise<boolean> {
    if (!session) {
      return false;
    }
    setAdminBusy(true);
    try {
      await apiFetch(path, session.token, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
      await reload();
      onProfileUpdated?.();
      return true;
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Action failed");
      return false;
    } finally {
      setAdminBusy(false);
      setConfirm(null);
    }
  }

  async function saveEdit() {
    if (!session || !profile || !canSaveEdit) {
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await apiFetch<AccountUserProfile>(`/admin/users/${profile.id}`, session.token, {
        method: "PUT",
        body: JSON.stringify({ display_name: displayName.trim(), bio: bio.trim() }),
      });
      applyProfile(updated);
      setSavedDisplayName(updated.display_name);
      setSavedBio(updated.bio ?? "");
      setMode("view");
      onProfileUpdated?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function resetEditFields() {
    setDisplayName(savedDisplayName);
    setBio(savedBio);
  }

  function enterEdit(focus?: "displayName" | "bio") {
    setMode("edit");
    if (focus === "displayName" || focus === "bio") {
      requestAnimationFrame(() => {
        const id = focus === "bio" ? "admin-edit-bio" : "admin-edit-display-name";
        document.getElementById(id)?.focus();
      });
    }
  }

  const detailRows = useMemo(() => {
    if (!profile || profile.deleted) {
      return [];
    }
    const rows: { key: string; headline: string; supporting: string; icon: string; onEdit?: () => void }[] = [];
    if (usernameVisible) {
      rows.push({
        key: "username",
        headline: "Username",
        supporting: `@${usernameVisible}`,
        icon: "alternate_email",
      });
    }
    if (profile.created_at) {
      rows.push({
        key: "since",
        headline: "On FromChat",
        supporting: formatMemberSince(profile.created_at),
        icon: "calendar_month",
      });
    }
    if (profile.bio?.trim()) {
      rows.push({
        key: "bio",
        headline: "Bio",
        supporting: profile.bio,
        icon: "info",
        onEdit: () => enterEdit("bio"),
      });
    }
    if (profile.verified) {
      rows.push({
        key: "verify",
        headline: "Verified account",
        supporting: "This account is an official FromChat representative.",
        icon: "verified",
      });
    }
    return rows;
  }, [profile, usernameVisible]);

  const title = mode === "edit" ? "Edit profile" : displayLabel || "Profile";

  function handleShellClose() {
    if (mode === "edit") {
      setMode("view");
      return;
    }
    onClose();
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleShellClose}
        fullScreen
        title={title}
        closeLabel="Close profile"
        actions={
          mode === "edit" ? (
            <IconButton
              variant="standard"
              aria-label="Reset changes"
              disabled={!editDirty || saving}
              onClick={resetEditFields}
              icon={<span className="material-symbols-rounded">restart_alt</span>}
            />
          ) : undefined
        }
      >
        {mode === "edit" ? (
          <div className={styles.shell}>
            <div className={styles.scroll}>
              <div className={styles.column}>
                <div className={styles.avatarWrap}>
                  <UserAvatar name={displayName.trim() || "?"} size="xl" shape="circle" />
                </div>
                <div className={styles.editFieldBlock}>
                  <TextField
                    id="admin-edit-display-name"
                    label="Display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={saving}
                    error={displayNameError}
                    errorText={displayNameError ? "Enter a display name (max 64 characters)." : undefined}
                    supportingText={!displayNameError ? `${displayName.length} / ${DISPLAY_NAME_MAX}` : undefined}
                    maxLength={DISPLAY_NAME_MAX}
                  />
                </div>
                <div className={styles.editFieldBlock}>
                  <TextField
                    id="admin-edit-bio"
                    label="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={saving}
                    multiline
                    rows={4}
                    error={bioError}
                    errorText={bioError ? `Bio cannot exceed ${BIO_MAX} characters.` : undefined}
                    supportingText={!bioError && bio ? `${bio.length} / ${BIO_MAX}` : undefined}
                    maxLength={BIO_MAX}
                  />
                </div>
                {saveError ? <p className={styles.emptyState}>{saveError}</p> : null}
              </div>
            </div>
            <div className={styles.editBottom}>
              <Button variant="filled" style={{ width: "100%" }} disabled={!canSaveEdit} onClick={() => void saveEdit()}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.shell}>
            <div className={styles.scroll}>
              {loading && !profile ? (
                <p className={styles.emptyState}>Loading…</p>
              ) : !profile ? (
                <p className={styles.emptyState}>{error ?? "User not found"}</p>
              ) : (
                <div className={styles.column}>
                  <div className={styles.avatarWrap}>
                    <UserAvatar name={displayLabel} size="lg" shape="circle" />
                  </div>

                  <div className={styles.headlineRow}>
                    <h2 className={styles.headline}>{displayLabel}</h2>
                    {verificationBadge(profile.verification_status, profile.verified)}
                  </div>

                  {!profile.deleted ? (
                    <p className={styles.statusLine} data-online={profile.online ? "true" : "false"}>
                      {formatLastSeen(profile.online, profile.last_seen)}
                    </p>
                  ) : null}

                  <div className={styles.actionRow}>
                    <ProfileActionButton
                      label="Edit"
                      icon={<span className="material-symbols-rounded">edit</span>}
                      onClick={() => enterEdit()}
                      disabled={profile.deleted}
                    />
                    <ProfileActionButton
                      label="Link"
                      icon={<span className="material-symbols-rounded">link</span>}
                      onClick={() => void copyText(profileLink(profile.username, profile.id))}
                      disabled={profile.deleted}
                    />
                    <ProfileActionButton
                      label="Copy"
                      icon={<span className="material-symbols-rounded">content_copy</span>}
                      onClick={() => void copyText(displayLabel)}
                    />
                  </div>

                  {detailRows.length > 0 ? (
                    <ProfileCategory>
                      <List variant="segmented" aria-label="Profile details">
                        {detailRows.map((row) => (
                          <ListItem
                            key={row.key}
                            headline={row.headline}
                            supportingText={
                              row.key === "bio" ? (
                                <p className={styles.bioText}>{row.supporting}</p>
                              ) : (
                                row.supporting
                              )
                            }
                            leading={
                              <span className={`material-symbols-rounded ${styles.leadingIcon}`}>{row.icon}</span>
                            }
                            trailing={
                              row.onEdit ? (
                                <IconButton
                                  variant="standard"
                                  size="sm"
                                  aria-label={`Edit ${row.headline.toLowerCase()}`}
                                  onClick={row.onEdit}
                                  icon={<span className="material-symbols-rounded">edit</span>}
                                />
                              ) : (
                                <IconButton
                                  variant="standard"
                                  size="sm"
                                  aria-label={`Copy ${row.headline.toLowerCase()}`}
                                  onClick={() => void copyText(row.supporting)}
                                  icon={<span className="material-symbols-rounded">content_copy</span>}
                                />
                              )
                            }
                          />
                        ))}
                      </List>
                    </ProfileCategory>
                  ) : null}

                  {showAdmin ? (
                    <div className={styles.category}>
                      <p className={styles.categoryTitle}>Administration</p>
                      <List variant="segmented" aria-label="Admin actions">
                        <ListItem
                          headline={profile.verified ? "Remove verification" : "Verify account"}
                          onClick={() => setConfirm(profile.verified ? "unverify" : "verify")}
                          disabled={adminBusy}
                          leading={
                            <span className={`material-symbols-rounded ${styles.leadingIcon}`}>verified</span>
                          }
                        />
                        <ListItem
                          headline={profile.suspended ? "Unsuspend account" : "Suspend account"}
                          onClick={() =>
                            profile.suspended
                              ? setConfirm("unsuspend")
                              : (setSuspendReason(""), setConfirm("suspend"))
                          }
                          disabled={adminBusy}
                          leading={
                            <span className={`material-symbols-rounded ${styles.leadingIconDanger}`}>
                              {profile.suspended ? "check_circle" : "block"}
                            </span>
                          }
                        />
                        <ListItem
                          headline="Delete account"
                          onClick={() => setConfirm("delete")}
                          disabled={adminBusy}
                          leading={
                            <span className={`material-symbols-rounded ${styles.leadingIconDanger}`}>
                              delete_forever
                            </span>
                          }
                        />
                      </List>
                    </div>
                  ) : null}

                  <div className={styles.category}>
                    <p className={styles.categoryTitle}>Chat filter check</p>
                    <div className={styles.filterRow}>
                      <TextField
                        label="Sample text"
                        value={filterSample}
                        onChange={(e) => setFilterSample(e.target.value)}
                        style={{ flex: "1 1 12rem" }}
                      />
                      <Button variant="filled" onClick={() => void runFilterCheck()}>
                        Run check
                      </Button>
                      {filterResult ? <span className={styles.meta}>{filterResult}</span> : null}
                    </div>
                  </div>

                  {events.length > 0 ? (
                    <div className={styles.category}>
                      <p className={styles.categoryTitle}>Moderation triggers</p>
                      <ul className={styles.eventList}>
                        {events.map((event) => (
                          <li key={event.id} className={styles.eventItem}>
                            <strong>{event.source}</strong>
                            <time className={styles.meta}>
                              {event.created_at ? new Date(event.created_at).toLocaleString() : "—"}
                            </time>
                            <p>{event.text_preview || event.reason_detail || event.reason_code || "—"}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        open={confirm != null}
        onClose={() => !adminBusy && setConfirm(null)}
        title={
          confirm === "verify"
            ? "Verify account?"
            : confirm === "unverify"
              ? "Remove verification?"
              : confirm === "suspend"
                ? "Suspend account?"
                : confirm === "unsuspend"
                  ? "Unsuspend account?"
                  : "Delete account?"
        }
        actions={
          <>
            <Button variant="text" disabled={adminBusy} onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="filled"
              disabled={adminBusy || (confirm === "suspend" && !suspendReason.trim())}
              onClick={() => {
                if (!profile) {
                  return;
                }
                const id = profile.id;
                if (confirm === "verify" || confirm === "unverify") {
                  void adminAction(`/user/${id}/verify`);
                } else if (confirm === "suspend") {
                  void adminAction(`/user/${id}/suspend`, { reason: suspendReason.trim() });
                } else if (confirm === "unsuspend") {
                  void adminAction(`/user/${id}/unsuspend`);
                } else if (confirm === "delete") {
                  void (async () => {
                    const ok = await adminAction(`/user/${id}/delete`);
                    if (ok) {
                      onClose();
                    }
                  })();
                }
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        {confirm === "verify" ? <p>Mark this account as officially verified?</p> : null}
        {confirm === "unverify" ? <p>Remove official verification from this account?</p> : null}
        {confirm === "suspend" ? (
          <>
            <p>The user will not be able to send messages while suspended.</p>
            <TextField
              label="Reason"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              multiline
            />
          </>
        ) : null}
        {confirm === "unsuspend" ? <p>Allow this account to use FromChat again?</p> : null}
        {confirm === "delete" ? <p>Delete this user account? This cannot be undone from the panel.</p> : null}
      </Dialog>
    </>
  );
}

function ProfileCategory({ children }: { children: ReactNode }) {
  return <div className={styles.category}>{children}</div>;
}