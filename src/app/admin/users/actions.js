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
	return session;
}

const userSchema = z.object({
	name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
	email: z.string().email("Email invalide"),
	role: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN"]),
	membership: z.enum(["FREE", "ACADEMY", "PRIME"]),
});

export async function updateUser(userId, formData) {
	const session = await requireAdmin();

	const parsed = userSchema.safeParse({
		name: formData.get("name"),
		email: formData.get("email"),
		role: formData.get("role"),
		membership: formData.get("membership"),
	});

	if (!parsed.success) {
		return { error: parsed.error.issues[0].message };
	}

	// Garde-fou : un admin ne peut pas se retirer son propre rôle ADMIN
	if (userId === session.user.id && parsed.data.role !== "ADMIN") {
		return { error: "Tu ne peux pas retirer ton propre rôle admin" };
	}

	// Vérifier que l'email ne soit pas pris par un AUTRE user
	const existing = await prisma.user.findUnique({
		where: { email: parsed.data.email },
	});
	if (existing && existing.id !== userId) {
		return { error: "Cet email est déjà utilisé par un autre utilisateur" };
	}

	await prisma.user.update({
		where: { id: userId },
		data: {
			name: parsed.data.name,
			email: parsed.data.email,
			role: parsed.data.role,
			membership: parsed.data.membership,
		},
	});

	revalidatePath("/admin/users");
	revalidatePath(`/admin/users/${userId}`);
	return { success: true };
}

export async function deleteUser(userId) {
	const session = await requireAdmin();

	if (userId === session.user.id) {
		return { error: "Tu ne peux pas supprimer ton propre compte" };
	}

	await prisma.user.delete({ where: { id: userId } });

	revalidatePath("/admin/users");
	redirect("/admin/users");
}
