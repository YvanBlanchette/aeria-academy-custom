"use server";

import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Helper : valide qu'une chaîne est une URL ou vide
function urlOrEmpty(message) {
	return z
		.string()
		.refine((val) => val === "" || /^https?:\/\/.+/.test(val), { message })
		.transform((v) => (v === "" ? null : v));
}

const usernameSchema = z
	.string()
	.min(3, "Au moins 3 caractères")
	.max(30, "Maximum 30 caractères")
	.regex(/^[a-z0-9-]+$/, "Lettres minuscules, chiffres et tirets uniquement")
	.refine((val) => !val.startsWith("-") && !val.endsWith("-"), {
		message: "Ne peut pas commencer ou finir par un tiret",
	});

const RESERVED_USERNAMES = [
	"admin",
	"api",
	"login",
	"logout",
	"register",
	"signup",
	"signin",
	"profile",
	"courses",
	"course",
	"learn",
	"dashboard",
	"pricing",
	"settings",
	"u",
	"user",
	"users",
	"agencies",
	"agency",
	"about",
	"contact",
	"help",
	"support",
	"terms",
	"privacy",
	"legal",
	"blog",
	"new",
	"edit",
	"delete",
	"auth",
	"static",
	"_next",
	"favicon",
	"aeria",
	"academy",
	"aeriavoyages",
];

export async function updateUsername(formData) {
	const session = await auth();
	if (!session) return { error: "Non autorisé" };

	const rawUsername = String(formData.get("username") || "")
		.toLowerCase()
		.trim();

	// Cas spécial : vider le username (désactiver le profil public)
	if (rawUsername === "") {
		await prisma.user.update({
			where: { id: session.user.id },
			data: { username: null },
		});
		await prisma.userProfile.update({
			where: { userId: session.user.id },
			data: { publicProfile: false },
		});
		revalidatePath("/profile");
		return { success: true, username: null };
	}

	// Valide le format
	const parsed = usernameSchema.safeParse(rawUsername);
	if (!parsed.success) {
		return { error: parsed.error.issues[0].message };
	}

	// Mots réservés
	if (RESERVED_USERNAMES.includes(rawUsername)) {
		return { error: "Ce nom d'utilisateur est réservé" };
	}

	// Disponibilité
	const existing = await prisma.user.findUnique({
		where: { username: rawUsername },
	});
	if (existing && existing.id !== session.user.id) {
		return { error: "Ce nom d'utilisateur est déjà pris" };
	}

	// Update
	await prisma.user.update({
		where: { id: session.user.id },
		data: { username: rawUsername },
	});

	revalidatePath("/profile");
	return { success: true, username: rawUsername };
}

// Suggestion de username à partir du nom (utile pour proposer un default)
export async function suggestUsername(name) {
	if (!name) return null;
	const base = name
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // retire les accents
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 25);

	if (base.length < 3) return null;

	// Vérifie disponibilité avec quelques variantes
	for (let i = 0; i < 10; i++) {
		const candidate = i === 0 ? base : `${base}-${i + 1}`;
		const taken = await prisma.user.findUnique({ where: { username: candidate } });
		if (!taken) return candidate;
	}
	return null;
}

const profileSchema = z.object({
	name: z.string().min(2, "Nom trop court").max(120, "Nom trop long"),
	image: z
		.string()
		.refine((val) => val === "" || val.startsWith("/uploads/") || /^https?:\/\//.test(val), {
			message: "URL d'image invalide",
		})
		.optional(),

	// Coordonnées
	phone: z.string().max(30).optional().nullable(),
	address: z.string().max(200).optional().nullable(),
	city: z.string().max(100).optional().nullable(),
	province: z.string().max(50).optional().nullable(),
	country: z.string().max(50).optional().nullable(),
	postalCode: z.string().max(20).optional().nullable(),

	// Profil pro
	bio: z.string().max(2000).optional().nullable(),
	jobTitle: z.string().max(100).optional().nullable(),
	company: z.string().max(100).optional().nullable(),
	websiteUrl: urlOrEmpty("Site web invalide (commence par https://)"),

	// Social links
	facebookUrl: urlOrEmpty("URL Facebook invalide"),
	linkedinUrl: urlOrEmpty("URL LinkedIn invalide"),
	instagramUrl: urlOrEmpty("URL Instagram invalide"),
	tiktokUrl: urlOrEmpty("URL TikTok invalide"),
	twitterUrl: urlOrEmpty("URL Twitter/X invalide"),
	youtubeUrl: urlOrEmpty("URL YouTube invalide"),

	publicProfile: z.boolean().default(false),

	agencyRole: z.string().max(100).optional().nullable(),
});

