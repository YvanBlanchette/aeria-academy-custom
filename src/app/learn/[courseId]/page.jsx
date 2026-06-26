import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function LearnRootPage({ params }) {
	const { courseId } = await params;

	const firstLesson = await prisma.lesson.findFirst({
		where: { module: { courseId } },
		orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
	});

	if (!firstLesson) notFound();

	redirect(`/learn/${courseId}/${firstLesson.id}`);
}
