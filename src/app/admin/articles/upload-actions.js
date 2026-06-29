"use server";

import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/auth";

const ALLOWED_TYPES = {
	image: {
		mimes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
		maxSize: 5 * 1024 * 1024,
		subdir: "images",
	},
	audio: {
		mimes: ["audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg", "audio/webm", "audio/opus"],
		maxSize: 50 * 1024 * 1024,
		subdir: "audio",
	},
	pdf: {
		mimes: ["application/pdf"],
		maxSize: 20 * 1024 * 1024,
		subdir: "pdfs",
	},
};

export async function uploadArticleMedia(formData) {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		return { error: "Non autorisé" };
	}

	const file = formData.get("file");
	const kind = formData.get("kind"); // "image" | "audio" | "pdf"

	if (!file || typeof file === "string") {
		return { error: "Aucun fichier reçu" };
	}

	const config = ALLOWED_TYPES[kind];
	if (!config) return { error: "Type non supporté" };

	if (!config.mimes.includes(file.type)) {
		return { error: `Format invalide (${file.type})` };
	}

	if (file.size > config.maxSize) {
		const maxMb = Math.round(config.maxSize / 1024 / 1024);
		return { error: `Fichier trop volumineux (${maxMb} MB max)` };
	}

	const uploadDir = path.join(process.cwd(), "public", "uploads", "articles", config.subdir);
	if (!existsSync(uploadDir)) {
		await mkdir(uploadDir, { recursive: true });
	}

	const ext = path.extname(file.name) || "";
	const filename = `${randomUUID()}${ext}`;
	const filepath = path.join(uploadDir, filename);

	const bytes = await file.arrayBuffer();
	await writeFile(filepath, Buffer.from(bytes));

	return {
		url: `/uploads/articles/${config.subdir}/${filename}`,
		filename: file.name,
	};
}
