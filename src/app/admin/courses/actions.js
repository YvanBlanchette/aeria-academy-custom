"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/slugify";

async function requireAdmin() {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Non autorisé");
	}
	return session;
}

// Helper : valide qu'une chaîne est une URL absolue (http(s)://...)
function isValidUrl(str) {
	try {
		new URL(str);
		return true;
	} catch {
		return false;
	}
}

// Schéma partagé entre create et update
const courseSchema = z.object({
	title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
	description: z.string().min(10, "Description trop courte"),
	price: z.coerce.number().int().min(0, "Prix invalide"),
	thumbnail: z
		.string()
		.refine((val) => val === "" || val.startsWith("/uploads/") || isValidUrl(val), { message: "Doit être une URL valide ou un chemin /uploads/" }),
});

export async function createCourse(formData) {
	await requireAdmin();

	const parsed = courseSchema.safeParse({
		title: formData.get("title"),
		description: formData.get("description"),
		price: formData.get("price"),
		thumbnail: formData.get("thumbnail") || "",
	});

	if (!parsed.success) {
		return { error: parsed.error.issues[0].message };
	}

	const { title, description, price, thumbnail } = parsed.data;
	let slug = slugify(title);

	const existing = await prisma.course.findUnique({ where: { slug } });
	if (existing) {
		slug = `${slug}-${Date.now()}`;
	}

	const course = await prisma.course.create({
		data: {
			title,
			description,
			price: Math.round(price * 100),
			thumbnail: thumbnail || null,
			slug,
			published: false,
		},
	});

	revalidatePath("/admin/courses");
	redirect(`/admin/courses/${course.id}`);
}

export async function updateCourse(courseId, formData) {
	await requireAdmin();

	const parsed = courseSchema.safeParse({
		title: formData.get("title"),
		description: formData.get("description"),
		price: formData.get("price"),
		thumbnail: formData.get("thumbnail") || "",
	});

	if (!parsed.success) {
		return { error: parsed.error.issues[0].message };
	}

	const { title, description, price, thumbnail } = parsed.data;

	await prisma.course.update({
		where: { id: courseId },
		data: {
			title,
			description,
			price: Math.round(price * 100),
			thumbnail: thumbnail || null,
		},
	});

	revalidatePath("/admin/courses");
	revalidatePath(`/admin/courses/${courseId}`);
	return { success: true };
}

export async function togglePublish(courseId) {
	await requireAdmin();

	const course = await prisma.course.findUnique({ where: { id: courseId } });
	if (!course) return { error: "Cours introuvable" };

	if (!course.published) {
		const [modulesCount, lessonsCount] = await Promise.all([
			prisma.module.count({ where: { courseId } }),
			prisma.lesson.count({ where: { module: { courseId } } }),
		]);

		if (modulesCount === 0) {
			return { error: "Ajoute au moins un module avant de publier ce cours" };
		}

		if (lessonsCount === 0) {
			return { error: "Ajoute au moins une leçon avant de publier ce cours" };
		}
	}

	await prisma.course.update({
		where: { id: courseId },
		data: { published: !course.published },
	});

	revalidatePath("/admin/courses");
	revalidatePath(`/admin/courses/${courseId}`);
	return { success: true };
}

export async function deleteCourse(courseId) {
	await requireAdmin();

	const enrollmentsCount = await prisma.enrollment.count({ where: { courseId } });
	if (enrollmentsCount > 0) {
		return { error: `Suppression bloquee: ${enrollmentsCount} inscription(s) active(s)` };
	}

	await prisma.course.delete({ where: { id: courseId } });
	revalidatePath("/admin/courses");
	return { success: true };
}
