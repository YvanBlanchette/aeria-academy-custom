import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Calendar, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserForm } from "@/components/admin/user-form";
import { UserDeleteButton } from "@/components/admin/user-delete-button";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { Button } from "@/components/ui/button";

export default async function UserDetailPage({ params }) {
	const { id } = await params;
	const session = await auth();

	const user = await prisma.user.findUnique({
		where: { id },
		include: {
			enrollments: {
				orderBy: { enrolledAt: "desc" },
				include: {
					course: {
						select: { id: true, title: true, slug: true },
					},
				},
			},
			_count: {
				select: {
					enrollments: true,
					quizAttempts: true,
					certificates: true,
				},
			},
		},
	});

	if (!user) notFound();

	const isSelf = user.id === session.user.id;
	const initials = (user.name || user.email)
		.split(" ")
		.map((s) => s.charAt(0))
		.join("")
		.toUpperCase()
		.slice(0, 2);

	const metadata = {
		title: user.name,
		subtitle: user.email,
		image: user.image,
		btnLabel: "← Retour aux utilisateurs",
		btnLink: "/admin/users",
	};

	return (
		<DashboardLayoutRight
			title={metadata.title}
			subtitle={metadata.subtitle}
			image={metadata.image}
			btnLink={metadata.btnLink}
		>
			<div className="flex items-center justify-end mb-2">
				<Link
					asChild
					className="mt-auto mb-1"
					href={metadata.btnLink}
				>
					<Button className="rounded-sm">Retour aux Membres</Button>
				</Link>
			</div>
			<div className="space-y-8">
				{/* Stats rapides */}
				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Inscriptions</p>
									<p className="text-2xl font-bold">{user._count.enrollments}</p>
								</div>
								<BookOpen className="h-8 w-8 text-muted-foreground" />
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div>
								<p className="text-sm text-muted-foreground">Quiz passés</p>
								<p className="text-2xl font-bold">{user._count.quizAttempts}</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div>
								<p className="text-sm text-muted-foreground">Certificats</p>
								<p className="text-2xl font-bold">{user._count.certificates}</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="grid gap-6 lg:grid-cols-3 h-full">
					<div className="lg:col-span-2 h-full">
						<UserForm
							user={user}
							currentUserId={session.user.id}
						/>
					</div>

					<div className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Compte</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 text-sm">
								<div className="flex items-start gap-2">
									<Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
									<div>
										<p className="font-medium">{user.email}</p>
										<p className="text-xs text-muted-foreground">{user.emailVerified ? "Vérifié" : "Non vérifié"}</p>
									</div>
								</div>
								<div className="flex items-start gap-2">
									<Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
									<div>
										<p className="font-medium">
											{new Date(user.createdAt).toLocaleDateString("fr-FR", {
												day: "numeric",
												month: "long",
												year: "numeric",
											})}
										</p>
										<p className="text-xs text-muted-foreground">Date d&apos;inscription</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-base">Cours suivis ({user.enrollments.length})</CardTitle>
							</CardHeader>
							<CardContent>
								{user.enrollments.length === 0 ? (
									<p className="text-sm text-muted-foreground">Aucune inscription</p>
								) : (
									<ul className="space-y-2 text-sm">
										{user.enrollments.map((enr) => (
											<li key={enr.id}>
												<Link
													href={`/admin/courses/${enr.course.id}`}
													className="hover:underline"
												>
													{enr.course.title}
												</Link>
												<p className="text-xs text-muted-foreground">Inscrit le {new Date(enr.enrolledAt).toLocaleDateString("fr-FR")}</p>
											</li>
										))}
									</ul>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-base text-destructive">Zone dangereuse</CardTitle>
							</CardHeader>
							<CardContent>
								<UserDeleteButton
									user={user}
									disabled={isSelf}
									disabledReason="Impossible de te supprimer toi-même"
								/>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</DashboardLayoutRight>
	);
}
