import nodemailer from "nodemailer";

function isMailConfigured() {
	return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_FROM && process.env.CONTACT_TO_EMAIL);
}

function buildTransporter() {
	const port = Number(process.env.SMTP_PORT || 587);
	const secure = port === 465;

	const auth = process.env.SMTP_USER
		? {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			}
		: undefined;

	return nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port,
		secure,
		auth,
	});
}

export async function sendContactNotification({ fullName, email, subject, message, locale, consentGiven, ipAddress, userAgent }) {
	if (!isMailConfigured()) {
		console.warn("[contact] SMTP not configured, skipping email notification");
		return { sent: false, reason: "smtp_not_configured" };
	}

	const transporter = buildTransporter();

	const text = [
		"New contact form submission",
		"",
		`Name: ${fullName}`,
		`Email: ${email}`,
		`Subject: ${subject}`,
		`Locale: ${locale}`,
		`Consent: ${consentGiven ? "yes" : "no"}`,
		`IP: ${ipAddress || "unknown"}`,
		`User-Agent: ${userAgent || "unknown"}`,
		"",
		"Message:",
		message,
	].join("\n");

	await transporter.sendMail({
		from: process.env.SMTP_FROM,
		to: process.env.CONTACT_TO_EMAIL,
		replyTo: email,
		subject: `[Contact] ${subject}`,
		text,
	});

	return { sent: true };
}
