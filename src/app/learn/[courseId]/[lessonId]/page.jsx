import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { LessonPlayer } from "@/components/users/lesson-player";
import { MarkCompleteButton } from "@/components/users/mark-complete-button";

export default async function LessonPage({ params }) {
	const { courseId, lessonId } = await params;
	const session = await auth();

	const lesson = await prisma.lesson.findUnique({
		where: { id: lessonId },
		include: {
			module: {
				select: {
					id: true,
					title: true,
					courseId: true,
					order: true,
				},
			},
		},
	});

	if (!lesson || lesson.module.courseId !== courseId) notFound();

	// Leçon précédente et suivante (sur tout le cours)
	const allLessons = await prisma.lesson.findMany({
		where: { module: { courseId } },
		orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
		select: { id: true },
	});
	const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
	const prev = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
	const next = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

	// Statut de complétion
	const progress = await prisma.lessonProgress.findUnique({
		where: {
			userId_lessonId: { userId: session.user.id, lessonId },
		},
	});
	const isCompleted = progress?.completed || false;

	return (
		<div className="container mx-auto max-w-4xl p-8 space-y-6">
			<div>
				<p className="text-sm text-muted-foreground">
					Module {lesson.module.order} : {lesson.module.title}
				</p>
				<h1 className="mt-1 text-3xl font-bold">{lesson.title}</h1>
				{isCompleted && (
					<div className="mt-2 flex items-center gap-2 text-sm text-green-600">
						<CheckCircle2 className="h-4 w-4" />
						Leçon terminée
					</div>
				)}
			</div>

			<LessonPlayer lesson={lesson} />

			<div className="flex items-center justify-between border-t pt-6">
				<Button
					asChild
					variant="outline"
					disabled={!prev}
				>
					{prev ? (
						<Link href={`/learn/${courseId}/${prev.id}`}>
							<ChevronLeft className="mr-1 h-4 w-4" /> Précédent
						</Link>
					) : (
						<span>
							<ChevronLeft className="mr-1 h-4 w-4" /> Précédent
						</span>
					)}
				</Button>

				<MarkCompleteButton
					courseId={courseId}
					lessonId={lessonId}
					isCompleted={isCompleted}
					nextLessonId={next?.id}
				/>

				<Button
					asChild
					variant="outline"
					disabled={!next}
				>
					{next ? (
						<Link href={`/learn/${courseId}/${next.id}`}>
							Suivant <ChevronRight className="ml-1 h-4 w-4" />
						</Link>
					) : (
						<span>
							Suivant <ChevronRight className="ml-1 h-4 w-4" />
						</span>
					)}
				</Button>
			</div>
		</div>
	);
}
