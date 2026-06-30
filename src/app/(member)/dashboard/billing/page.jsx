import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getLocalizedPlans } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createCheckoutSession, createPortalSession } from "@/app/(marketing)/pricing/actions";
import { ArrowUpRight, CalendarClock, CreditCard, ReceiptText, ShieldCheck } from "lucide-react";

export const metadata = { title: "Abonnement | ÆRIA Voyages Academy" };

const tierInfo = {
	FREE: { label: "Découverte", description: "Accès aux contenus gratuits", badgeVariant: "outline" },
	ACADEMY: { label: "Académie", description: "Accès illimité à toute l'académie", badgeVariant: "default" },
	PRIME: { label: "Prime", description: "Académie + accompagnement personnalisé", badgeVariant: "secondary" },
};

const stripeStatusLabel = {
	active: "Actif",
	trialing: "Période d'essai",
	past_due: "Paiement en retard",
	unpaid: "Impayé",
	canceled: "Résilié",
	incomplete: "Incomplet",
	incomplete_expired: "Expiré",
};

function formatDateFR(dateValue) {
	if (!dateValue) return "-";
	return new Intl.DateTimeFormat("fr-FR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	}).format(new Date(dateValue));
}

function formatMoneyFromCents(cents, currency = "cad") {
	if (typeof cents !== "number") return "-";
	return new Intl.NumberFormat("fr-CA", {
		style: "currency",
		currency: currency.toUpperCase(),
		maximumFractionDigits: 2,
	}).format(cents / 100);
}

export default async function BillingPage() {
	const session = await auth();
	if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard/billing");

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: {
			id: true,
			email: true,
			membership: true,
			membershipEndsAt: true,
			stripeCustomerId: true,
			stripeSubscriptionId: true,
		},
	});
	if (!user) redirect("/login?callbackUrl=/dashboard/billing");

	const plans = getLocalizedPlans("fr");

	const tier = tierInfo[user.membership];
	const paidPlans = plans.filter((plan) => plan.tier !== "FREE");

	let stripeSubscription = null;
	let recentInvoices = [];
	let upcomingInvoice = null;

	if (user.stripeSubscriptionId) {
		try {
			stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
		} catch {
			stripeSubscription = null;
		}
	}

	if (user.stripeCustomerId) {
		try {
			const invoiceList = await stripe.invoices.list({ customer: user.stripeCustomerId, limit: 5 });
			recentInvoices = invoiceList.data;
		} catch {
			recentInvoices = [];
		}

		try {
			upcomingInvoice = await stripe.invoices.retrieveUpcoming({ customer: user.stripeCustomerId });
		} catch {
			upcomingInvoice = null;
		}
	}

	const subscriptionStatus = stripeSubscription?.status ? stripeStatusLabel[stripeSubscription.status] || stripeSubscription.status : "Aucun abonnement Stripe";
	const cancelAtPeriodEnd = Boolean(stripeSubscription?.cancel_at_period_end);
	const periodEndDate = stripeSubscription?.current_period_end ? new Date(stripeSubscription.current_period_end * 1000) : null;

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Plan actuel</CardTitle>
							<CardDescription>{tier.description}</CardDescription>
						</div>
						<Badge
							variant={tier.badgeVariant}
							className="text-base px-3 py-1"
						>
							{tier.label}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
						<div className="rounded-lg border bg-card p-3">
							<p className="text-xs text-muted-foreground">Statut</p>
							<p className="mt-1 text-sm font-medium">{subscriptionStatus}</p>
						</div>
						<div className="rounded-lg border bg-card p-3">
							<p className="text-xs text-muted-foreground">Renouvellement</p>
							<p className="mt-1 text-sm font-medium">
								{periodEndDate ? formatDateFR(periodEndDate) : user.membershipEndsAt ? formatDateFR(user.membershipEndsAt) : "-"}
							</p>
						</div>
						<div className="rounded-lg border bg-card p-3">
							<p className="text-xs text-muted-foreground">Prochaine facture</p>
							<p className="mt-1 text-sm font-medium">
								{upcomingInvoice?.amount_due != null ? formatMoneyFromCents(upcomingInvoice.amount_due, upcomingInvoice.currency) : "-"}
							</p>
						</div>
						<div className="rounded-lg border bg-card p-3">
							<p className="text-xs text-muted-foreground">Résiliation</p>
							<p className="mt-1 text-sm font-medium">{cancelAtPeriodEnd ? "À la fin de période" : "Aucune"}</p>
						</div>
					</div>

					<div className="flex gap-3 flex-wrap pt-2">
						{user.membership === "FREE" ? (
							<form action={createCheckoutSession.bind(null, "ACADEMY")}>
								<Button type="submit">S&apos;abonner maintenant</Button>
							</form>
						) : (
							<form
								action={async () => {
									"use server";
									await createPortalSession();
								}}
							>
								<Button type="submit">Gérer mon abonnement</Button>
							</form>
						)}
					</div>
					<p className="flex items-center gap-2 text-xs text-muted-foreground">
						<ShieldCheck className="h-3.5 w-3.5" />
						Paiements sécurisés par Stripe. Annulation possible à tout moment.
					</p>
				</CardContent>
			</Card>

			<div className="grid gap-6 xl:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CreditCard className="h-5 w-5" />
							Changer de plan
						</CardTitle>
						<CardDescription>Tu peux passer d&apos;un plan à un autre à tout moment.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{paidPlans.map((plan) => {
							const isCurrent = user.membership === plan.tier;
							return (
								<div
									key={plan.id}
									className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"
								>
									<div>
										<p className="font-medium">{plan.title}</p>
										<p className="text-sm text-muted-foreground">
											{plan.price}$ {plan.period}
										</p>
									</div>
									{isCurrent ? (
										<Badge>Plan actif</Badge>
									) : (
										<form action={createCheckoutSession.bind(null, plan.tier)}>
											<Button
												type="submit"
												variant="outline"
												size="sm"
											>
												Choisir
											</Button>
										</form>
									)}
								</div>
							);
						})}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ReceiptText className="h-5 w-5" />
							Factures récentes
						</CardTitle>
						<CardDescription>Télécharge tes reçus Stripe et consulte l&apos;historique.</CardDescription>
					</CardHeader>
					<CardContent>
						{recentInvoices.length === 0 ? (
							<p className="text-sm text-muted-foreground">Aucune facture pour le moment.</p>
						) : (
							<ul className="space-y-2">
								{recentInvoices.map((invoice) => (
									<li
										key={invoice.id}
										className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"
									>
										<div>
											<p className="text-sm font-medium">{formatMoneyFromCents(invoice.amount_paid, invoice.currency)}</p>
											<p className="text-xs text-muted-foreground">
												{formatDateFR((invoice.status_transitions?.paid_at || invoice.created) * 1000)} • {invoice.status || "-"}
											</p>
										</div>
										{invoice.hosted_invoice_url ? (
											<Button
												asChild
												variant="ghost"
												size="sm"
											>
												<a
													href={invoice.hosted_invoice_url}
													target="_blank"
													rel="noreferrer"
												>
													Ouvrir <ArrowUpRight className="ml-1 h-4 w-4" />
												</a>
											</Button>
										) : null}
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarClock className="h-5 w-5" />
						Cycle de facturation
					</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					{periodEndDate ? (
						<p>
							{cancelAtPeriodEnd
								? `Ton abonnement prendra fin le ${formatDateFR(periodEndDate)}.`
								: `Ton prochain renouvellement est prévu le ${formatDateFR(periodEndDate)}.`}
						</p>
					) : user.membership === "FREE" ? (
						<p>Tu es actuellement sur le plan gratuit. Passe à un plan payant pour débloquer tout le contenu.</p>
					) : (
						<p>Les informations de cycle seront disponibles dès la prochaine synchronisation Stripe.</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
