"use client";

import { useEffect, useRef } from "react";

const BLOCKED_SHORTCUTS = new Set(["c", "x", "v", "a", "s", "p", "u", "i", "j", "k", "h"]);

export function ContentProtection({ children }) {
	const announcedRef = useRef(false);

	useEffect(() => {
		const announceProtection = () => {
			if (announcedRef.current) return;
			announcedRef.current = true;
			console.log(
				"%cTOUT MON MATÉRIEL EST PROTÉGÉ PAR LE DROIT D'AUTEUR. TOUTE COPIE EST ILLÉGALE.",
				"color:#dc2626;font-size:16px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;",
			);
		};

		const blockContextMenu = (event) => {
			event.preventDefault();
			announceProtection();
		};

		const blockShortcut = (event) => {
			const key = event.key.toLowerCase();
			const isModifierShortcut = event.ctrlKey || event.metaKey;
			const isDevToolsShortcut = event.shiftKey && (key === "i" || key === "j" || key === "c");

			if (!isModifierShortcut && !isDevToolsShortcut && key !== "f12") {
				return;
			}

			if (key === "f12" || isDevToolsShortcut || (isModifierShortcut && BLOCKED_SHORTCUTS.has(key))) {
				event.preventDefault();
				event.stopPropagation();
				announceProtection();
			}
		};

		const blockCopyLikeActions = (event) => {
			if (event.type === "copy" || event.type === "cut" || event.type === "paste" || event.type === "dragstart" || event.type === "selectstart") {
				event.preventDefault();
				announceProtection();
			}
		};

		document.addEventListener("contextmenu", blockContextMenu, true);
		document.addEventListener("keydown", blockShortcut, true);
		document.addEventListener("copy", blockCopyLikeActions, true);
		document.addEventListener("cut", blockCopyLikeActions, true);
		document.addEventListener("paste", blockCopyLikeActions, true);
		document.addEventListener("dragstart", blockCopyLikeActions, true);
		document.addEventListener("selectstart", blockCopyLikeActions, true);
		announceProtection();

		return () => {
			document.removeEventListener("contextmenu", blockContextMenu, true);
			document.removeEventListener("keydown", blockShortcut, true);
			document.removeEventListener("copy", blockCopyLikeActions, true);
			document.removeEventListener("cut", blockCopyLikeActions, true);
			document.removeEventListener("paste", blockCopyLikeActions, true);
			document.removeEventListener("dragstart", blockCopyLikeActions, true);
			document.removeEventListener("selectstart", blockCopyLikeActions, true);
		};
	}, []);

	return children;
}
