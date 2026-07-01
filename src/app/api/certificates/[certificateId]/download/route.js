import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function GET(_request, { params }) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
	}

	const { certificateId } = await params;
	if (!certificateId) {
		return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
	}

	const certificate = await prisma.certificate.findUnique({
		where: { id: certificateId },
		include: {
			user: {
				select: {
					name: true,
					email: true,
				},
			},
			course: {
				select: {
					title: true,
				},
			},
		},
	});

	if (!certificate || certificate.userId !== session.user.id) {
		return NextResponse.json({ error: "Certificat introuvable" }, { status: 404 });
	}

	const learnerName = certificate.user.name || certificate.user.email || "Membre";
	const courseTitle = certificate.course.title;
	const issueDate = new Date(certificate.issuedAt).toLocaleDateString("fr-CA", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const pdf = await PDFDocument.create();
	const page = pdf.addPage([842, 595]);
	const width = page.getWidth();
	const height = page.getHeight();
	const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
	const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

	page.drawRectangle({
		x: 20,
		y: 20,
		width: width - 40,
		height: height - 40,
		borderColor: rgb(0.13, 0.16, 0.2),
		borderWidth: 2,
	});

	page.drawText("CERTIFICAT DE REUSSITE", {
		x: 190,
		y: height - 110,
		size: 32,
		font: titleFont,
		color: rgb(0.13, 0.16, 0.2),
	});

	page.drawText("AERIA Voyages Academy certifie que", {
		x: 265,
		y: height - 170,
		size: 14,
		font: bodyFont,
		color: rgb(0.33, 0.37, 0.43),
	});

	page.drawText(learnerName, {
		x: 120,
		y: height - 235,
		size: 42,
		font: titleFont,
		color: rgb(0.08, 0.1, 0.14),
	});

	page.drawText("a complete avec succes le parcours", {
		x: 255,
		y: height - 285,
		size: 15,
		font: bodyFont,
		color: rgb(0.33, 0.37, 0.43),
	});

	page.drawText(courseTitle, {
		x: 120,
		y: height - 345,
		size: 28,
		font: titleFont,
		color: rgb(0.11, 0.2, 0.37),
	});

	page.drawLine({
		start: { x: 120, y: 150 },
		end: { x: 360, y: 150 },
		thickness: 1,
		color: rgb(0.25, 0.3, 0.36),
	});
	page.drawText("Date de delivrance", {
		x: 120,
		y: 130,
		size: 11,
		font: bodyFont,
		color: rgb(0.33, 0.37, 0.43),
	});
	page.drawText(issueDate, {
		x: 120,
		y: 110,
		size: 14,
		font: bodyFont,
		color: rgb(0.12, 0.14, 0.18),
	});

	page.drawLine({
		start: { x: 500, y: 150 },
		end: { x: 740, y: 150 },
		thickness: 1,
		color: rgb(0.25, 0.3, 0.36),
	});
	page.drawText("Direction pedagogique", {
		x: 500,
		y: 130,
		size: 11,
		font: bodyFont,
		color: rgb(0.33, 0.37, 0.43),
	});
	page.drawText("AERIA Voyages Academy", {
		x: 500,
		y: 110,
		size: 14,
		font: bodyFont,
		color: rgb(0.12, 0.14, 0.18),
	});

	const pdfBytes = await pdf.save();
	const fileTitle = slugify(courseTitle || "certificat");
	const disposition = `attachment; filename="certificat-${fileTitle}.pdf"`;

	return new NextResponse(Buffer.from(pdfBytes), {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": disposition,
			"Cache-Control": "private, no-store",
		},
	});
}
