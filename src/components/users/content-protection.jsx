"use client";

import { useEffect } from "react";

/**
 * Empêche :
 * - Clic droit (menu contextuel)
 * - Sélection de texte avec souris
 * - Drag des images
 * - Copie au clavier (Ctrl+C, Cmd+C)
 *
 * Note : N'EMPÊCHE PAS :
 * - Screenshots système (impression écran, capture d'écran macOS)
 * - DevTools (F12, qui peuvent voir le HTML brut)
 * - View Source (Ctrl+U)
 * - Logiciels de capture vidéo/audio
 *
 * Le but est de décourager l'utilisateur occasionnel, pas de protéger
 * contre un pirate déterminé.
 */
export function ContentProtection({ children }) {
	useEffect(() => {
		const onContextMenu = (e) => {
			// Permet clic droit sur les inputs (pour le copier-coller normal)
			if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
				return;
			}
			e.preventDefault();
		};

		const onCopy = (e) => {
			// Permet la copie dans les inputs/textarea
			if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
				return;
			}
			e.preventDefault();
		};

		const onSelectStart = (e) => {
			// Permet sélection dans les inputs
			if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
				return;
			}
			e.preventDefault();
		};

		const onDragStart = (e) => {
			if (e.target.tagName === "IMG" || e.target.tagName === "VIDEO") {
				e.preventDefault();
			}
		};

		document.addEventListener("contextmenu", onContextMenu);
		document.addEventListener("copy", onCopy);
		document.addEventListener("selectstart", onSelectStart);
		document.addEventListener("dragstart", onDragStart);

		return () => {
			document.removeEventListener("contextmenu", onContextMenu);
			document.removeEventListener("copy", onCopy);
			document.removeEventListener("selectstart", onSelectStart);
			document.removeEventListener("dragstart", onDragStart);
		};
	}, []);

	return <>{children}</>;
}
