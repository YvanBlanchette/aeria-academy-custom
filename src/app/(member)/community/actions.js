"use server";

import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCommunityEnabled } from "@/lib/platform-settings";

const COMMUNITY_IMAGE_CONFIG = {
	allowedMimes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
	maxSize: 5 * 1024 * 1024,
};

async function requireUser() {
	const session = await auth();
	if (!session?.user?.id) throw new Error("Non autorise");
	const communityEnabled = await getCommunityEnabled();
	if (!communityEnabled) throw new Error("La communauté est actuellement désactivée");
	return session.user;
}

function canModerate(user, authorId) {
	return user.id === authorId || user.role === "ADMIN";
}

async function uploadCommunityImage({ file, sessionUserId }) {
	if (!COMMUNITY_IMAGE_CONFIG.allowedMimes.includes(file.type)) {
		return { error: `Format invalide. Recu : ${file.type}` };
	}

	if (file.size > COMMUNITY_IMAGE_CONFIG.maxSize) {
		return { error: "Image trop volumineuse (5 MB max)" };
	}

	const ext = (path.extname(file.name) || "").toLowerCase();
	const uploadDir = path.join(process.cwd(), "public", "uploads", "community", "posts");
	if (!existsSync(uploadDir)) {
		await mkdir(uploadDir, { recursive: true });
	}

	const filename = `${sessionUserId}-${randomUUID()}${ext}`;
	const filePath = path.join(uploadDir, filename);

	const bytes = await file.arrayBuffer();
	await writeFile(filePath, Buffer.from(bytes));

	return {
		url: `/uploads/community/posts/${filename}`,
	};
}

const createPostSchema = z.object({
	content: z.string().trim().min(3, "Le message est trop court").max(4000, "Message trop long"),
	imageUrl: z.string().trim().optional(),
});

const createCommentSchema = z.object({
	postId: z.string().cuid("Post invalide"),
	content: z.string().trim().min(2, "Commentaire trop court").max(1500, "Commentaire trop long"),
});

const updatePostSchema = z.object({
	postId: z.string().cuid("Post invalide"),
	content: z.string().trim().min(3, "Le message est trop court").max(4000, "Message trop long"),
	imageUrl: z.string().trim().optional(),
});

const deletePostSchema = z.object({
	postId: z.string().cuid("Post invalide"),
});

const updateCommentSchema = z.object({
	commentId: z.string().cuid("Commentaire invalide"),
	content: z.string().trim().min(2, "Commentaire trop court").max(1500, "Commentaire trop long"),
});

const deleteCommentSchema = z.object({
	commentId: z.string().cuid("Commentaire invalide"),
});

const notificationIdSchema = z.object({
	notificationId: z.string().cuid("Notification invalide"),
});

export async function uploadCommunityPostImage(formData) {
	const user = await requireUser();
	const file = formData.get("file");

	if (!file || typeof file === "string") {
		return { error: "Aucun fichier recu" };
	}

	return uploadCommunityImage({
		file,
		sessionUserId: user.id,
	});
}

export async function createCommunityPost(formData) {
	const user = await requireUser();

	const parsed = createPostSchema.safeParse({
		content: formData.get("content") || "",
		imageUrl: formData.get("imageUrl") || "",
	});

	if (!parsed.success) {
		return { error: parsed.error.issues[0].message };
	}

	const data = parsed.data;
	await prisma.communityPost.create({
		data: {
			authorId: user.id,
			type: "UPDATE",
			content: data.content,
			imageUrl: data.imageUrl || null,
		},
	});

	revalidatePath("/community");
	return { success: true };
}

export async function createCommunityComment(formData) {
	const user = await requireUser();

	const parsed = createCommentSchema.safeParse({
		postId: formData.get("postId") || "",
		content: formData.get("content") || "",
	});

	if (!parsed.success) {
		return { error: parsed.error.issues[0].message };
	}

	const post = await prisma.communityPost.findUnique({
		where: { id: parsed.data.postId },
		select: { id: true, authorId: true },
	});
	if (!post) return { error: "Publication introuvable" };

	const comment = await prisma.communityComment.create({
		data: {
			postId: parsed.data.postId,
			authorId: user.id,
			content: parsed.data.content,
		},
	});

	if (post.authorId !== user.id) {
		await prisma.communityNotification.create({
			data: {
				recipientId: post.authorId,
				actorId: user.id,
				type: "POST_COMMENT",
				postId: post.id,
				commentId: comment.id,
			},
		});
	}

	revalidatePath("/community");
	return { success: true };
}

