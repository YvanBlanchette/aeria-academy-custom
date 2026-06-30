import Link from "next/link";
import { BookOpen, Users, Crown, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { dict } from "@/lib/i18n";
import { markdownToExcerpt } from "@/lib/markdown-excerpt";

export function CourseCard({
	course,
	href,
	userHasAccess = false,
	userIsEnrolled = false,
	children,
	footer,
	showDefaultFooter = true,
	className = "",
	contentClassName = "",
	titleClassName = "",
	descriptionClassName = "",
	thumbnailClassName = "",
	imageClassName = "",
	locale = "fr",
}) {
	const courseHref = href ?? `/courses/${course.slug ?? course.id}`;
	const moduleCount = course._count?.modules ?? 0;
	const enrollmentCount = course._count?.enrollments ?? 0;
	const t = dict[locale]?.articles ?? dict.fr?.articles;

	return (
		<Link
			href={courseHref}
			className="block h-full"
		>
			<Card className={`flex h-full min-w-0 flex-col justify-between overflow-hidden transition-shadow hover:shadow-lg ${className}`}>
				{course.thumbnail ? (
					<div className={`aspect-video w-full overflow-hidden bg-muted -translate-y-4 ${thumbnailClassName}`}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={course.thumbnail}
							alt={course.title}
							className={`h-full w-full object-cover ${imageClassName}`}
						/>
					</div>
				) : (
					<div className={`aspect-video w-full bg-linear-to-br from-primary/20 to-primary/5 -translate-y-4 ${thumbnailClassName}`} />
				)}

				<CardContent className={`mb-auto space-y-2 ${contentClassName}`}>
					<CardTitle className={`line-clamp-2 ${titleClassName}`}>{course.title}</CardTitle>
					{course.description ? (
						<p className={`line-clamp-3 text-sm text-muted-foreground ${descriptionClassName}`}>{markdownToExcerpt(course.description, 180)}</p>
					) : null}
					{children ? <div className="space-y-3">{children}</div> : null}
				</CardContent>

				{footer ? (
					<CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">{footer}</CardFooter>
				) : showDefaultFooter ? (
					<CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
							<span className="flex items-center gap-1">
								<BookOpen className="h-3 w-3" />
								{moduleCount} {locale === "en" ? "modules" : "modules"}
							</span>
							<span className="flex items-center gap-1">
								<Users className="h-3 w-3" />
								{enrollmentCount} {locale === "en" ? "students" : "inscrits"}
							</span>
						</div>
						{userIsEnrolled ? (
							<Badge variant="secondary">{locale === "en" ? "Enrolled" : "Inscrit"}</Badge>
						) : userHasAccess ? (
							<Badge
								variant="default"
								className="gap-1"
							>
								<Crown className="h-3 w-3" /> {locale === "en" ? "Included access" : "Accès inclus"}
							</Badge>
						) : course.price === 0 ? (
							<Badge variant="secondary">{locale === "en" ? "Free" : "Gratuit"}</Badge>
						) : (
							<Badge
								variant="default"
								className="gap-1"
							>
								<Lock className="h-3 w-3" /> {(course.price / 100).toFixed(2)} $
							</Badge>
						)}
					</CardFooter>
				) : null}
			</Card>
		</Link>
	);
}
