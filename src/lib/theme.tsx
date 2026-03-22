import { createContext, useContext, createSignal, type ParentComponent, type JSX } from "solid-js";
import { setThemeCookie } from "../server/theme.ts";

type ThemeContextType = {
  theme: () => "light" | "dark";
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>();

export const ThemeProvider: ParentComponent<{ initialTheme: "light" | "dark" }> = (props): JSX.Element => {
  const [theme, setTheme] = createSignal(props.initialTheme);

  const toggleTheme = async () => {
    const next = theme() === "dark" ? "light" : "dark" as const;
    setTheme(next);
    try {
      await setThemeCookie({ data: next });
    } catch (e) { }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};