export async function updateCommunityPost(formData) {
	const user = await requireUser();

	const parsed = updatePostSchema.safeParse({
		postId: formData.get("postId") || "",
		content: formData.get("content") || "",
		imageUrl: formData.get("imageUrl") || "",
	});

	if (!parsed.success) {
		return { error: parsed.error.issues[0].message };
	}

	const post = await prisma.communityPost.findUnique({
		where: { id: parsed.data.postId },
		select: { id: true, authorId: true },
	});
	if (!post) return { error: "Publication introuvable" };
	if (!canModerate(user, post.authorId)) return { error: "Non autorise" };

	await prisma.communityPost.update({
		where: { id: post.id },
		data: {
			type: "UPDATE",
			content: parsed.data.content,
			imageUrl: parsed.data.imageUrl || null,
		},
	});

	revalidatePath("/community");
	return { success: true };
}

export async function deleteCommunityPost(formData) {
	const user = await requireUser();

	const parsed = deletePostSchema.safeParse({
		postId: formData.get("postId") || "",
	});

	if (!parsed.success) {
		return { error: parsed.error.issues[0].message };
	}

	const post = await prisma.communityPost.findUnique({
		where: { id: parsed.data.postId },
		select: { id: true, authorId: true },
	});
	if (!post) return { error: "Publication introuvable" };
	if (!canModerate(user, post.authorId)) return { error: "Non autorise" };

	await prisma.communityPost.delete({ where: { id: post.id } });

	revalidatePath("/community");
	return { success: true };
}

export async function updateCommunityComment(formData) {
	const user = await requireUser();

	const parsed = updateCommentSchema.safeParse({
		commentId: formData.get("commentId") || "",
		content: formData.get("content") || "",
	});

	if (!parsed.success) {
		return { error: parsed.error.issues[0].message };
	}

	const comment = await prisma.communityComment.findUnique({
		where: { id: parsed.data.commentId },
		select: { id: true, authorId: true },
	});
	if (!comment) return { error: "Commentaire introuvable" };
	if (!canModerate(user, comment.authorId)) return { error: "Non autorise" };

	await prisma.communityComment.update({
		where: { id: comment.id },
		data: { content: parsed.data.content },
	});

	revalidatePath("/community");
	return { success: true };
}

export async function deleteCommunityComment(formData) {
	const user = await requireUser();

	const parsed = deleteCommentSchema.safeParse({
		commentId: formData.get("commentId") || "",
	});

	if (!parsed.success) {
		return { error: parsed.error.issues[0].message };
	}

	const comment = await prisma.communityComment.findUnique({
		where: { id: parsed.data.commentId },
		select: { id: true, authorId: true },
	});
	if (!comment) return { error: "Commentaire introuvable" };
	if (!canModerate(user, comment.authorId)) return { error: "Non autorise" };

	await prisma.communityComment.delete({ where: { id: comment.id } });

	revalidatePath("/community");
	return { success: true };
}

export async function toggleCommunityPostLike(postId) {
	const user = await requireUser();
	if (!postId) return { error: "Publication invalide" };

	const post = await prisma.communityPost.findUnique({
		where: { id: postId },
		select: { id: true, authorId: true },
	});
	if (!post) return { error: "Publication introuvable" };

	const existing = await prisma.communityPostLike.findUnique({
		where: {
			postId_userId: {
				postId,
				userId: user.id,
			},
		},
		select: { id: true },
	});

	if (existing) {
		await prisma.communityPostLike.delete({ where: { id: existing.id } });
		await prisma.communityNotification.deleteMany({
			where: {
				type: "POST_LIKE",
				postId,
				actorId: user.id,
				recipientId: post.authorId,
			},
		});
	} else {
		await prisma.communityPostLike.create({
			data: {
				postId,
				userId: user.id,
			},
		});

		if (post.authorId !== user.id) {
			await prisma.communityNotification.create({
				data: {
					recipientId: post.authorId,
					actorId: user.id,
					type: "POST_LIKE",
					postId,
				},
			});
		}
	}

	revalidatePath("/community");
	return { success: true };
}

export async function markCommunityNotificationAsRead(formData) {
	const user = await requireUser();

	const parsed = notificationIdSchema.safeParse({
		notificationId: formData.get("notificationId") || "",
	});
	if (!parsed.success) return { error: parsed.error.issues[0].message };

	await prisma.communityNotification.updateMany({
		where: {
			id: parsed.data.notificationId,
			recipientId: user.id,
		},
		data: {
			isRead: true,
			readAt: new Date(),
		},
	});

	revalidatePath("/community");
	return { success: true };
}

export async function markAllCommunityNotificationsAsRead() {
	const user = await requireUser();

	await prisma.communityNotification.updateMany({
		where: {
			recipientId: user.id,
			isRead: false,
		},
		data: {
			isRead: true,
			readAt: new Date(),
		},
	});

	revalidatePath("/community");
	return { success: true };
}
