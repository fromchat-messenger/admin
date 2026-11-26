import { createContext, useContext, useMemo, type ReactNode } from "react";

export type CategoryContextValue = {
  containerColor: string;
  dividerColor: string;
  dividerThicknessPx: number;
};

const CategoryContext = createContext<CategoryContextValue | null>(null);

export function CategoryProvider({
  containerColor,
  dividerColor = "transparent",
  dividerThicknessPx = 3,
  children,
}: {
  containerColor: string;
  dividerColor?: string;
  dividerThicknessPx?: number;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ containerColor, dividerColor, dividerThicknessPx }),
    [containerColor, dividerColor, dividerThicknessPx],
  );
  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

export function useCategoryContext() {
  return useContext(CategoryContext);
}