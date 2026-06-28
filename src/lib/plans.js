import { dict } from "@/lib/i18n";

// Mapping centralisé : tier de membership ↔ Price ID Stripe
export const PLANS = {
	ACADEMY: {
		tier: "ACADEMY",
		name: "Académie",
		priceId: process.env.STRIPE_PRICE_ACADEMY,
		priceCents: 2900,
	},
	PRIME: {
		tier: "PRIME",
		name: "Prime",
		priceId: process.env.STRIPE_PRICE_PRIME,
		priceCents: 4900,
	},
};

function getPricingContent(locale = "fr") {
	return dict[locale]?.pricing ?? dict.fr?.pricing ?? dict.en?.pricing;
}

export function getLocalizedPlans(locale = "fr") {
	const pricing = getPricingContent(locale);
	const plans = pricing?.plans ?? {};

	return [
		{
			id: "free",
			tier: "FREE",
			name: plans.free?.name ?? "Découverte",
			title: plans.free?.title ?? "Membre Découverte",
			price: "0",
			period: plans.free?.period ?? "Gratuit",
			description: plans.free?.description ?? "Découvre l'académie ÆRIA Voyages en libre accès",
			features: plans.free?.features ?? ["Cours gratuits", "Capsules audio en accès libre", "Création de compte"],
		},
		{
			id: "academy",
			tier: "ACADEMY",
			name: plans.academy?.name ?? "Académie",
			title: plans.academy?.title ?? "Membre Académie",
			price: "29",
			period: plans.academy?.period ?? "/ mois",
			description: plans.academy?.description ?? "Accès illimité à tous les cours de l'académie de voyages ÆRIA",
			features: plans.academy?.features ?? [
				"Accès à TOUS les cours",
				"Toutes les capsules audio",
				"Tests et certificats",
				"Nouveaux cours inclus",
				"Annulable à tout moment",
			],
			featured: true,
		},
		{
			id: "prime",
			tier: "PRIME",
			name: plans.prime?.name ?? "Prime",
			title: plans.prime?.title ?? "Membre Prime",
			price: "49",
			period: plans.prime?.period ?? "/ mois",
			description: plans.prime?.description ?? "Académie + accompagnement personnalisé",
			features: plans.prime?.features ?? ["Tout ce qui est dans Académie", "Sessions de coaching mensuelles", "Support prioritaire", "Contenus exclusifs"],
		},
	];
}

export function getPricingCopy(locale = "fr") {
	return getPricingContent(locale);
}

// Retrouve le tier à partir d'un Price ID (utile pour le webhook)
export function tierFromPriceId(priceId) {
	for (const plan of Object.values(PLANS)) {
		if (plan.priceId === priceId) return plan.tier;
	}
	return null;
}
