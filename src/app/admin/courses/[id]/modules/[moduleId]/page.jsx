import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LessonRow } from "@/components/admin/lesson-row";
import { QuizSection } from "@/components/admin/quiz-section";

export default async function ModulePage({ params }) {
	const { id: courseId, moduleId } = await params;

	const mod = await prisma.module.findUnique({
		where: { id: moduleId },
		include: {
			course: { select: { id: true, title: true } },
			lessons: { orderBy: { order: "asc" } },
			quiz: {
				include: {
					questions: { orderBy: { order: "asc" }, include: { options: true } },
				},
			},
		},
	});

	if (!mod || mod.courseId !== courseId) notFound();

	return (
		<div className="space-y-8">
			<div>
				<Link
					href={`/admin/courses/${courseId}`}
					className="text-sm text-muted-foreground hover:underline"
				>
					← {mod.course.title}
				</Link>
				<h1 className="mt-2 text-3xl font-bold">{mod.title}</h1>
				<p className="text-muted-foreground">Module #{mod.order}</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Leçons</CardTitle>
							<CardDescription>Vidéos, capsules audio, textes et PDF</CardDescription>
						</div>
						<Button asChild>
							<Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/new`}>+ Ajouter une leçon</Link>
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{mod.lessons.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted-foreground">Aucune leçon dans ce module</p>
					) : (
						<ul className="space-y-2">
							{mod.lessons.map((lesson, idx) => (
								<LessonRow
									key={lesson.id}
									lesson={lesson}
									courseId={courseId}
									moduleId={moduleId}
									isFirst={idx === 0}
									isLast={idx === mod.lessons.length - 1}
								/>
							))}
						</ul>
					)}
				</CardContent>
			</Card>

			<QuizSection
				courseId={courseId}
				moduleId={moduleId}
				quiz={mod.quiz}
			/>
		</div>
	);
}
