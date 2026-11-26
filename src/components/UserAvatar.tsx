import styles from "./UserAvatar.module.scss";

type UserAvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "rounded" | "circle";
};

export function UserAvatar({ name, size = "md", shape = "rounded" }: UserAvatarProps) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span className={styles.avatar} data-size={size} data-shape={shape} aria-hidden>
      {initials || "?"}
    </span>
  );
}