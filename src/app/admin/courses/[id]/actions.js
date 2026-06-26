"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function requireAdmin() {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Non autorisé");
	}
}

const moduleSchema = z.object({
	title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
});

export async function createModule(courseId, formData) {
	await requireAdmin();
	const parsed = moduleSchema.safeParse({ title: formData.get("title") });
	if (!parsed.success) return { error: parsed.error.issues[0].message };

	const last = await prisma.module.findFirst({
		where: { courseId },
		orderBy: { order: "desc" },
	});

	await prisma.module.create({
		data: {
			title: parsed.data.title,
			order: (last?.order || 0) + 1,
			courseId,
		},
	});

	revalidatePath(`/admin/courses/${courseId}`);
	return { success: true };
}

export async function updateModule(moduleId, formData) {
	await requireAdmin();
	const parsed = moduleSchema.safeParse({ title: formData.get("title") });
	if (!parsed.success) return { error: parsed.error.issues[0].message };

	const mod = await prisma.module.update({
		where: { id: moduleId },
		data: { title: parsed.data.title },
	});

	revalidatePath(`/admin/courses/${mod.courseId}`);
	return { success: true };
}

export async function deleteModule(moduleId) {
	await requireAdmin();
	const mod = await prisma.module.findUnique({ where: { id: moduleId } });
	if (!mod) return { error: "Module introuvable" };

	await prisma.module.delete({ where: { id: moduleId } });
	revalidatePath(`/admin/courses/${mod.courseId}`);
	return { success: true };
}

export async function moveModule(moduleId, direction) {
	await requireAdmin();
	const mod = await prisma.module.findUnique({ where: { id: moduleId } });
	if (!mod) return { error: "Module introuvable" };

	const siblingOrder = direction === "up" ? mod.order - 1 : mod.order + 1;
	const sibling = await prisma.module.findFirst({
		where: { courseId: mod.courseId, order: siblingOrder },
	});
	if (!sibling) return { error: "Mouvement impossible" };

	await prisma.$transaction([
		prisma.module.update({ where: { id: mod.id }, data: { order: sibling.order } }),
		prisma.module.update({ where: { id: sibling.id }, data: { order: mod.order } }),
	]);

	revalidatePath(`/admin/courses/${mod.courseId}`);
	return { success: true };
}
