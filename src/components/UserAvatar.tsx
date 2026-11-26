import styles from "./UserAvatar.module.scss";

type UserAvatarProps = {
  name: string;
  size?: "sm" | "md";
};

export function UserAvatar({ name, size = "md" }: UserAvatarProps) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span className={styles.avatar} data-size={size} aria-hidden>
      {initials || "?"}
    </span>
  );
}