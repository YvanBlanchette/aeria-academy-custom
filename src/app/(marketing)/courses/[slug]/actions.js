"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * Inscription gratuite (pour les cours gratuits, ou pour les membres qui ont déjà accès).
 * Pour les achats payants one-shot, on passera par Stripe Checkout dans une autre action.
 */
export async function enrollInCourse(courseSlug) {
	const session = await auth();
	if (!session) redirect(`/login?callbackUrl=/courses/${courseSlug}`);

	const course = await prisma.course.findUnique({
		where: { slug: courseSlug },
	});
	if (!course) return { error: "Cours introuvable" };
	if (!course.published) return { error: "Ce cours n'est pas disponible" };

	const isFreeCourse = course.price === 0;
	const isMember = ["ACADEMY", "PRIME"].includes(session.user.membership);
	const isPrivileged = ["ADMIN", "INSTRUCTOR"].includes(session.user.role);

	if (!isFreeCourse && !isMember && !isPrivileged) {
		return {
			error: "Ce cours nécessite un abonnement Académie ou Prime",
		};
	}

	await prisma.enrollment.upsert({
		where: {
			userId_courseId: { userId: session.user.id, courseId: course.id },
		},
		update: {},
		create: { userId: session.user.id, courseId: course.id },
	});

	revalidatePath(`/courses/${courseSlug}`);
	revalidatePath("/dashboard");
	redirect(`/learn/${course.id}`);
}
