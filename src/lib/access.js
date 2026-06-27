import { prisma } from "@/lib/prisma";

/**
 * Niveaux de membership qui donnent accès à tous les cours.
 * Tu peux ajuster ici si tu changes les règles métier.
 */
const FULL_ACCESS_TIERS = ["ACADEMY", "PRIME"];

/**
 * Rôles qui donnent accès à tous les cours, peu importe membership.
 */
const PRIVILEGED_ROLES = ["ADMIN", "INSTRUCTOR"];

/**
 * Détermine si un user peut accéder à un cours.
 *
 * @param {object} user - L'utilisateur (depuis session.user OU null si déconnecté)
 * @param {object} course - Le cours (au moins { id, price })
 * @returns {Promise<{ allowed: boolean, reason: string }>}
 */
export async function canAccessCourse(user, course) {
	// 1. Cours gratuit = accessible à tous (même déconnectés)
	if (course.price === 0) {
		return { allowed: true, reason: "free_course" };
	}

	// 2. Pas connecté = pas d'accès
	if (!user) {
		return { allowed: false, reason: "not_authenticated" };
	}

	// 3. Admin ou instructeur = accès total
	if (PRIVILEGED_ROLES.includes(user.role)) {
		return { allowed: true, reason: "privileged_role" };
	}

	// 4. Membre Académie/Prime = accès à tout
	if (FULL_ACCESS_TIERS.includes(user.membership)) {
		return { allowed: true, reason: "membership" };
	}

	// 5. Inscription individuelle (achat one-shot du cours)
	const enrollment = await prisma.enrollment.findUnique({
		where: {
			userId_courseId: { userId: user.id, courseId: course.id },
		},
	});
	if (enrollment) {
		return { allowed: true, reason: "enrolled" };
	}

	return { allowed: false, reason: "no_access" };
}

/**
 * Variante sans appel DB : utilise les données déjà chargées.
 * Pratique pour les listes où on a déjà fetch les enrollments.
 */
export function canAccessCourseSync(user, course, userEnrollmentsCourseIds = []) {
	if (course.price === 0) return { allowed: true, reason: "free_course" };
	if (!user) return { allowed: false, reason: "not_authenticated" };
	if (PRIVILEGED_ROLES.includes(user.role)) return { allowed: true, reason: "privileged_role" };
	if (FULL_ACCESS_TIERS.includes(user.membership)) return { allowed: true, reason: "membership" };
	if (userEnrollmentsCourseIds.includes(course.id)) return { allowed: true, reason: "enrolled" };
	return { allowed: false, reason: "no_access" };
}

/**
 * Helper pour générer un message + CTA selon la raison de blocage.
 */
export function accessBlockedInfo(reason, course) {
	switch (reason) {
		case "not_authenticated":
			return {
				title: "Connexion requise",
				message: "Connecte-toi pour accéder à ce cours.",
				cta: { label: "Se connecter", href: `/login?callbackUrl=/courses/${course.slug}` },
			};
		case "no_access":
			return {
				title: "Abonnement requis",
				message: "Ce cours est réservé aux membres Académie ou Prime. Tu peux aussi l'acheter individuellement.",
				cta: { label: "Voir les abonnements", href: "/pricing" },
			};
		default:
			return {
				title: "Accès non autorisé",
				message: "Tu n'as pas accès à ce contenu.",
				cta: { label: "Retour au catalogue", href: "/courses" },
			};
	}
}
