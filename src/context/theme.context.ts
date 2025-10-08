import { Theme, ResolvedTheme } from "@/providers/theme.provider";
import { createContext } from "react";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
  systemTheme: "light",
};

export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState);
