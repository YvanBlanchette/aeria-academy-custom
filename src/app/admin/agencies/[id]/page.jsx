import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, Mail, Phone, Globe, MapPin, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AgencyForm } from "@/components/admin/agency-form";
import { ApproveButton, RejectButton, RemoveMemberButton } from "@/components/admin/agency-actions-buttons";

export default async function AdminAgencyDetailPage({ params }) {
	const { id } = await params;

	const agency = await prisma.agency.findUnique({
		where: { id },
		include: {
			members: {
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
							role: true,
						},
					},
				},
				orderBy: { createdAt: "asc" },
			},
		},
	});

	if (!agency) notFound();

	// Cherche l'admin de l'agence
	let agencyAdmin = null;
	if (agency.adminUserId) {
		agencyAdmin = await prisma.user.findUnique({
			where: { id: agency.adminUserId },
			select: { id: true, name: true, email: true, image: true },
		});
	}

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-neutral-100">
			<div className="mb-4">
				<Link
					href="/admin/agencies"
					className="text-sm text-muted-foreground hover:underline"
				>
					← Retour aux agences
				</Link>
			</div>

			{/* Bandeau d'actions selon statut */}
			<Card className="mb-6">
				<CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
					<div className="flex items-center gap-3">
						<Badge variant={agency.approved ? "default" : "secondary"}>{agency.approved ? "Approuvée" : "En attente"}</Badge>
						<p className="text-sm text-muted-foreground">
							Créée le{" "}
							{new Date(agency.createdAt).toLocaleDateString("fr-FR", {
								day: "numeric",
								month: "long",
								year: "numeric",
							})}
						</p>
					</div>
					<div className="flex gap-2">
						{!agency.approved && <ApproveButton agencyId={agency.id} />}
						<RejectButton
							agencyId={agency.id}
							agencyName={agency.name}
						/>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Formulaire d'édition */}
				<div className="lg:col-span-2">
					<AgencyForm agency={agency} />
				</div>

				{/* Sidebar : admin + membres */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Admin de l&apos;agence</CardTitle>
						</CardHeader>
						<CardContent>
							{agencyAdmin ? (
								<Link
									href={`/admin/users/${agencyAdmin.id}`}
									className="flex items-center gap-3 hover:underline"
								>
									<Avatar className="h-10 w-10">
										<AvatarImage
											src={agencyAdmin.image}
											alt={agencyAdmin.name}
										/>
										<AvatarFallback>{(agencyAdmin.name || agencyAdmin.email).charAt(0).toUpperCase()}</AvatarFallback>
									</Avatar>
									<div className="min-w-0">
										<p className="text-sm font-medium truncate">{agencyAdmin.name || "—"}</p>
										<p className="text-xs text-muted-foreground truncate">{agencyAdmin.email}</p>
									</div>
								</Link>
							) : (
								<p className="text-sm text-muted-foreground">Aucun admin défini</p>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-base flex items-center gap-2">
								<Users className="h-4 w-4" />
								Membres ({agency.members.length})
							</CardTitle>
						</CardHeader>
						<CardContent>
							{agency.members.length === 0 ? (
								<p className="text-sm text-muted-foreground">Aucun membre dans cette agence</p>
							) : (
								<ul className="space-y-3">
									{agency.members.map((m) => (
										<li
											key={m.userId}
											className="flex items-center gap-3 group"
										>
											<Link
												href={`/admin/users/${m.userId}`}
												className="flex items-center gap-3 flex-1 min-w-0 hover:underline"
											>
												<Avatar className="h-8 w-8">
													<AvatarImage
														src={m.user.image}
														alt={m.user.name}
													/>
													<AvatarFallback className="text-xs">{(m.user.name || m.user.email).charAt(0).toUpperCase()}</AvatarFallback>
												</Avatar>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">{m.user.name || m.user.email}</p>
													{m.agencyRole && <p className="text-xs text-muted-foreground truncate">{m.agencyRole}</p>}
												</div>
											</Link>
											<div className="opacity-0 group-hover:opacity-100 transition-opacity">
												<RemoveMemberButton
													userId={m.userId}
													agencyId={agency.id}
													userName={m.user.name || m.user.email}
												/>
											</div>
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>

					{/* Aperçu coordonnées */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Coordonnées</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							{agency.address && (
								<p className="flex items-start gap-2 text-muted-foreground">
									<MapPin className="h-4 w-4 mt-0.5 shrink-0" />
									<span>
										{agency.address}
										{agency.city && `, ${agency.city}`}
										{agency.postalCode && `, ${agency.postalCode}`}
									</span>
								</p>
							)}
							{agency.phone && (
								<p className="flex items-center gap-2 text-muted-foreground">
									<Phone className="h-4 w-4" />
									{agency.phone}
								</p>
							)}
							{agency.email && (
								<p className="flex items-center gap-2 text-muted-foreground">
									<Mail className="h-4 w-4" />
									{agency.email}
								</p>
							)}
							{agency.websiteUrl && (
								<a
									href={agency.websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
								>
									<Globe className="h-4 w-4" />
									Site web ↗
								</a>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
