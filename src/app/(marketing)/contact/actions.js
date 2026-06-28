"use server";

import { headers } from "next/headers";

import { sendContactNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(value) {
	return String(value ?? "").trim();
}

export async function submitContactForm(prevState, formData) {
	const fullName = sanitize(formData.get("fullName"));
	const email = sanitize(formData.get("email"));
	const subject = sanitize(formData.get("subject"));
	const message = sanitize(formData.get("message"));
	const website = sanitize(formData.get("website"));
	const locale = sanitize(formData.get("locale")) || "fr";
	const consent = sanitize(formData.get("consent"));

	const isFrench = locale === "fr";
	const fieldErrors = {};

	if (website) {
		return {
			status: "success",
			message: isFrench ? "Merci, votre message a bien ete envoye." : "Thanks, your message was sent successfully.",
			fieldErrors: {},
		};
	}

	if (fullName.length < 2) fieldErrors.fullName = isFrench ? "Entrez votre nom complet." : "Please enter your full name.";
	if (!EMAIL_RE.test(email)) fieldErrors.email = isFrench ? "Entrez une adresse courriel valide." : "Please enter a valid email address.";
	if (subject.length < 3) fieldErrors.subject = isFrench ? "Entrez un sujet valide." : "Please provide a valid subject.";
	if (message.length < 10) fieldErrors.message = isFrench ? "Votre message est trop court." : "Your message is too short.";
	if (consent !== "yes") fieldErrors.consent = isFrench ? "Le consentement est obligatoire." : "Consent is required.";

	if (Object.keys(fieldErrors).length > 0) {
		return {
			status: "error",
			message: isFrench ? "Corrigez les champs en erreur." : "Please correct the highlighted fields.",
			fieldErrors,
		};
	}

	const requestHeaders = await headers();
	const ipAddress = sanitize(requestHeaders.get("x-forwarded-for")?.split(",")?.[0] || requestHeaders.get("x-real-ip"));
	const userAgent = sanitize(requestHeaders.get("user-agent"));

	await prisma.contactMessage.create({
		data: {
			fullName,
			email,
			subject,
			message,
			locale,
			consentGiven: true,
			ipAddress: ipAddress || null,
			userAgent: userAgent || null,
		},
	});

	await sendContactNotification({
		fullName,
		email,
		subject,
		message,
		locale,
		consentGiven: true,
		ipAddress,
		userAgent,
	});

	return {
		status: "success",
		message: isFrench ? "Merci, votre message a bien ete envoye." : "Thanks, your message was sent successfully.",
		fieldErrors: {},
	};
}
