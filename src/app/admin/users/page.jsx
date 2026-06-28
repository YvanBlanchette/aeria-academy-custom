import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CourseRowActions } from "@/components/admin/course-row-actions";
import { renameUserRole } from "@/lib/helpers";

export default async function UsersPage() {
	const users = await prisma.user.findMany({
		orderBy: { createdAt: "desc" },
		include: {
			_count: {
				select: {
					enrollments: true,
					progress: true,
					quizAttempts: true,
					certificates: true,
				},
			},
		},
	});

	const metadata = {
		title: "Membres",
		subtitle: "Gérez les membres de l'Académie de Voyages ÆRIA",
		btnLabel: "Créer un nouvel Étudiant",
		btnLink: "/admin/users/new",
	};

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-neutral-100">
			<div className="h-[calc(100vh-90px)] overflow-auto">
				<h2 className="text-3xl font-bold text-center">Liste des membres</h2>
				<div className="flex items-center justify-end mb-4">
					<Link
						href="/admin/users/new"
						className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground`}
					>
						+ Ajouter un membres
					</Link>
				</div>

				{users.length === 0 ? (
					<div className="rounded-lg border border-dashed p-12 text-center">
						<p className="text-muted-foreground">Aucun membre pour le moment</p>
						<Button
							asChild
							className="mt-4"
						>
							<Link href="/admin/courses/new">Créer le premier cours</Link>
						</Button>
					</div>
				) : (
					<div className="bg-white border rounded-lg overflow-hidden">
						<Table>
							<TableHeader className="bg-[#171717]  hover:bg-[#171717] text-white hover:pointer-events-none">
								<TableRow>
									<TableHead className="text-white border border-white text-center"></TableHead>
									<TableHead className="text-white border-r border-white text-center">Nom</TableHead>
									<TableHead className="text-white border border-white text-center">Rôle</TableHead>
									<TableHead className="text-white border border-white text-center">Courriel</TableHead>
									<TableHead className="text-white border border-white text-center">Inscrit</TableHead>
									<TableHead className="text-center text-white">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map((user, index) => (
									<TableRow key={user.id}>
										<TableCell className="text-center border">{index + 1}</TableCell>
										<TableCell className="text-center border">
											<Link
												href={`/admin/users/${user.id}`}
												className="font-medium hover:underline"
											>
												{user.name}
											</Link>
										</TableCell>
										<TableCell className="text-center border">
											<Badge variant={user.role ? "STUDENT" : "secondary"}>{renameUserRole(user.role)}</Badge>
										</TableCell>
										<TableCell className="text-center border">{user.email}</TableCell>
										<TableCell className="text-center border">
											{user.createdAt.getDate()} / 0{user.createdAt.getUTCMonth() + 1} / {user.createdAt.getFullYear()}
										</TableCell>
										<TableCell className="text-center border">
											<CourseRowActions course={user} />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</div>
		</div>
	);
}
