import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
	title: "Communauté indisponible | ÆRIA Voyages Academy",
	description: "La communauté est temporairement désactivée.",
};

export default function CommunityDisabledPage() {
	return (
		<div className="p-6 lg:p-8 max-w-3xl mx-auto">
			<Card>
				<CardHeader className="space-y-2">
					<div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
						<Wrench className="h-5 w-5" />
					</div>
					<CardTitle>Communauté désactivée temporairement</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						La communauté est actuellement désactivée par l&apos;administration, probablement pour maintenance ou mise à jour.
					</p>
					<p className="text-sm text-muted-foreground">Tu peux continuer d&apos;utiliser les autres sections de la plateforme en attendant sa réactivation.</p>
					<div>
						<Button
							asChild
							variant="outline"
						>
							<Link href="/dashboard">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Retour au tableau de bord
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
