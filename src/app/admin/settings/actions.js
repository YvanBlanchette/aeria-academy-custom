"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { DEFAULT_SETTINGS, normalizeSettings, settingsSchema } from "./settings-schema";

const SETTINGS_ID = "global";

const SENSITIVE_SETTING_KEYS = [
	"maintenanceMode",
	"maintenanceMessage",
	"enablePaymentGateway",
	"paymentProvider",
	"defaultPlan",
	"currency",
	"enableSystemAlerts",
	"debugLogsRetentionDays",
	"academyPublicDomain",
];

async function requireAdmin() {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Non autorise");
	}
	return session;
}

function isSuperAdmin(session) {
	const email = session?.user?.email?.toLowerCase();
	const envList = (process.env.SUPER_ADMIN_EMAILS || "")
		.split(",")
		.map((v) => v.trim().toLowerCase())
		.filter(Boolean);

	if (envList.length === 0) {
		return true;
	}

	return Boolean(email && envList.includes(email));
}

function computeDiff(prev, next) {
	const changes = {};
	for (const key of Object.keys(next)) {
		if (prev?.[key] !== next[key]) {
			changes[key] = { from: prev?.[key] ?? null, to: next[key] };
		}
	}
	return changes;
}

export async function getAdminSettingsBundle() {
	const session = await requireAdmin();
	const canManageCritical = isSuperAdmin(session);

	const [settingsRow, recentAudit] = await Promise.all([
		prisma.platformSettings.findUnique({ where: { id: SETTINGS_ID } }),
		prisma.adminSettingsAuditLog.findMany({
			orderBy: { createdAt: "desc" },
			take: 12,
			include: {
				actor: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		}),
	]);

	if (!settingsRow) {
		await prisma.platformSettings.create({
			data: {
				id: SETTINGS_ID,
				data: DEFAULT_SETTINGS,
			},
		});
	}

	const safeSettings = normalizeSettings(settingsRow?.data || DEFAULT_SETTINGS);

	return {
		settings: safeSettings,
		audit: recentAudit,
		permissions: {
			canManageCritical,
			sensitiveKeys: SENSITIVE_SETTING_KEYS,
		},
	};
}

export async function saveAdminSettings(payload) {
	const session = await requireAdmin();
	const canManageCritical = isSuperAdmin(session);
	const parsed = settingsSchema.safeParse(payload);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message || "Parametres invalides" };
	}

	const nextSettings = parsed.data;

	const current = await prisma.platformSettings.findUnique({ where: { id: SETTINGS_ID } });
	const prevSettings = normalizeSettings(current?.data || DEFAULT_SETTINGS);
	const changes = computeDiff(prevSettings, nextSettings);

	if (!canManageCritical) {
		const forbiddenKeys = Object.keys(changes).filter((key) => SENSITIVE_SETTING_KEYS.includes(key));
		if (forbiddenKeys.length > 0) {
			return { error: `Parametres critiques reserves au super-admin: ${forbiddenKeys.join(", ")}` };
		}
	}

	await prisma.platformSettings.upsert({
		where: { id: SETTINGS_ID },
		update: { data: nextSettings },
		create: {
			id: SETTINGS_ID,
			data: nextSettings,
		},
	});

	if (Object.keys(changes).length > 0) {
		await prisma.adminSettingsAuditLog.create({
			data: {
				actorUserId: session.user.id,
				action: "update_settings",
				changes,
			},
		});
	}

	revalidatePath("/admin/settings");
	return { success: true, changedCount: Object.keys(changes).length };
}

export async function resetAdminSettings() {
	const session = await requireAdmin();
	if (!isSuperAdmin(session)) {
		return { error: "Action reservee au super-admin" };
	}

	const current = await prisma.platformSettings.findUnique({ where: { id: SETTINGS_ID } });
	const prevSettings = normalizeSettings(current?.data || DEFAULT_SETTINGS);

	await prisma.platformSettings.upsert({
		where: { id: SETTINGS_ID },
		update: { data: DEFAULT_SETTINGS },
		create: {
			id: SETTINGS_ID,
			data: DEFAULT_SETTINGS,
		},
	});

	const changes = computeDiff(prevSettings, DEFAULT_SETTINGS);

	await prisma.adminSettingsAuditLog.create({
		data: {
			actorUserId: session.user.id,
			action: "reset_settings",
			changes,
		},
	});

	revalidatePath("/admin/settings");
	return { success: true };
}

export async function exportAdminSettings() {
	await requireAdmin();
	const current = await prisma.platformSettings.findUnique({ where: { id: SETTINGS_ID } });
	const settings = normalizeSettings(current?.data || DEFAULT_SETTINGS);

	return {
		success: true,
		payload: {
			version: 1,
			exportedAt: new Date().toISOString(),
			settings,
		},
	};
}

export async function importAdminSettings(jsonText) {
	const session = await requireAdmin();
	if (!isSuperAdmin(session)) {
		return { error: "Action reservee au super-admin" };
	}

	let parsedJson;
	try {
		parsedJson = JSON.parse(jsonText);
	} catch {
		return { error: "JSON invalide" };
	}

	const candidate = parsedJson?.settings ?? parsedJson;
	const parsed = settingsSchema.safeParse(candidate);
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message || "Structure JSON invalide" };
	}

	const nextSettings = parsed.data;
	const current = await prisma.platformSettings.findUnique({ where: { id: SETTINGS_ID } });
	const prevSettings = normalizeSettings(current?.data || DEFAULT_SETTINGS);
	const changes = computeDiff(prevSettings, nextSettings);

	await prisma.platformSettings.upsert({
		where: { id: SETTINGS_ID },
		update: { data: nextSettings },
		create: {
			id: SETTINGS_ID,
			data: nextSettings,
		},
	});

	await prisma.adminSettingsAuditLog.create({
		data: {
			actorUserId: session.user.id,
			action: "import_settings",
			changes,
		},
	});

	revalidatePath("/admin/settings");
	return { success: true, changedCount: Object.keys(changes).length };
}

export async function getAdminSettingsAudit({ search = "", action = "all" } = {}) {
	await requireAdmin();

	const normalizedSearch = String(search || "").trim();
	const where = {
		...(action && action !== "all" ? { action } : {}),
		...(normalizedSearch
			? {
					OR: [
						{ action: { contains: normalizedSearch, mode: "insensitive" } },
						{ actor: { name: { contains: normalizedSearch, mode: "insensitive" } } },
						{ actor: { email: { contains: normalizedSearch, mode: "insensitive" } } },
					],
				}
			: {}),
	};

	const audit = await prisma.adminSettingsAuditLog.findMany({
		where,
		orderBy: { createdAt: "desc" },
		take: 30,
		include: {
			actor: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});

	return { success: true, audit };
}
