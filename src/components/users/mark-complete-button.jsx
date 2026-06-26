"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markLessonComplete } from "@/app/learn/[courseId]/actions";

export function MarkCompleteButton({ courseId, lessonId, isCompleted, nextLessonId }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleClick() {
		setLoading(true);
		const result = await markLessonComplete(courseId, lessonId);
		if (result?.error) {
			toast.error(result.error);
			setLoading(false);
			return;
		}
		toast.success("Leçon terminée !");
		setLoading(false);

		// Auto-passage à la leçon suivante
		if (nextLessonId) {
			router.push(`/learn/${courseId}/${nextLessonId}`);
		} else {
			router.refresh();
		}
	}

	if (isCompleted) {
		return (
			<Button
				variant="secondary"
				disabled
			>
				<CheckCircle2 className="mr-1 h-4 w-4" /> Terminée
			</Button>
		);
	}

	return (
		<Button
			onClick={handleClick}
			disabled={loading}
		>
			{loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
			{nextLessonId ? "Terminer et continuer" : "Terminer la leçon"}
		</Button>
	);
}
