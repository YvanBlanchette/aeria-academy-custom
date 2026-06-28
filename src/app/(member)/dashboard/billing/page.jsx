import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPortalSession } from "@/app/(marketing)/pricing/actions";

export const metadata = { title: "Abonnement | AERIA Voyages Academy" };

const tierInfo = {
	FREE: { label: "Gratuit", description: "Accès aux cours gratuits uniquement" },
	ACADEMY: { label: "Académie", description: "Accès à tous les cours de l'académie" },
	PRIME: { label: "Prime", description: "Accès complet + accompagnement personnalisé" },
};

export default async function BillingPage() {
	const session = await auth();
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
	});

	const tier = tierInfo[user.membership];

	return (
		<DashboardLayoutRight
			title="Mon abonnement"
			subtitle="Gère ton plan et tes paiements"
		>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Plan actuel</CardTitle>
							<CardDescription>{tier.description}</CardDescription>
						</div>
						<Badge
							variant="default"
							className="text-base px-3 py-1"
						>
							{tier.label}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{user.membershipEndsAt && (
						<p className="text-sm text-muted-foreground">
							{user.membership === "FREE" ? "Expiré" : "Prochain renouvellement"} le{" "}
							{new Date(user.membershipEndsAt).toLocaleDateString("fr-FR", {
								day: "numeric",
								month: "long",
								year: "numeric",
							})}
						</p>
					)}

					<div className="flex gap-3 flex-wrap">
						{user.membership === "FREE" ? (
							<Button asChild>
								<Link href="/pricing">S&apos;abonner</Link>
							</Button>
						) : (
							<form
								action={async () => {
									"use server";
									await createPortalSession();
								}}
							>
								<Button type="submit">Gérer mon abonnement →</Button>
							</form>
						)}
					</div>
				</CardContent>
			</Card>
		</DashboardLayoutRight>
	);
}
