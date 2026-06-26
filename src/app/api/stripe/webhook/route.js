import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { tierFromPriceId } from "@/lib/plans";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
	const body = await req.text();
	const headersList = await headers();
	const sig = headersList.get("stripe-signature");

	let event;
	try {
		event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
	} catch (err) {
		console.error("⚠️ Webhook signature verification failed:", err.message);
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
	}

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				// Quand un paiement est confirmé après checkout
				const checkoutSession = event.data.object;
				const userId = checkoutSession.metadata?.userId;
				const subscriptionId = checkoutSession.subscription;

				if (!userId || !subscriptionId) break;

				const subscription = await stripe.subscriptions.retrieve(subscriptionId);
				const priceId = subscription.items.data[0].price.id;
				const tier = tierFromPriceId(priceId);
				if (!tier) {
					console.error("Tier introuvable pour priceId:", priceId);
					break;
				}

				await prisma.user.update({
					where: { id: userId },
					data: {
						membership: tier,
						stripeSubscriptionId: subscriptionId,
						stripeCustomerId: checkoutSession.customer,
						membershipEndsAt: new Date(subscription.current_period_end * 1000),
					},
				});

				console.log(`✅ User ${userId} now ${tier}`);
				break;
			}

			case "customer.subscription.updated": {
				// Changement de plan / renouvellement
				const subscription = event.data.object;
				const userId = subscription.metadata?.userId;
				const priceId = subscription.items.data[0].price.id;
				const tier = tierFromPriceId(priceId);

				if (!userId || !tier) break;

				await prisma.user.update({
					where: { id: userId },
					data: {
						membership: tier,
						stripeSubscriptionId: subscription.id,
						membershipEndsAt: new Date(subscription.current_period_end * 1000),
					},
				});

				console.log(`🔄 User ${userId} subscription updated to ${tier}`);
				break;
			}

			case "customer.subscription.deleted": {
				// Annulation effective (fin de période)
				const subscription = event.data.object;
				const userId = subscription.metadata?.userId;
				if (!userId) break;

				await prisma.user.update({
					where: { id: userId },
					data: {
						membership: "FREE",
						stripeSubscriptionId: null,
						membershipEndsAt: null,
					},
				});

				console.log(`❌ User ${userId} subscription canceled`);
				break;
			}

			case "invoice.payment_failed": {
				// Le paiement de renouvellement a échoué — on peut envoyer un email plus tard
				const invoice = event.data.object;
				console.warn(`💳 Payment failed for customer ${invoice.customer}`);
				break;
			}

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("Webhook handler error:", error);
		return NextResponse.json({ error: "Webhook error" }, { status: 500 });
	}
}
