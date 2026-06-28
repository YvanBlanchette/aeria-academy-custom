import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { BookOpen, Users, Headphones, Video, FileText, FileType, ListChecks, Lock, LucideChevronsDown, ChevronDownIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canAccessCourse, accessBlockedInfo } from "@/lib/access";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { enrollInCourse } from "./actions";
import Image from "next/image";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getLocaleFromCookie } from "@/lib/locale";

const typeIcons = { VIDEO: Video, AUDIO: Headphones, TEXT: FileText, PDF: FileType };

export default async function CourseDetailPage({ params }) {
	const { slug } = await params;
	const session = await auth();
	const cookieStore = await cookies();
	const locale = getLocaleFromCookie(cookieStore);

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

	const blockedInfo = !access.allowed ? accessBlockedInfo(access.reason, course, locale) : null;

	return (
		<div className="container max-w-7xl mx-auto px-4 py-12">
			<div className="grid gap-8 lg:grid-cols-2">
				{/* LEFT SIDE */}
				<div className="">
					<Card className="sticky top-24 pb-10 overflow-hidden">
						{course.thumbnail ? (
							<div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted -translate-y-4">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<Image
									width={1280}
									height={720}
									src={course.thumbnail}
									alt={course.title}
									className="h-full w-full object-cover"
								/>
							</div>
						) : (
							<div className="aspect-video w-full rounded-t-lg bg-linear-to-br from-primary/20 to-primary/5" />
						)}
						<CardContent className="space-y-4 px-6">
							<div>
								<h1 className="text-3xl font-bold">{course.title}</h1>
								<p className="mt-4 text-sm text-muted-foreground">{course.description}</p>
							</div>
							<div className="flex items-center gap-6 text-sm">
								<span className="flex items-center gap-2">
									<BookOpen className="h-4 w-4" />
									{course._count.modules} modules · {totalLessons} leçons
								</span>
								<span className="flex items-center gap-2">
									<Users className="h-4 w-4" />
									{course._count.enrollments} inscrits
								</span>
								{!isEnrolled && access.allowed && course.price > 0 && (
									<Badge variant={course.price === 0 ? "secondary" : "default"}>
										{course.price === 0 ? "Gratuit" : `${(course.price / 100).toFixed(2)} $`}
									</Badge>
								)}
							</div>
							<div></div>

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

				{/* RIGHT SIDE */}
				<div className="space-y-8">
					<div className="space-y-4">
						<h2 className="text-3xl font-bold">Programme du cours</h2>
						<div className="space-y-3">
							{course.modules.map((mod, idx) => (
								<Card key={mod.id}>
									<CardContent className="px-4">
										<Collapsible className="rounded-md">
											<CollapsibleTrigger
												asChild
												className="bg-white"
											>
												<Button
													variant="ghost"
													className="group w-full bg-white  flex justify-between items-center"
												>
													<p className="font-semibold">{mod.title}</p>
													<ChevronDownIcon className="group-data-[state=open]:rotate-180 h-2 w-2" />
												</Button>
											</CollapsibleTrigger>
											<CollapsibleContent className="flex flex-col items-start gap-2 px-2.5 text-sm bg-white">
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
											</CollapsibleContent>
										</Collapsible>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
