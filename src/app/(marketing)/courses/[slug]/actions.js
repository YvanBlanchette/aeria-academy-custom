"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function enrollInCourse(courseSlug) {
	const session = await auth();
	if (!session) redirect(`/login?callbackUrl=/courses/${courseSlug}`);

	const course = await prisma.course.findUnique({
		where: { slug: courseSlug },
	});
	if (!course) return { error: "Cours introuvable" };
	if (!course.published) return { error: "Ce cours n'est pas disponible" };

	// Pour l'instant, inscription gratuite (Stripe arrive ensuite)
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
