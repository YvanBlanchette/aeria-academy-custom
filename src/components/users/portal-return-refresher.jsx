"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

/**
 * Composant invisible à mettre dans le layout du dashboard.
 * Si l'URL contient ?refresh=1 (au retour du Customer Portal),
 * force un update() de la session, puis nettoie l'URL.
 */
export function PortalReturnRefresher() {
	const { update } = useSession();
	const searchParams = useSearchParams();

	useEffect(() => {
		if (searchParams.get("refresh") === "1") {
			update();
			// Nettoie le param
			const url = new URL(window.location.href);
			url.searchParams.delete("refresh");
			window.history.replaceState({}, "", url.toString());
		}
	}, [searchParams, update]);

	return null;
}
