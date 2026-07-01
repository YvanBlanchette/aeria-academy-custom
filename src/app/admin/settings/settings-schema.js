import { z } from "zod";

export const DEFAULT_SETTINGS = {
	academyName: "AERIA Voyages Academy",
	academyTagline: "Former des conseillers qui vendent mieux, plus vite.",
	academySupportEmail: "support@aeriavoyages.com",
	academyPublicDomain: "academy.aeriavoyages.com",
	academyTimezone: "America/Toronto",
	defaultLocale: "fr",
	allowRegistration: true,
	requireEmailVerification: false,
	allowFreePreview: true,
	allowPublicProfiles: true,
	enableCommunity: true,
	maxDevicesPerUser: "2",
	passwordPolicy: "medium",
	lessonAutoCompleteSeconds: "45",
	enableAudioCapsules: true,
	enableLessonDownload: false,
	enableQuizRetakes: true,
	quizRetakeLimit: "3",
	enableCertificates: true,
	enableContentProtection: true,
	moderateAgencies: true,
	enableArticlePublishingWorkflow: true,
	emailProvider: "resend",
	emailFromName: "AERIA Academy",
	emailFromAddress: "noreply@aeriavoyages.com",
	enableWeeklyDigest: true,
	enablePaymentGateway: true,
	paymentProvider: "stripe",
	defaultPlan: "ACADEMY",
	currency: "CAD",
	vatNotice: "Taxes applicables selon la province.",
	seoTitle: "AERIA Voyages Academy | Formation des conseillers voyages",
	seoDescription: "Academie de formation continue pour conseillers en voyages: modules, capsules audio, certifications et ressources terrain.",
	seoKeywords: "formation voyage, conseiller voyage, agence, academie, croisiere",
	maintenanceMode: false,
	maintenanceMessage: "Maintenance en cours. Merci de revenir dans quelques minutes.",
	debugLogsRetentionDays: "30",
	enableSystemAlerts: true,
};

export const settingsSchema = z.object({
	academyName: z.string().min(2).max(120),
	academyTagline: z.string().min(2).max(200),
	academySupportEmail: z.string().email(),
	academyPublicDomain: z.string().min(3).max(200),
	academyTimezone: z.string().min(3).max(64),
	defaultLocale: z.enum(["fr", "en"]),
	allowRegistration: z.boolean(),
	requireEmailVerification: z.boolean(),
	allowFreePreview: z.boolean(),
	allowPublicProfiles: z.boolean(),
	enableCommunity: z.boolean(),
	maxDevicesPerUser: z.string().regex(/^\d+$/),
	passwordPolicy: z.enum(["low", "medium", "high"]),
	lessonAutoCompleteSeconds: z.string().regex(/^\d+$/),
	enableAudioCapsules: z.boolean(),
	enableLessonDownload: z.boolean(),
	enableQuizRetakes: z.boolean(),
	quizRetakeLimit: z.string().regex(/^\d+$/),
	enableCertificates: z.boolean(),
	enableContentProtection: z.boolean(),
	moderateAgencies: z.boolean(),
	enableArticlePublishingWorkflow: z.boolean(),
	emailProvider: z.enum(["resend", "smtp", "mailgun"]),
	emailFromName: z.string().min(2).max(120),
	emailFromAddress: z.string().email(),
	enableWeeklyDigest: z.boolean(),
	enablePaymentGateway: z.boolean(),
	paymentProvider: z.enum(["stripe", "manual"]),
	defaultPlan: z.enum(["FREE", "ACADEMY", "PRIME"]),
	currency: z.enum(["CAD", "USD", "EUR"]),
	vatNotice: z.string().max(240),
	seoTitle: z.string().min(10).max(160),
	seoDescription: z.string().min(30).max(320),
	seoKeywords: z.string().min(5).max(400),
	maintenanceMode: z.boolean(),
	maintenanceMessage: z.string().min(5).max(300),
	debugLogsRetentionDays: z.string().regex(/^\d+$/),
	enableSystemAlerts: z.boolean(),
});

export function normalizeSettings(input) {
	const merged = {
		...DEFAULT_SETTINGS,
		...(input || {}),
	};

	const parsed = settingsSchema.safeParse(merged);
	if (!parsed.success) {
		return DEFAULT_SETTINGS;
	}

	return parsed.data;
}
