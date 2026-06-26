"use server";

import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "courses");

export async function uploadCourseImage(formData) {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		return { error: "Non autorisé" };
	}

	const file = formData.get("file");
	if (!file || typeof file === "string") {
		return { error: "Aucun fichier reçu" };
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		return { error: "Format non supporté (JPEG, PNG, WebP, GIF uniquement)" };
	}

	if (file.size > MAX_SIZE) {
		return { error: "Fichier trop volumineux (5 MB max)" };
	}

	// Crée le dossier s'il n'existe pas
	if (!existsSync(UPLOAD_DIR)) {
		await mkdir(UPLOAD_DIR, { recursive: true });
	}

	// Génère un nom unique pour éviter les collisions
	const ext = path.extname(file.name) || ".jpg";
	const filename = `${randomUUID()}${ext}`;
	const filepath = path.join(UPLOAD_DIR, filename);

	// Écrit le fichier
	const bytes = await file.arrayBuffer();
	await writeFile(filepath, Buffer.from(bytes));

	// Retourne l'URL relative que Next servira automatiquement
	return { url: `/uploads/courses/${filename}` };
}
