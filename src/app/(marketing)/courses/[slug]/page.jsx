import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, Users, Headphones, Video, FileText, FileType, ListChecks, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canAccessCourse, accessBlockedInfo } from "@/lib/access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { enrollInCourse } from "./actions";

const typeIcons = { VIDEO: Video, AUDIO: Headphones, TEXT: FileText, PDF: FileType };

export default async function CourseDetailPage({ params }) {
	const { slug } = await params;
	const session = await auth();

	const course = await prisma.course.findUnique({
		where: { slug },
		include: {
			modules: {
				orderBy: { order: "asc" },
				include: {
					lessons: { orderBy: { order: "asc" } },
					quiz: { select: { id: true } },
				},
			},
			_count: { select: { enrollments: true, modules: true } },
		},
	});

	if (!course || !course.published) notFound();

	const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);

	// Check d'accès et d'inscription
	const access = await canAccessCourse(session?.user, course);
	let isEnrolled = false;
	if (session) {
		const enrollment = await prisma.enrollment.findUnique({
			where: {
				userId_courseId: { userId: session.user.id, courseId: course.id },
			},
		});
		isEnrolled = !!enrollment;
	}

	const blockedInfo = !access.allowed ? accessBlockedInfo(access.reason, course) : null;

	return (
		<div className="container mx-auto px-4 pt-32 pb-12">
			<div className="grid gap-8 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-8">
					<div>
						<h1 className="text-4xl font-bold">{course.title}</h1>
						<p className="mt-4 text-lg text-muted-foreground">{course.description}</p>
					</div>

					<div className="flex gap-6 text-sm">
						<span className="flex items-center gap-2">
							<BookOpen className="h-4 w-4" />
							{course._count.modules} modules · {totalLessons} leçons
						</span>
						<span className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							{course._count.enrollments} inscrits
						</span>
					</div>

					<div className="space-y-4">
						<h2 className="text-2xl font-bold">Programme du cours</h2>
						<div className="space-y-3">
							{course.modules.map((mod, idx) => (
								<Card key={mod.id}>
									<CardContent className="p-4">
										<p className="font-semibold">
											Module {idx + 1} : {mod.title}
										</p>
										<ul className="mt-2 space-y-1 text-sm">
											{mod.lessons.map((lesson) => {
												const Icon = typeIcons[lesson.type];
												return (
													<li
														key={lesson.id}
														className="flex items-center gap-2 text-muted-foreground"
													>
														<Icon className="h-3.5 w-3.5" />
														{lesson.title}
													</li>
												);
											})}
											{mod.quiz && (
												<li className="flex items-center gap-2 text-muted-foreground">
													<ListChecks className="h-3.5 w-3.5" />
													Test de validation
												</li>
											)}
										</ul>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</div>

				<div className="lg:col-span-1">
					<Card className="sticky top-24">
						{course.thumbnail ? (
							<div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={course.thumbnail}
									alt={course.title}
									className="h-full w-full object-cover"
								/>
							</div>
						) : (
							<div className="aspect-video w-full rounded-t-lg bg-gradient-to-br from-primary/20 to-primary/5" />
						)}
						<CardContent className="space-y-4 p-6">
							<div>
								<Badge
									variant={course.price === 0 ? "secondary" : "default"}
									className="mb-2"
								>
									{course.price === 0 ? "Gratuit" : `${(course.price / 100).toFixed(2)} €`}
								</Badge>
							</div>

							{isEnrolled ? (
								<Button
									asChild
									className="w-full"
									size="lg"
								>
									<Link href={`/learn/${course.id}`}>Continuer le cours</Link>
								</Button>
							) : access.allowed ? (
								<form
									action={async () => {
										"use server";
										await enrollInCourse(course.slug);
									}}
								>
									<Button
										type="submit"
										className="w-full"
										size="lg"
									>
										{course.price === 0 ? "Commencer gratuitement" : "Accéder au cours"}
									</Button>
								</form>
							) : (
								<div className="space-y-3">
									<div className="rounded-md bg-muted p-3 text-sm">
										<div className="flex items-start gap-2">
											<Lock className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
											<div>
												<p className="font-medium">{blockedInfo.title}</p>
												<p className="text-xs text-muted-foreground mt-1">{blockedInfo.message}</p>
											</div>
										</div>
									</div>
									<Button
										asChild
										className="w-full"
										size="lg"
									>
										<Link href={blockedInfo.cta.href}>{blockedInfo.cta.label}</Link>
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
