import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";
import { SessionRefresher } from "@/components/users/session-refresher";

export const metadata = {
	title: "Bienvenue à ÆRIA  Voyages Academy !",
};

export default function SuccessPage() {
	return (
		<div className="container mx-auto px-4 pt-32 pb-16 flex items-center justify-center min-h-[60vh]">
			<Card className="max-w-md w-full">
				<CardContent className="p-8 text-center space-y-6">
					<CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
					<div className="space-y-2">
						<h1 className="text-2xl font-bold">Paiement réussi !</h1>
						<p className="text-muted-foreground">Bienvenue à l&apos;Académie de Voyages ÆRIA.</p>
					</div>
					<div className="bg-amber-50 text-amber-800 text-sm p-3 rounded-md">⚠️ Si ton accès n&apos;apparaît pas immédiatement, reconnecte-toi.</div>
					<Suspense fallback={null}>
						<SessionRefresher />
					</Suspense>

					<div className="flex flex-col gap-2">
						<Button
							asChild
							className="w-full"
						>
							<Link href="/dashboard">Accéder à mes cours</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							className="w-full"
						>
							<Link href="/courses">Explorer le catalogue</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
