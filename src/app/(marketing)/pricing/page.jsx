import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cookies } from "next/headers";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLocalizedPlans, getPricingCopy } from "@/lib/plans";
import { getLocaleFromCookie } from "@/lib/locale";

import { createCheckoutSession, createPortalSession } from "./actions";

export const metadata = {
	title: "Abonnements | ÆRIA Voyages Academy",
};

async function manageSubscriptionAction() {
	"use server";
	await createPortalSession();
}

function PlanCard({ plan, currentTier, session, pricing }) {
	const isCurrent = currentTier === plan.tier;
	const isFreePlan = plan.tier === "FREE";
	const isAuthenticated = Boolean(session);

	// Keep the action logic close to the card so each plan is self-contained.
	const subscribeAction = async () => {
		"use server";
		await createCheckoutSession(plan.tier);
	};

	const actionLabel = currentTier && currentTier !== "FREE" ? pricing.planCard.changePlan : pricing.planCard.subscribe;

	return (
		<Card className={plan.featured ? "relative h-fit border-primary px-4 py-6 shadow-lg" : "h-fit px-4 py-6"}>
			<CardHeader className="flex flex-col items-center space-y-2">
				<CardTitle className="text-2xl">{plan.title}</CardTitle>
				<p className="text-sm text-muted-foreground">{plan.description}</p>
				{plan.featured && <Badge>{pricing.planCard.recommended}</Badge>}
				<div className="mt-4">
					<span className="text-4xl font-bold">{plan.price}$</span>
					<span className="ml-1 text-muted-foreground">{plan.period}</span>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				<ul className="space-y-2">
					{plan.features.map((feature) => (
						<li
							key={feature}
							className="flex items-start gap-2 text-sm"
						>
							<Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
							<span>{feature}</span>
						</li>
					))}
				</ul>

				{isCurrent ? (
					<Button
						disabled
						className="w-full"
					>
						{pricing.planCard.current}
					</Button>
				) : isFreePlan ? (
					isAuthenticated ? (
						<Button
							disabled
							className="w-full"
							variant="outline"
						>
							{pricing.planCard.included}
						</Button>
					) : (
						<Button
							asChild
							className="w-full"
							variant="outline"
						>
							<Link href="/register">{pricing.planCard.createAccount}</Link>
						</Button>
					)
				) : !isAuthenticated ? (
					<Button
						asChild
						className="w-full"
					>
						<Link href="/login?callbackUrl=/pricing">{pricing.planCard.loginRequired}</Link>
					</Button>
				) : (
					<form action={subscribeAction}>
						<Button
							type="submit"
							className="w-full"
							variant={plan.featured ? "default" : "outline"}
						>
							{actionLabel}
						</Button>
					</form>
				)}
			</CardContent>
		</Card>
	);
}

export default async function PricingPage({ searchParams }) {
	// Resolve the page params and auth state once so the rest of the component stays readable.
	const params = await searchParams;
	const session = await auth();
	const currentTier = session?.user?.membership;
	const canceled = params?.canceled === "1";
	const hasActiveSubscription = Boolean(session && currentTier && currentTier !== "FREE");
	const cookieStore = await cookies();
	const locale = getLocaleFromCookie(cookieStore);
	const pricing = getPricingCopy(locale);
	const plans = getLocalizedPlans(locale);

	return (
		<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
			{/* Hero section for the pricing page. */}
			<header className="mb-12 space-y-4 text-center">
				<h1 className="text-4xl font-bold md:text-5xl">{pricing.pageTitle}</h1>
				<p className="mx-auto max-w-2xl text-lg text-muted-foreground">{pricing.pageSubtitle}</p>
				{canceled && <p className="inline-block rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-700">{pricing.canceledNotice}</p>}
			</header>

			{/* Render each plan in a responsive grid. */}
			<div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3 md:items-center">
				{plans.map((plan) => (
					<PlanCard
						key={plan.id}
						plan={plan}
						currentTier={currentTier}
						session={session}
						pricing={pricing}
					/>
				))}
			</div>

			{/* Show billing management only for paying members. */}
			{hasActiveSubscription && (
				<div className="mt-12 text-center">
					<form action={manageSubscriptionAction}>
						<Button
							type="submit"
							variant="link"
						>
							{pricing.planCard.manageSubscription}
						</Button>
					</form>
				</div>
			)}

			{/* Trust and payment reassurance. */}
			<a
				href="https://stripe.com/fr"
				target="_blank"
				rel="noopener noreferrer"
				className="mt-12 flex flex-col items-center text-center text-sm text-muted-foreground"
			>
				<Image
					src="/images/stripe-logo.svg"
					alt="Stripe"
					width={120}
					height={30}
					className="mb-2 object-contain"
				/>
				<p className="text-center text-xs text-muted-foreground">{pricing.planCard.securePayment}</p>
				<p className="text-center text-xs text-muted-foreground">{pricing.planCard.cancelAnytime}</p>
			</a>
		</div>
	);
}
