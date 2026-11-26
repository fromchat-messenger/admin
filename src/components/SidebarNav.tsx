import { useNavigate } from "react-router-dom";
import List, { ListItem } from "m3-expressive-react/List";
import styles from "./SidebarNav.module.scss";

export type SidebarNavItem = { to: string; icon: string; label: string };

type SidebarNavProps = {
  label: string;
  items: SidebarNavItem[];
  activePath: string;
};

export function SidebarNav({ label, items, activePath }: SidebarNavProps) {
  const navigate = useNavigate();
  const active =
    items.find((item) => activePath === item.to || activePath.startsWith(`${item.to}/`))?.to ?? null;

  return (
    <section className={styles.group} aria-labelledby={`nav-${label}`}>
      <h2 id={`nav-${label}`} className={styles.groupLabel}>
        {label}
      </h2>
      <List
        className={styles.list}
        selectionMode="single"
        variant="standard"
        value={active}
        onChange={(_event, value) => {
          if (typeof value === "string") {
            navigate(value);
          }
        }}
        aria-label={label}
      >
        {items.map((item) => (
          <ListItem
            key={item.to}
            value={item.to}
            headline={item.label}
            leading={
              <span className="material-symbols-rounded" aria-hidden>
                {item.icon}
              </span>
            }
          />
        ))}
      </List>
    </section>
  );
}