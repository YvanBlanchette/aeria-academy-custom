"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, Trash2, Video, Headphones, FileText, FileType } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteLesson, moveLesson } from "@/app/admin/courses/[id]/modules/[moduleId]/actions";

const typeIcons = { VIDEO: Video, AUDIO: Headphones, TEXT: FileText, PDF: FileType };
const typeLabels = { VIDEO: "Vidéo", AUDIO: "Audio", TEXT: "Texte", PDF: "PDF" };

export function LessonRow({ lesson, courseId, moduleId, isFirst, isLast }) {
	const [deleting, setDeleting] = useState(false);
	const Icon = typeIcons[lesson.type];

	async function handleMove(direction) {
		const result = await moveLesson(lesson.id, direction);
		if (result?.error) toast.error(result.error);
	}

	async function handleDelete() {
		const result = await deleteLesson(courseId, moduleId, lesson.id);
		if (result?.error) toast.error(result.error);
		else toast.success("Leçon supprimée");
		setDeleting(false);
	}

	return (
		<li className="flex items-center gap-2 rounded-md border p-3">
			<div className="flex flex-col">
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6"
					disabled={isFirst}
					onClick={() => handleMove("up")}
				>
					<ChevronUp className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6"
					disabled={isLast}
					onClick={() => handleMove("down")}
				>
					<ChevronDown className="h-4 w-4" />
				</Button>
			</div>

			<Icon className="h-5 w-5 text-muted-foreground" />

			<div className="flex-1">
				<Link
					href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}
					className="font-medium hover:underline"
				>
					{lesson.title}
				</Link>
				<div className="flex gap-2 mt-1">
					<Badge
						variant="outline"
						className="text-xs"
					>
						{typeLabels[lesson.type]}
					</Badge>
					{lesson.duration && <span className="text-xs text-muted-foreground">{Math.floor(lesson.duration / 60)} min</span>}
				</div>
			</div>

			<Button
				variant="ghost"
				size="icon"
				className="text-destructive hover:text-destructive"
				onClick={() => setDeleting(true)}
			>
				<Trash2 className="h-4 w-4" />
			</Button>

			<AlertDialog
				open={deleting}
				onOpenChange={setDeleting}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Supprimer cette leçon ?</AlertDialogTitle>
						<AlertDialogDescription>&quot;{lesson.title}&quot; sera supprimée.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Supprimer
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</li>
	);
}
