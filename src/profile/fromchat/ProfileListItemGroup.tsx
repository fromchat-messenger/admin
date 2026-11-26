import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import type { ProfileListItemProps } from "@/profile/fromchat/ProfileListItem";
import { listItemPositionInGroup } from "@/profile/fromchat/listItemPosition";

export function ProfileListItemGroup({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<ProfileListItemProps>[];
  const count = items.length;
  return items.map((child, index) =>
    cloneElement(child, {
      key: child.key ?? index,
      position: listItemPositionInGroup(index, count),
      groupItemCount: count,
      divider: index < count - 1,
    }),
  );
}