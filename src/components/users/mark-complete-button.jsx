"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markLessonComplete } from "@/app/learn/[courseId]/actions";

export function MarkCompleteButton({ courseId, lessonId, isCompleted, nextLessonId }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [completed, setCompleted] = useState(isCompleted);

	useEffect(() => {
		setCompleted(isCompleted);
	}, [isCompleted]);

	async function handleClick() {
		setLoading(true);
		const result = await markLessonComplete(courseId, lessonId);
		if (result?.error) {
			toast.error(result.error);
			setLoading(false);
			return;
		}

		setCompleted(Boolean(result?.completed));
		toast.success(result?.completed ? "Leçon terminée !" : "Leçon marquée comme non terminée.");
		setLoading(false);

		// Auto-passage à la leçon suivante seulement lors de la validation
		if (result?.completed && nextLessonId) {
			router.push(`/learn/${courseId}/${nextLessonId}`);
		} else {
			router.refresh();
		}
	}

	return (
		<Button
			variant={completed ? "secondary" : "default"}
			onClick={handleClick}
			disabled={loading}
			className="shadow-sm bg-white text-neutral-900 hover:bg-neutral-50 active:shadow-inner active:bg-neutral-200"
		>
			{loading ? (
				<Loader2 className="mr-1 h-4 w-4 animate-spin" />
			) : completed ? (
				<RotateCcw className="mr-1 h-4 w-4" />
			) : (
				<CheckCircle2 className="mr-1 h-4 w-4" />
			)}
			{completed ? "Annuler la completion" : nextLessonId ? "Terminer et continuer" : "Terminer la leçon"}
		</Button>
	);
}
