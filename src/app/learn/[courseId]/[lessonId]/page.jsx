import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { LessonPlayer } from "@/components/users/lesson-player";
import { MarkCompleteButton } from "@/components/users/mark-complete-button";
import { Card } from "@/components/ui/card";

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

	const course = await prisma.course.findUnique({
		where: { id: courseId },
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

	// JSX code for the lesson page
	return (
		<div className="container mx-auto w-[92%] max-w-7xl space-y-5 py-4 sm:w-[90%] sm:space-y-6 sm:py-6 lg:w-full">
			<Card className="w-full rounded bg-white px-4 py-5 shadow-md sm:px-6 sm:py-7 lg:px-12 lg:py-10">
				<div>
					<h1 className="mt-1 text-xl font-bold leading-tight sm:text-2xl lg:text-3xl">{lesson.title}</h1>
					{isCompleted && (
						<div className="mt-2 flex items-center gap-2 text-sm text-green-600">
							<CheckCircle2 className="h-4 w-4" />
							Leçon terminée
						</div>
					)}
				</div>

				<LessonPlayer
					lesson={lesson}
					prevHref={prev ? `/learn/${courseId}/${prev.id}` : null}
					nextHref={next ? `/learn/${courseId}/${next.id}` : null}
				/>
			</Card>

			<div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 sm:gap-3 sm:pt-6">
				<Button
					asChild
					variant="outline"
					disabled={!prev}
					className="h-9 w-9 rounded-full border border-border bg-white p-0 shadow-lg transition-transform hover:-translate-x-1 hover:bg-white sm:h-8 sm:w-auto sm:gap-2 sm:px-2.5"
				>
					{prev ? (
						<Link href={`/learn/${courseId}/${prev.id}`}>
							<ChevronLeft className="mr-1 h-4 w-4" />
							<span className="max-sm:hidden">Précédent</span>
						</Link>
					) : (
						<span>
							<ChevronLeft className="mr-1 h-4 w-4" />
							<span className="max-sm:hidden">Précédent</span>
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
					className="h-9 w-9 rounded-full border border-border bg-white p-0 shadow-lg transition-transform hover:translate-x-1 hover:bg-white sm:h-8 sm:w-auto sm:gap-2 sm:px-2.5"
				>
					{next ? (
						<Link href={`/learn/${courseId}/${next.id}`}>
							<span className="max-sm:hidden">Suivant</span>
							<ChevronRight className="ml-1 h-4 w-4" />
						</Link>
					) : (
						<span>
							<span className="max-sm:hidden">Suivant</span>
							<ChevronRight className="ml-1 h-4 w-4" />
						</span>
					)}
				</Button>
			</div>
		</div>
	);
}
