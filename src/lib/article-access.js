const TIER_LEVELS = {
	FREE: 0,
	ACADEMY: 1,
	PRIME: 2,
};

/**
 * Vérifie si un user peut accéder à un article selon son tier.
 * Admin et Instructeur ont toujours accès (peu importe le tier).
 */
export function canAccessArticle(user, article) {
	// Pas connecté → pas d'accès, même pour les articles FREE
	// (les ressources sont réservées aux membres connectés)
	if (!user) {
		return { allowed: false, reason: "not_authenticated" };
	}

	// Admin/Instructeur → accès total
	if (user.role === "ADMIN" || user.role === "INSTRUCTOR") {
		return { allowed: true, reason: "privileged_role" };
	}

	// Compare les tiers : userLevel >= requiredLevel
	const userLevel = TIER_LEVELS[user.membership] ?? 0;
	const requiredLevel = TIER_LEVELS[article.requiredTier] ?? 0;

	if (userLevel >= requiredLevel) {
		return { allowed: true, reason: "tier_match" };
	}

	return { allowed: false, reason: "insufficient_tier" };
}

/**
 * Génère un message + CTA quand l'accès est bloqué.
 */
export function articleAccessBlockedInfo(reason, article) {
	switch (reason) {
		case "not_authenticated":
			return {
				title: "Connexion requise",
				message: "Connecte-toi pour accéder aux ressources AERIA.",
				cta: { label: "Se connecter", href: `/login?callbackUrl=/resources/${article.slug}` },
			};
		case "insufficient_tier":
			return {
				title: article.requiredTier === "PRIME" ? "Réservé aux membres Prime" : "Réservé aux membres Académie",
				message:
					article.requiredTier === "PRIME"
						? "Cet article est exclusif aux membres AERIA Prime. Passe au plan supérieur pour y accéder."
						: "Cet article est réservé aux membres AERIA Académie et Prime.",
				cta: { label: "Voir les abonnements", href: "/pricing" },
			};
		default:
			return {
				title: "Accès refusé",
				message: "Tu n'as pas accès à cette ressource.",
				cta: { label: "Retour aux ressources", href: "/resources" },
			};
	}
}
