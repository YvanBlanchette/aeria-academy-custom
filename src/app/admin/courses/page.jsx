import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CourseRowActions } from "@/components/admin/course-row-actions";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { auth } from "@/auth";

export default async function CoursesListPage() {
	const session = await auth();
	const courses = await prisma.course.findMany({
		orderBy: { createdAt: "desc" },
		include: {
			_count: { select: { modules: true, enrollments: true } },
		},
	});

	const metadata = {
		title: "Cours",
		subtitle: "Gérez les cours de l'Académie",
	};

	return (
		<DashboardLayoutRight
			title={metadata?.title}
			subtitle={metadata?.subtitle}
			user={session?.user}
		>
			<div className="bg-neutral-50 h-[calc(100vh-90px)]">
				<h2 className="text-3xl font-bold text-center">Liste des cours</h2>
				<div className="flex items-center justify-end mb-4">
					<Link
						href="/admin/courses/new"
						className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground`}
					>
						+ Créer un cours
					</Link>
				</div>

				{courses.length === 0 ? (
					<div className="rounded-lg border border-dashed p-12 text-center">
						<p className="text-muted-foreground">Aucun cours pour le moment</p>
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
									<TableHead className="text-white border-r border-white text-center">Titre</TableHead>
									<TableHead className="text-white border border-white text-center">Statut</TableHead>
									<TableHead className="text-white border border-white text-center">Prix</TableHead>
									<TableHead className="text-white border border-white text-center">Modules</TableHead>
									<TableHead className="text-white border border-white text-center">Inscrits</TableHead>
									<TableHead className="text-center text-white">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{courses.map((course) => (
									<TableRow key={course.id}>
										<TableCell className="text-center border">
											<Link
												href={`/admin/courses/${course.id}`}
												className="font-medium hover:underline"
											>
												{course.title}
											</Link>
										</TableCell>
										<TableCell className="text-center border">
											<Badge variant={course.published ? "default" : "secondary"}>{course.published ? "Publié" : "Brouillon"}</Badge>
										</TableCell>
										<TableCell className="text-center border">{(course.price / 100).toFixed(2)} $</TableCell>
										<TableCell className="text-center border">{course._count.modules}</TableCell>
										<TableCell className="text-center border">{course._count.enrollments}</TableCell>
										<TableCell className="text-center border">
											<CourseRowActions course={course} />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</div>
		</DashboardLayoutRight>
	);
}
