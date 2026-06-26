"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Circle, Video, Headphones, FileText, FileType, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons = { VIDEO: Video, AUDIO: Headphones, TEXT: FileText, PDF: FileType };

export function LessonSidebar({ course, completedSet }) {
	const params = useParams();
	const currentLessonId = params.lessonId;
	const completed = new Set(completedSet);

	return (
		<nav className="flex-1 p-3 space-y-4">
			{course.modules.map((mod, idx) => (
				<div
					key={mod.id}
					className="space-y-1"
				>
					<p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
						Module {idx + 1} : {mod.title}
					</p>
					<ul className="space-y-0.5">
						{mod.lessons.map((lesson) => {
							const Icon = typeIcons[lesson.type];
							const isActive = lesson.id === currentLessonId;
							const isDone = completed.has(lesson.id);
							return (
								<li key={lesson.id}>
									<Link
										href={`/learn/${course.id}/${lesson.id}`}
										className={cn(
											"flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
											isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
										)}
									>
										{isDone ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" /> : <Circle className="h-4 w-4 shrink-0" />}
										<Icon className="h-3.5 w-3.5 shrink-0" />
										<span className="line-clamp-2 flex-1">{lesson.title}</span>
									</Link>
								</li>
							);
						})}
						{mod.quiz && (
							<li>
								<Link
									href={`/learn/${course.id}/quiz/${mod.quiz.id}`}
									className={cn("flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors", "hover:bg-muted opacity-75")}
								>
									<ListChecks className="h-4 w-4 shrink-0" />
									<span className="line-clamp-2 flex-1">Test du module</span>
									<span className="text-xs text-muted-foreground">Bientôt</span>
								</Link>
							</li>
						)}
					</ul>
				</div>
			))}
		</nav>
	);
}