export async function updateProfile(formData) {
	const session = await auth();
	if (!session) return { error: "Non autorisé" };

	// Convertit le FormData en objet
	const raw = {
		name: String(formData.get("name") || "").trim(),
		image: String(formData.get("image") || "").trim(),
		phone: formData.get("phone") || null,
		address: formData.get("address") || null,
		city: formData.get("city") || null,
		province: formData.get("province") || null,
		country: formData.get("country") || null,
		postalCode: formData.get("postalCode") || null,
		bio: formData.get("bio") || null,
		jobTitle: formData.get("jobTitle") || null,
		company: formData.get("company") || null,
		websiteUrl: formData.get("websiteUrl") || "",
		facebookUrl: formData.get("facebookUrl") || "",
		linkedinUrl: formData.get("linkedinUrl") || "",
		instagramUrl: formData.get("instagramUrl") || "",
		tiktokUrl: formData.get("tiktokUrl") || "",
		twitterUrl: formData.get("twitterUrl") || "",
		youtubeUrl: formData.get("youtubeUrl") || "",
		publicProfile: formData.get("publicProfile") === "true",
		agencyRole: formData.get("agencyRole") || null,
	};

	const parsed = profileSchema.safeParse(raw);
	if (!parsed.success) {
		return { error: parsed.error.issues[0].message };
	}

	const d = parsed.data;

	// Construit l'objet socialLinks
	const socialLinks = {};
	if (d.facebookUrl) socialLinks.facebook = d.facebookUrl;
	if (d.linkedinUrl) socialLinks.linkedin = d.linkedinUrl;
	if (d.instagramUrl) socialLinks.instagram = d.instagramUrl;
	if (d.tiktokUrl) socialLinks.tiktok = d.tiktokUrl;
	if (d.twitterUrl) socialLinks.twitter = d.twitterUrl;
	if (d.youtubeUrl) socialLinks.youtube = d.youtubeUrl;

	await prisma.user.update({
		where: { id: session.user.id },
		data: {
			name: d.name,
			image: d.image || null,
		},
	});

	await prisma.userProfile.upsert({
		where: { userId: session.user.id },
		update: {
			phone: d.phone,
			address: d.address,
			city: d.city,
			province: d.province,
			country: d.country,
			postalCode: d.postalCode,
			bio: d.bio,
			jobTitle: d.jobTitle,
			company: d.company,
			websiteUrl: d.websiteUrl,
			socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
			publicProfile: d.publicProfile,
			agencyRole: d.agencyRole,
		},
		create: {
			userId: session.user.id,
			phone: d.phone,
			address: d.address,
			city: d.city,
			province: d.province,
			country: d.country,
			postalCode: d.postalCode,
			bio: d.bio,
			jobTitle: d.jobTitle,
			company: d.company,
			websiteUrl: d.websiteUrl,
			socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
			publicProfile: d.publicProfile,
			agencyRole: d.agencyRole,
		},
	});

	revalidatePath("/profile");
	revalidatePath("/dashboard");
	return { success: true };
}

const PROFILE_IMAGE_CONFIG = {
	allowedMimes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
	maxSize: 5 * 1024 * 1024, // 5 MB
};

export async function uploadProfileImage(formData) {
	const session = await auth();
	if (!session) return { error: "Non autorisé" };

	const file = formData.get("file");
	if (!file || typeof file === "string") {
		return { error: "Aucun fichier reçu" };
	}

	if (!PROFILE_IMAGE_CONFIG.allowedMimes.includes(file.type)) {
		return { error: `Format invalide. Reçu : ${file.type}` };
	}

	if (file.size > PROFILE_IMAGE_CONFIG.maxSize) {
		return { error: "Image trop volumineuse (5 MB max)" };
	}

	const ext = (path.extname(file.name) || "").toLowerCase();
	const uploadDir = path.join(process.cwd(), "public", "uploads", "users", "avatars");
	if (!existsSync(uploadDir)) {
		await mkdir(uploadDir, { recursive: true });
	}

	const filename = `${session.user.id}-${randomUUID()}${ext}`;
	const filePath = path.join(uploadDir, filename);

	const bytes = await file.arrayBuffer();
	await writeFile(filePath, Buffer.from(bytes));

	return {
		url: `/uploads/users/avatars/${filename}`,
	};
}

export async function updateAccount(formData) {
	const session = await auth();
	if (!session) return { error: "Non autorisé" };

	const name = String(formData.get("name") || "").trim();
	const image = String(formData.get("image") || "").trim();

	if (name.length < 2) return { error: "Nom trop court" };

	await prisma.user.update({
		where: { id: session.user.id },
		data: {
			name,
			image: image || null,
		},
	});

	revalidatePath("/profile");
	return { success: true };
}
