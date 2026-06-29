import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = { title: "Paramètres | ÆRIA Voyages Academy" };

export default async function SettingsPage() {
	const session = await auth();

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-neutral-100">
			<div className="space-y-6 max-w-3xl">
				<Card>
					<CardHeader>
						<CardTitle>Compte</CardTitle>
						<CardDescription>Informations de connexion</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						<p>
							<span className="text-muted-foreground">Email :</span> {session.user.email}
						</p>
						<p className="text-xs text-muted-foreground">Pour modifier ton email, contacte le support.</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Notifications</CardTitle>
						<CardDescription>Bientôt disponible</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">La gestion des notifications par email arrivera dans une prochaine version.</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
