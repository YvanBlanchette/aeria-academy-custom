"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function markLessonComplete(courseId, lessonId) {
	const session = await auth();
	if (!session) return { error: "Non authentifié" };

	// Vérifier que l'utilisateur est inscrit au cours
	const enrollment = await prisma.enrollment.findUnique({
		where: {
			userId_courseId: { userId: session.user.id, courseId },
		},
	});
	if (!enrollment) return { error: "Non inscrit à ce cours" };

	const existingProgress = await prisma.lessonProgress.findUnique({
		where: {
			userId_lessonId: { userId: session.user.id, lessonId },
		},
	});

	const shouldComplete = !existingProgress?.completed;

	await prisma.lessonProgress.upsert({
		where: {
			userId_lessonId: { userId: session.user.id, lessonId },
		},
		update: { completed: shouldComplete, completedAt: shouldComplete ? new Date() : null },
		create: {
			userId: session.user.id,
			lessonId,
			completed: shouldComplete,
			completedAt: shouldComplete ? new Date() : null,
		},
	});

	revalidatePath(`/learn/${courseId}`);
	return { success: true, completed: shouldComplete };
}
