import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuizEditor } from "@/components/admin/quiz-editor";

export default async function QuizPage({ params }) {
	const { id: courseId, moduleId } = await params;

	const mod = await prisma.module.findUnique({
		where: { id: moduleId },
		include: {
			quiz: {
				include: {
					questions: { orderBy: { order: "asc" }, include: { options: true } },
				},
			},
		},
	});

	if (!mod || mod.courseId !== courseId || !mod.quiz) notFound();

	return (
		<div className="space-y-6">
			<div>
				<Link
					href={`/admin/courses/${courseId}/modules/${moduleId}`}
					className="text-sm text-muted-foreground hover:underline"
				>
					← {mod.title}
				</Link>
				<h1 className="mt-2 text-3xl font-bold">Quiz du module</h1>
			</div>
			<QuizEditor
				courseId={courseId}
				moduleId={moduleId}
				quiz={mod.quiz}
			/>
		</div>
	);
}
