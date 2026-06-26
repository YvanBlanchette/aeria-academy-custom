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

// Retrouve le tier à partir d'un Price ID (utile pour le webhook)
export function tierFromPriceId(priceId) {
	for (const plan of Object.values(PLANS)) {
		if (plan.priceId === priceId) return plan.tier;
	}
	return null;
}
