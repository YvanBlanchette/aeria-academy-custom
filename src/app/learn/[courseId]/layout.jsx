import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canAccessCourse } from "@/lib/access";
import { Button } from "@/components/ui/button";
import { LessonSidebar } from "@/components/users/lesson-sidebar";

export default async function LearnLayout({ children, params }) {
	const { courseId } = await params;
	const session = await auth();
	if (!session) redirect(`/login?callbackUrl=/learn/${courseId}`);

	const course = await prisma.course.findUnique({
		where: { id: courseId },
		include: {
			modules: {
				orderBy: { order: "asc" },
				include: {
					lessons: { orderBy: { order: "asc" } },
					quiz: { select: { id: true } },
				},
			},
		},
	});
	if (!course) notFound();

	// Check d'accès
	const access = await canAccessCourse(session.user, course);
	if (!access.allowed) {
		redirect(`/courses/${course.slug}`);
	}

	// Crée l'enrollment automatiquement si membre/admin sans enrollment
	// (ils ont accès, mais pas encore d'historique de progression)
	await prisma.enrollment.upsert({
		where: {
			userId_courseId: { userId: session.user.id, courseId },
		},
		update: {},
		create: { userId: session.user.id, courseId },
	});

	const progress = await prisma.lessonProgress.findMany({
		where: {
			userId: session.user.id,
			lesson: { module: { courseId } },
			completed: true,
		},
		select: { lessonId: true },
	});
	const completedSet = new Set(progress.map((p) => p.lessonId));

	return (
		<div className="flex h-screen overflow-hidden">
			<aside className="w-80 border-r bg-card overflow-y-auto flex flex-col">
				<div className="border-b p-4">
					<Button
						asChild
						variant="ghost"
						size="sm"
						className="-ml-2"
					>
						<Link href="/dashboard">
							<ArrowLeft className="mr-1 h-4 w-4" /> Mes cours
						</Link>
					</Button>
					<h2 className="mt-2 font-bold line-clamp-2">{course.title}</h2>
				</div>
				<LessonSidebar
					course={course}
					completedSet={Array.from(completedSet)}
				/>
			</aside>
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
