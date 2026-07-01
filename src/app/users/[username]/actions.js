"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const followSchema = z.object({
	followingId: z.string().cuid("Utilisateur invalide"),
	username: z.string().min(1),
});

async function requireSessionUser() {
	const session = await auth();
	if (!session?.user?.id) {
		return null;
	}
	return session.user;
}

export async function followUser(formData) {
	const user = await requireSessionUser();
	if (!user) return { error: "Non autorisé" };

	const parsed = followSchema.safeParse({
		followingId: formData.get("followingId") || "",
		username: formData.get("username") || "",
	});
	if (!parsed.success) return { error: parsed.error.issues[0].message };

	const { followingId, username } = parsed.data;
	if (followingId === user.id) return { error: "Action invalide" };

	const target = await prisma.user.findUnique({
		where: { id: followingId },
		select: { id: true },
	});
	if (!target) return { error: "Profil introuvable" };

	const existing = await prisma.userFollow.findUnique({
		where: {
			followerId_followingId: {
				followerId: user.id,
				followingId,
			},
		},
		select: { id: true },
	});

	if (!existing) {
		await prisma.userFollow.create({
			data: {
				followerId: user.id,
				followingId,
			},
		});

		await prisma.communityNotification.create({
			data: {
				recipientId: followingId,
				actorId: user.id,
				type: "FOLLOW",
			},
		});
	}

	revalidatePath(`/users/${username}`);
	revalidatePath("/community");
	return { success: true };
}

export async function unfollowUser(formData) {
	const user = await requireSessionUser();
	if (!user) return { error: "Non autorisé" };

	const parsed = followSchema.safeParse({
		followingId: formData.get("followingId") || "",
		username: formData.get("username") || "",
	});
	if (!parsed.success) return { error: parsed.error.issues[0].message };

	const { followingId, username } = parsed.data;

	await prisma.userFollow.deleteMany({
		where: {
			followerId: user.id,
			followingId,
		},
	});

	await prisma.communityNotification.deleteMany({
		where: {
			recipientId: followingId,
			actorId: user.id,
			type: "FOLLOW",
		},
	});

	revalidatePath(`/users/${username}`);
	revalidatePath("/community");
	return { success: true };
}
