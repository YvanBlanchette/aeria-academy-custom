import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";

export const metadata = { title: "Certificats | AERIA Voyages Academy" };

export default async function CertificatesPage() {
	const session = await auth();

	const certificates = await prisma.certificate.findMany({
		where: { userId: session.user.id },
		include: { course: true },
		orderBy: { issuedAt: "desc" },
	});

	return (
		<DashboardLayoutRight
			title="Mes certificats"
			subtitle="Les certifications que tu as obtenues"
		>
			{certificates.length === 0 ? (
				<Card>
					<CardContent className="p-12 text-center space-y-4">
						<Award className="h-12 w-12 text-muted-foreground mx-auto" />
						<p className="text-muted-foreground">
							Aucun certificat pour le moment. Termine un cours et passe son quiz de validation pour obtenir ton premier certificat.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2">
					{certificates.map((cert) => (
						<Card key={cert.id}>
							<CardContent className="p-6 flex items-start gap-4">
								<Award className="h-10 w-10 text-yellow-600 shrink-0" />
								<div>
									<h3 className="font-semibold">{cert.course.title}</h3>
									<p className="text-xs text-muted-foreground">
										Obtenu le{" "}
										{new Date(cert.issuedAt).toLocaleDateString("fr-FR", {
											day: "numeric",
											month: "long",
											year: "numeric",
										})}
									</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</DashboardLayoutRight>
	);
}
