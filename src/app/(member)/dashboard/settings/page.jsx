import { auth } from "@/auth";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = { title: "Paramètres | AERIA Voyages Academy" };

export default async function SettingsPage() {
	const session = await auth();

	return (
		<DashboardLayoutRight
			title="Paramètres"
			subtitle="Préférences de compte et notifications"
		>
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
		</DashboardLayoutRight>
	);
}
