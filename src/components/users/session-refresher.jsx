"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle2 } from "lucide-react";

/**
 * Composant invisible qui :
 * 1. Polls la session toutes les 2s
 * 2. Si membership === FREE, force un update() pour re-fetcher depuis la DB
 * 3. S'arrête dès que membership !== FREE (le webhook Stripe a fini)
 * 4. Abandonne après 15 secondes (au cas où le webhook n'arrive jamais)
 */
export function SessionRefresher() {
	const { data: session, update, status } = useSession();
	const [state, setState] = useState("loading"); // loading | success | timeout

	useEffect(() => {
		if (status !== "authenticated") return;

		// Déjà membre → rien à faire
		if (session?.user?.membership && session.user.membership !== "FREE") {
			setState("success");
			return;
		}

		let attempts = 0;
		const maxAttempts = 8; // 8 × 2s = 16s

		const interval = setInterval(async () => {
			attempts++;
			const updated = await update(); // Force le re-fetch depuis la DB

			if (updated?.user?.membership && updated.user.membership !== "FREE") {
				setState("success");
				clearInterval(interval);
				return;
			}

			if (attempts >= maxAttempts) {
				setState("timeout");
				clearInterval(interval);
			}
		}, 2000);

		return () => clearInterval(interval);
	}, [status]); // eslint-disable-line react-hooks/exhaustive-deps

	if (state === "loading") {
		return (
			<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" />
				Activation de ton abonnement...
			</div>
		);
	}

	if (state === "success") {
		return (
			<div className="flex items-center justify-center gap-2 text-sm text-green-600">
				<CheckCircle2 className="h-4 w-4" />
				Abonnement activé : {session?.user?.membership}
			</div>
		);
	}

	// timeout
	return (
		<div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-md">
			⚠️ Ton paiement est confirmé mais l&apos;activation prend plus de temps que prévu. Si ton accès n&apos;apparaît pas, déconnecte-toi puis reconnecte-toi.
		</div>
	);
}
