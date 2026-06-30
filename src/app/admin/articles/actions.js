"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/slugify";
import { generateExcerpt } from "@/lib/article-renderer";

async function requireAdmin() {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Non autorisé");
	}
	return session;
}

const articleSchema = z.object({
	title: z.string().min(3, "Le titre doit faire au moins 3 caractères").max(200),
	slug: z.string().max(240).optional().nullable(),
	excerpt: z.string().max(500).optional().nullable(),
	coverImage: z.string().optional().nullable(),
	content: z.string().min(10, "Le contenu est trop court"),
	requiredTier: z.enum(["FREE", "ACADEMY", "PRIME"]),
	tagIds: z.array(z.string()).default([]),
});

function parseFormData(formData) {
	const tagIdsRaw = formData.get("tagIds");
	const tagIds = tagIdsRaw ? tagIdsRaw.toString().split(",").filter(Boolean) : [];

	return {
		title: formData.get("title"),
		slug: formData.get("slug") || null,
		excerpt: formData.get("excerpt") || null,
		coverImage: formData.get("coverImage") || null,
		content: formData.get("content"),
		requiredTier: formData.get("requiredTier") || "FREE",
		tagIds,
	};
}

export async function createArticle(formData) {
	const session = await requireAdmin();

	const parsed = articleSchema.safeParse(parseFormData(formData));
	if (!parsed.success) {
		return { error: parsed.error.issues[0].message };
	}

	const data = parsed.data;

	// Génère un slug unique
	let slug = slugify(data.slug || data.title);
	if (!slug) slug = `article-${Date.now()}`;
	const existing = await prisma.article.findUnique({ where: { slug } });
	if (existing) slug = `${slug}-${Date.now()}`;

	// Excerpt auto si pas fourni
	const excerpt = data.excerpt || generateExcerpt(data.content);

	const article = await prisma.article.create({
		data: {
			slug,
			title: data.title,
			excerpt,
			coverImage: data.coverImage,
			content: data.content,
			requiredTier: data.requiredTier,
			authorId: session.user.id,
			published: false,
			tags: {
				create: data.tagIds.map((tagId) => ({ tagId })),
			},
		},
	});

	revalidatePath("/admin/articles");
	redirect(`/admin/articles/${article.id}`);
}

export async function updateArticle(articleId, formData) {
	await requireAdmin();

	const parsed = articleSchema.safeParse(parseFormData(formData));
	if (!parsed.success) {
		return { error: parsed.error.issues[0].message };
	}

	const data = parsed.data;
	const excerpt = data.excerpt || generateExcerpt(data.content);
	let nextSlug = slugify(data.slug || data.title);
	if (!nextSlug) nextSlug = `article-${Date.now()}`;

	const existingWithSlug = await prisma.article.findFirst({
		where: {
			slug: nextSlug,
			NOT: { id: articleId },
		},
		select: { id: true },
	});
	if (existingWithSlug) nextSlug = `${nextSlug}-${Date.now()}`;

	// Update les champs simples
	await prisma.article.update({
		where: { id: articleId },
		data: {
			slug: nextSlug,
			title: data.title,
			excerpt,
			coverImage: data.coverImage,
			content: data.content,
			requiredTier: data.requiredTier,
		},
	});

	// Sync les tags : drop tous puis recrée
	await prisma.articleTag.deleteMany({ where: { articleId } });
	if (data.tagIds.length > 0) {
		await prisma.articleTag.createMany({
			data: data.tagIds.map((tagId) => ({ articleId, tagId })),
		});
	}

	revalidatePath("/admin/articles");
	revalidatePath(`/admin/articles/${articleId}`);
	revalidatePath("/resources");
	return { success: true };
}

export async function togglePublishArticle(articleId) {
	await requireAdmin();

	const article = await prisma.article.findUnique({
		where: { id: articleId },
		select: { published: true, publishedAt: true },
	});
	if (!article) return { error: "Article introuvable" };

	const willPublish = !article.published;

	await prisma.article.update({
		where: { id: articleId },
		data: {
			published: willPublish,
			publishedAt: willPublish && !article.publishedAt ? new Date() : article.publishedAt,
		},
	});

	revalidatePath("/admin/articles");
	revalidatePath(`/admin/articles/${articleId}`);
	revalidatePath("/resources");
	return { success: true, published: willPublish };
}

export async function deleteArticle(articleId) {
	await requireAdmin();

	await prisma.article.delete({ where: { id: articleId } });

	revalidatePath("/admin/articles");
	revalidatePath("/resources");
	redirect("/admin/articles");
}

export async function deleteArticleInline(articleId) {
	await requireAdmin();

	await prisma.article.delete({ where: { id: articleId } });

	revalidatePath("/admin/articles");
	revalidatePath("/resources");
	return { success: true };
}

export async function duplicateArticleInline(articleId) {
	const session = await requireAdmin();

	const source = await prisma.article.findUnique({
		where: { id: articleId },
		include: {
			tags: {
				select: {
					tagId: true,
				},
			},
		},
	});

	if (!source) {
		return { error: "Article introuvable" };
	}

	let baseSlug = slugify(`${source.title}-copie`);
	if (!baseSlug) baseSlug = `article-copie-${Date.now()}`;
	let slug = baseSlug;
	let i = 2;
	while (await prisma.article.findUnique({ where: { slug } })) {
		slug = `${baseSlug}-${i}`;
		i += 1;
	}

	const duplicated = await prisma.article.create({
		data: {
			slug,
			title: `${source.title} (copie)`,
			excerpt: source.excerpt,
			coverImage: source.coverImage,
			content: source.content,
			requiredTier: source.requiredTier,
			authorId: session.user.id,
			published: false,
			publishedAt: null,
			viewCount: 0,
			tags: {
				create: source.tags.map((t) => ({ tagId: t.tagId })),
			},
		},
		select: { id: true },
	});

	revalidatePath("/admin/articles");
	return { success: true, articleId: duplicated.id };
}

// ============== TAGS ==============

const tagSchema = z.object({
	name: z.string().min(2, "Nom trop court").max(50),
	color: z
		.string()
		.regex(/^#[0-9a-fA-F]{6}$/, "Couleur hex invalide (ex: #FF5733)")
		.optional()
		.nullable(),
});

export async function createTag(formData) {
	await requireAdmin();

	const parsed = tagSchema.safeParse({
		name: formData.get("name"),
		color: formData.get("color") || null,
	});

	if (!parsed.success) {
		return { error: parsed.error.issues[0].message };
	}

	let slug = slugify(parsed.data.name);
	const existing = await prisma.tag.findUnique({ where: { slug } });
	if (existing) return { error: "Un tag avec ce nom existe déjà" };

	await prisma.tag.create({
		data: {
			slug,
			name: parsed.data.name,
			color: parsed.data.color,
		},
	});

	revalidatePath("/admin/articles/tags");
	revalidatePath("/admin/articles");
	return { success: true };
}

export async function updateTag(tagId, formData) {
	await requireAdmin();

	const parsed = tagSchema.safeParse({
		name: formData.get("name"),
		color: formData.get("color") || null,
	});

	if (!parsed.success) {
		return { error: parsed.error.issues[0].message };
	}

	await prisma.tag.update({
		where: { id: tagId },
		data: {
			name: parsed.data.name,
			color: parsed.data.color,
		},
	});

	revalidatePath("/admin/articles/tags");
	return { success: true };
}

export async function deleteTag(tagId) {
	await requireAdmin();
	await prisma.tag.delete({ where: { id: tagId } });
	revalidatePath("/admin/articles/tags");
	return { success: true };
}
