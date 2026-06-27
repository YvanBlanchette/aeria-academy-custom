import { Check } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { createCheckoutSession, createPortalSession } from "./actions";
import { PLANS } from "@/lib/data/memberships";
import Image from "next/image";

export const metadata = {
	title: "Abonnements | ÆRIA Voyages Academy",
};

export default async function PricingPage({ searchParams }) {
	const params = await searchParams;
	const session = await auth();
	const currentTier = session?.user?.membership;
	const canceled = params?.canceled === "1";

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="text-center space-y-4 mb-12">
				<h1 className="text-4xl md:text-5xl font-bold">Choisis ton plan</h1>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">Accède à tous les cours ÆRIA et progresse à ton rythme. Sans engagement.</p>
				{canceled && <p className="text-sm text-amber-700 bg-amber-50 inline-block px-4 py-2 rounded-md">Paiement annulé. Tu peux réessayer à tout moment.</p>}
			</div>

			<div className="grid gap-6 md:grid-cols-3 items-center max-w-6xl mx-auto">
				{PLANS.map((plan) => {
					const isCurrent = currentTier === plan.tier;
					const isFreePlan = plan.tier === "FREE";

					return (
						<Card
							key={plan.id}
							className={plan.featured ? "border-primary shadow-lg relative h-fit px-4 py-6" : "h-fit px-4 py-6"}
						>
							<CardHeader className="flex flex-col items-center space-y-2">
								<CardTitle className="text-2xl">Membre {plan.name}</CardTitle>
								<p className="text-sm text-muted-foreground">{plan.description}</p>
								{plan.featured && <Badge className="">Recommandé</Badge>}
								<div className="mt-4">
									<span className="text-4xl font-bold">{plan.price}$</span>
									<span className="text-muted-foreground ml-1">{plan.period}</span>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								<ul className="space-y-2">
									{plan.features.map((f) => (
										<li
											key={f}
											className="flex items-start gap-2 text-sm"
										>
											<Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
											<span>{f}</span>
										</li>
									))}
								</ul>

								{isCurrent ? (
									<Button
										disabled
										className="w-full"
									>
										Plan actuel
									</Button>
								) : isFreePlan ? (
									!session ? (
										<Button
											asChild
											className="w-full"
											variant="outline"
										>
											<Link href="/register">Créer un compte</Link>
										</Button>
									) : (
										<Button
											disabled
											className="w-full"
											variant="outline"
										>
											Inclus avec ton compte
										</Button>
									)
								) : !session ? (
									<Button
										asChild
										className="w-full"
									>
										<Link href={`/login?callbackUrl=/pricing`}>Connexion requise</Link>
									</Button>
								) : (
									<form
										action={async () => {
											"use server";
											await createCheckoutSession(plan.tier);
										}}
									>
										<Button
											type="submit"
											className="w-full"
											variant={plan.featured ? "default" : "outline"}
										>
											{currentTier && currentTier !== "FREE" ? "Changer de plan" : "S'abonner"}
										</Button>
									</form>
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>

			{session && currentTier && currentTier !== "FREE" && (
				<div className="text-center mt-12">
					<form
						action={async () => {
							"use server";
							await createPortalSession();
						}}
					>
						<Button
							type="submit"
							variant="link"
						>
							Gérer mon abonnement →
						</Button>
					</form>
				</div>
			)}
			<a
				href="https://stripe.com/fr"
				target="_blank"
				rel="noopener noreferrer"
				className="flex flex-col items-center text-center text-sm text-muted-foreground mt-12"
			>
				<Image
					src="/images/stripe-logo.svg"
					alt="Stripe"
					width={120}
					height={30}
					className="object-contain mb-2"
				/>
				<p className="text-center text-xs text-muted-foreground">Paiement sécurisé par Stripe</p>
				<p className="text-center text-xs text-muted-foreground">Annulation possible à tout moment</p>
			</a>
		</div>
	);
}
