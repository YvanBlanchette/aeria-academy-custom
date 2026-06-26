"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function requireAdmin() {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Non autorisé");
	}
}

const lessonSchema = z.object({
	title: z.string().min(3, "Titre trop court"),
	type: z.enum(["VIDEO", "AUDIO", "TEXT", "PDF"]),
	content: z.string().min(1, "Contenu requis"),
	duration: z.coerce.number().int().min(0).optional().nullable(),
});

export async function createLesson(courseId, moduleId, formData) {
	await requireAdmin();
	const parsed = lessonSchema.safeParse({
		title: formData.get("title"),
		type: formData.get("type"),
		content: formData.get("content"),
		duration: formData.get("duration") || 0,
	});
	if (!parsed.success) return { error: parsed.error.issues[0].message };

	const last = await prisma.lesson.findFirst({
		where: { moduleId },
		orderBy: { order: "desc" },
	});

	await prisma.lesson.create({
		data: {
			...parsed.data,
			duration: parsed.data.duration || null,
			order: (last?.order || 0) + 1,
			moduleId,
		},
	});

	revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`);
	redirect(`/admin/courses/${courseId}/modules/${moduleId}`);
}

export async function updateLesson(courseId, moduleId, lessonId, formData) {
	await requireAdmin();
	const parsed = lessonSchema.safeParse({
		title: formData.get("title"),
		type: formData.get("type"),
		content: formData.get("content"),
		duration: formData.get("duration") || 0,
	});
	if (!parsed.success) return { error: parsed.error.issues[0].message };

	await prisma.lesson.update({
		where: { id: lessonId },
		data: { ...parsed.data, duration: parsed.data.duration || null },
	});

	revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`);
	return { success: true };
}

export async function deleteLesson(courseId, moduleId, lessonId) {
	await requireAdmin();
	await prisma.lesson.delete({ where: { id: lessonId } });
	revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`);
	return { success: true };
}

export async function moveLesson(lessonId, direction) {
	await requireAdmin();
	const lesson = await prisma.lesson.findUnique({
		where: { id: lessonId },
		include: { module: { select: { courseId: true } } },
	});
	if (!lesson) return { error: "Leçon introuvable" };

	const siblingOrder = direction === "up" ? lesson.order - 1 : lesson.order + 1;
	const sibling = await prisma.lesson.findFirst({
		where: { moduleId: lesson.moduleId, order: siblingOrder },
	});
	if (!sibling) return { error: "Mouvement impossible" };

	await prisma.$transaction([
		prisma.lesson.update({ where: { id: lesson.id }, data: { order: sibling.order } }),
		prisma.lesson.update({ where: { id: sibling.id }, data: { order: lesson.order } }),
	]);

	revalidatePath(`/admin/courses/${lesson.module.courseId}/modules/${lesson.moduleId}`);
	return { success: true };
}

// QUIZ ACTIONS

export async function createOrUpdateQuiz(courseId, moduleId, formData) {
	await requireAdmin();
	const title = formData.get("title") || "Quiz du module";
	const passingScore = parseInt(formData.get("passingScore") || "70");

	const existing = await prisma.quiz.findUnique({ where: { moduleId } });
	if (existing) {
		await prisma.quiz.update({
			where: { id: existing.id },
			data: { title, passingScore },
		});
	} else {
		await prisma.quiz.create({
			data: { title, passingScore, moduleId },
		});
	}

	revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`);
	revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}/quiz`);
	return { success: true };
}

export async function deleteQuiz(courseId, moduleId) {
	await requireAdmin();
	await prisma.quiz.delete({ where: { moduleId } });
	revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}`);
	return { success: true };
}

export async function saveQuestion(courseId, moduleId, payload) {
	await requireAdmin();
	const quiz = await prisma.quiz.findUnique({ where: { moduleId } });
	if (!quiz) return { error: "Quiz introuvable" };

	if (!payload.text || payload.text.length < 3) return { error: "Question trop courte" };
	if (!payload.options || payload.options.length < 2) return { error: "Au moins 2 options requises" };
	if (!payload.options.some((o) => o.isCorrect)) return { error: "Au moins une bonne réponse requise" };

	if (payload.id) {
		await prisma.$transaction([
			prisma.answerOption.deleteMany({ where: { questionId: payload.id } }),
			prisma.question.update({
				where: { id: payload.id },
				data: {
					text: payload.text,
					options: {
						create: payload.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
					},
				},
			}),
		]);
	} else {
		const last = await prisma.question.findFirst({
			where: { quizId: quiz.id },
			orderBy: { order: "desc" },
		});
		await prisma.question.create({
			data: {
				text: payload.text,
				order: (last?.order || 0) + 1,
				quizId: quiz.id,
				options: {
					create: payload.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
				},
			},
		});
	}

	revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}/quiz`);
	return { success: true };
}

export async function deleteQuestion(courseId, moduleId, questionId) {
	await requireAdmin();
	await prisma.question.delete({ where: { id: questionId } });
	revalidatePath(`/admin/courses/${courseId}/modules/${moduleId}/quiz`);
	return { success: true };
}
