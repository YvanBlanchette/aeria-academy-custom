"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { PLANS } from "@/lib/plans";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function createCheckoutSession(tier) {
	const session = await auth();
	if (!session?.user) {
		redirect("/login?callbackUrl=/pricing");
	}

	const plan = PLANS[tier];
	if (!plan?.priceId) {
		throw new Error(`Plan inconnu ou non configuré : ${tier}`);
	}

	// Charge le user complet (pour avoir stripeCustomerId si déjà créé)
	const dbUser = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: {
			id: true,
			email: true,
			name: true,
			stripeCustomerId: true,
			membership: true,
		},
	});

	if (!dbUser) throw new Error("Utilisateur introuvable");

	// Si déjà membre, redirige vers le portail (pour upgrade/downgrade)
	if (dbUser.membership !== "FREE") {
		return await createPortalSession();
	}

	// Crée ou réutilise le Stripe Customer
	let customerId = dbUser.stripeCustomerId;
	if (!customerId) {
		const customer = await stripe.customers.create({
			email: dbUser.email,
			name: dbUser.name || undefined,
			metadata: { userId: dbUser.id },
		});
		customerId = customer.id;
		await prisma.user.update({
			where: { id: dbUser.id },
			data: { stripeCustomerId: customerId },
		});
	}

	// Crée la session Checkout
	const checkout = await stripe.checkout.sessions.create({
		customer: customerId,
		mode: "subscription",
		line_items: [{ price: plan.priceId, quantity: 1 }],
		success_url: `${APP_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${APP_URL}/pricing?canceled=1`,
		// Permet à l'utilisateur de revoir sa carte plus tard
		allow_promotion_codes: true,
		metadata: {
			userId: dbUser.id,
			tier: plan.tier,
		},
		subscription_data: {
			metadata: {
				userId: dbUser.id,
				tier: plan.tier,
			},
		},
	});

	if (!checkout.url) throw new Error("Stripe Checkout URL manquante");

	redirect(checkout.url);
}

export async function createPortalSession() {
	const session = await auth();
	if (!session?.user) redirect("/login");

	const dbUser = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { stripeCustomerId: true },
	});

	if (!dbUser?.stripeCustomerId) {
		throw new Error("Aucun abonnement à gérer");
	}

	const portal = await stripe.billingPortal.sessions.create({
		customer: dbUser.stripeCustomerId,
		return_url: `${APP_URL}/dashboard?refresh=1`,
	});

	if (!portal.url) {
		throw new Error("URL du portail Stripe manquante");
	}

	redirect(portal.url);
}
