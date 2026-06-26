"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const registerSchema = z
	.object({
		name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
		email: z.string().email("Email invalide"),
		password: z
			.string()
			.min(8, "Le mot de passe doit faire au moins 8 caractères")
			.regex(/[A-Z]/, "Doit contenir au moins une majuscule")
			.regex(/[0-9]/, "Doit contenir au moins un chiffre"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Les mots de passe ne correspondent pas",
		path: ["confirmPassword"],
	});

export async function registerUser(formData) {
	const parsed = registerSchema.safeParse({
		name: formData.get("name"),
		email: formData.get("email"),
		password: formData.get("password"),
		confirmPassword: formData.get("confirmPassword"),
	});

	if (!parsed.success) {
		return {
			error: parsed.error.issues[0].message,
		};
	}

	const { name, email, password } = parsed.data;

	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		return { error: "Un compte existe déjà avec cet email" };
	}

	const hashed = await bcrypt.hash(password, 10);

	await prisma.user.create({
		data: {
			name,
			email,
			password: hashed,
			role: "STUDENT",
		},
	});

	return { success: true };
}
