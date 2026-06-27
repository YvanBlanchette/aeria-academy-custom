import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("🌱 Seeding...");

	// Admin par défaut
	const adminPassword = await bcrypt.hash("admin1234", 10);
	const admin = await prisma.user.upsert({
		where: { email: "admin@aeriavoyages.com" },
		update: {},
		create: {
			email: "admin@aeriavoyages.com",
			name: "Admin AERIA",
			password: adminPassword,
			role: "ADMIN",
		},
	});
	console.log("✅ Admin créé : admin@aeriavoyages.com / admin1234");

	// Étudiant test
	const studentPassword = await bcrypt.hash("student1234", 10);
	await prisma.user.upsert({
		where: { email: "etudiant-test@aeriavoyages.com" },
		update: {},
		create: {
			email: "etudiant-test@aeriavoyages.com",
			name: "Étudiant Test",
			password: studentPassword,
			role: "STUDENT",
		},
	});
	console.log("✅ Étudiant créé : etudiant-test@aeriavoyages.com / student1234");

	// Nettoyer l'ancien cours s'il existe
	await prisma.course.deleteMany({ where: { slug: "introduction-aeria" } });

	// Cours d'exemple
	const course = await prisma.course.create({
		data: {
			slug: "introduction-aeria",
			title: "Introduction à AERIA",
			description: "Découvre les fondamentaux de la méthode AERIA à travers ce cours complet avec vidéos, capsules audio et tests de validation.",
			thumbnail: "https://placehold.co/600x400/png?text=AERIA",
			price: 4900, // 49.00 $
			published: true,
			modules: {
				create: [
					{
						order: 1,
						title: "Module 1 : Les fondamentaux",
						lessons: {
							create: [
								{
									order: 1,
									title: "Bienvenue dans AERIA",
									type: "VIDEO",
									content: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
									duration: 300,
								},
								{
									order: 2,
									title: "Capsule audio : Introduction",
									type: "AUDIO",
									content: "/uploads/audio/intro-aeria.mp3",
									duration: 180,
								},
								{
									order: 3,
									title: "Document : Vue d'ensemble",
									type: "TEXT",
									content: "# Bienvenue\n\nDans ce module, tu vas découvrir les bases de la méthode AERIA...",
								},
							],
						},
						quiz: {
							create: {
								title: "Test du Module 1",
								passingScore: 70,
								questions: {
									create: [
										{
											order: 1,
											text: "Que signifie AERIA ?",
											options: {
												create: [
													{ text: "Une méthode d'apprentissage", isCorrect: true },
													{ text: "Une plateforme de streaming", isCorrect: false },
													{ text: "Un logiciel comptable", isCorrect: false },
												],
											},
										},
										{
											order: 2,
											text: "Combien de leçons composent ce module ?",
											options: {
												create: [
													{ text: "2", isCorrect: false },
													{ text: "3", isCorrect: true },
													{ text: "5", isCorrect: false },
												],
											},
										},
									],
								},
							},
						},
					},
					{
						order: 2,
						title: "Module 2 : Mise en pratique",
						lessons: {
							create: [
								{
									order: 1,
									title: "Application concrète",
									type: "VIDEO",
									content: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
									duration: 600,
								},
								{
									order: 2,
									title: "Capsule audio : Exercices guidés",
									type: "AUDIO",
									content: "/uploads/audio/exercices.mp3",
									duration: 420,
								},
							],
						},
						quiz: {
							create: {
								title: "Test du Module 2",
								passingScore: 70,
								questions: {
									create: [
										{
											order: 1,
											text: "Quelle est la première étape de la mise en pratique ?",
											options: {
												create: [
													{ text: "L'analyse", isCorrect: true },
													{ text: "La conclusion", isCorrect: false },
													{ text: "L'évaluation", isCorrect: false },
												],
											},
										},
									],
								},
							},
						},
					},
				],
			},
		},
	});

	console.log(`✅ Cours créé : ${course.title}`);
	console.log("🌱 Seed terminé !");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
