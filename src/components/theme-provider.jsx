"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "aeria-theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

const ThemeContext = createContext(undefined);

function getSystemTheme() {
	if (typeof window === "undefined") return "light";
	return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
}

export function ThemeProvider({ children, defaultTheme = "system", enableSystem = true }) {
	const [theme, setThemeState] = useState(() => {
		if (typeof window === "undefined") return defaultTheme;
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (stored === "light" || stored === "dark" || (enableSystem && stored === "system")) {
			return stored;
		}
		return defaultTheme;
	});
	const [resolvedTheme, setResolvedTheme] = useState("light");

	useEffect(() => {
		const mq = window.matchMedia(MEDIA_QUERY);

		const applyTheme = () => {
			const nextResolved = theme === "system" ? getSystemTheme() : theme;
			setResolvedTheme(nextResolved);
			document.documentElement.classList.toggle("dark", nextResolved === "dark");
			document.documentElement.style.colorScheme = nextResolved;
		};

		applyTheme();
		mq.addEventListener("change", applyTheme);
		return () => mq.removeEventListener("change", applyTheme);
	}, [theme]);

	const setTheme = useCallback(
		(nextTheme) => {
			const normalized = enableSystem && nextTheme === "system" ? "system" : nextTheme === "dark" ? "dark" : "light";
			setThemeState(normalized);
			window.localStorage.setItem(STORAGE_KEY, normalized);
		},
		[enableSystem],
	);

	const value = useMemo(
		() => ({
			theme,
			resolvedTheme,
			setTheme,
		}),
		[theme, resolvedTheme, setTheme],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within ThemeProvider");
	}
	return context;
}
