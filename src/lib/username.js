import { prisma } from "@/lib/prisma";

export const RESERVED_USERNAMES = [
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

function sanitizeSeed(value) {
	return String(value || "")
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function normalizeCandidate(base, suffixNumber = 0) {
	const suffix = suffixNumber > 0 ? `-${suffixNumber + 1}` : "";
	const maxBaseLength = 30 - suffix.length;
	const safeBase = (base || "user").slice(0, maxBaseLength).replace(/-+$/g, "") || "user";
	return `${safeBase}${suffix}`;
}

export function usernameBaseFromUser({ name, email, id }) {
	const emailLocal = String(email || "").split("@")[0] || "";
	let base = sanitizeSeed(name) || sanitizeSeed(emailLocal) || "";

	if (!base || base.length < 3) {
		const fallback = sanitizeSeed(id ? `user-${id.slice(-6)}` : "user");
		base = fallback || "user";
	}

	if (RESERVED_USERNAMES.includes(base)) {
		base = `${base}-user`;
	}

	if (base.length < 3) {
		base = `${base}123`.slice(0, 30);
	}

	return base;
}

export async function findAvailableUsername(base, { excludeUserId } = {}) {
	for (let i = 0; i < 500; i++) {
		const candidate = normalizeCandidate(base, i);
		if (RESERVED_USERNAMES.includes(candidate)) continue;

		const existing = await prisma.user.findUnique({
			where: { username: candidate },
			select: { id: true },
		});

		if (!existing || existing.id === excludeUserId) {
			return candidate;
		}
	}

	return `user-${Date.now().toString(36)}`;
}

export async function generateDefaultUsernameForUser({ name, email, id, excludeUserId }) {
	const base = usernameBaseFromUser({ name, email, id });
	return findAvailableUsername(base, { excludeUserId });
}

export async function ensureUserHasUsername(userId) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, name: true, email: true, username: true },
	});

	if (!user) return null;
	if (user.username) return user.username;

	for (let attempt = 0; attempt < 5; attempt++) {
		const username = await generateDefaultUsernameForUser({
			name: user.name,
			email: user.email,
			id: user.id,
			excludeUserId: user.id,
		});

		try {
			await prisma.user.update({
				where: { id: user.id },
				data: { username },
			});
			return username;
		} catch (error) {
			if (error?.code !== "P2002") {
				throw error;
			}
		}
	}

	return null;
}
