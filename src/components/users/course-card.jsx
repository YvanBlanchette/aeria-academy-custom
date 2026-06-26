import Link from "next/link";
import { BookOpen, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CourseCard({ course }) {
	return (
		<Link href={`/courses/${course.slug}`}>
			<Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
				{course.thumbnail ? (
					<div className="aspect-video w-full overflow-hidden bg-muted">
						<img
							src={course.thumbnail}
							alt={course.title}
							className="h-full w-full object-cover"
						/>
					</div>
				) : (
					<div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/5" />
				)}
				<CardHeader>
					<CardTitle className="line-clamp-2">{course.title}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="line-clamp-3 text-sm text-muted-foreground">{course.description}</p>
				</CardContent>
				<CardFooter className="flex items-center justify-between">
					<div className="flex gap-3 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<BookOpen className="h-3 w-3" />
							{course._count.modules} modules
						</span>
						<span className="flex items-center gap-1">
							<Users className="h-3 w-3" />
							{course._count.enrollments}
						</span>
					</div>
					<Badge variant={course.price === 0 ? "secondary" : "default"}>{course.price === 0 ? "Gratuit" : `${(course.price / 100).toFixed(2)} €`}</Badge>
				</CardFooter>
			</Card>
		</Link>
	);
}
