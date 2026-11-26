export type ListItemPosition = "start" | "middle" | "end";

export function listItemPositionInGroup(index: number, count: number): ListItemPosition {
  if (count <= 0) {
    return "middle";
  }
  if (count === 1) {
    return "start";
  }
  if (index === 0) {
    return "start";
  }
  if (index === count - 1) {
    return "end";
  }
  return "middle";
}

export function listItemShapeClass(position: ListItemPosition, solo: boolean): string {
  if (solo) {
    return "shapeSolo";
  }
  switch (position) {
    case "start":
      return "shapeStart";
    case "end":
      return "shapeEnd";
    default:
      return "shapeMiddle";
  }
}