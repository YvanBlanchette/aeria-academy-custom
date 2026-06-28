import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LessonForm } from "@/components/admin/lesson-form";
import { Card } from "@/components/ui/card";
import { auth } from "@/auth";

export default async function NewLessonPage({ params }) {
	const session = await auth();
	const { id: courseId, moduleId } = await params;

	const mod = await prisma.module.findUnique({
		where: { id: moduleId },
		select: { id: true, title: true, courseId: true },
	});
	if (!mod || mod.courseId !== courseId) notFound();

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-neutral-100">
			<Card className="w-full p-6">
				<LessonForm
					courseId={courseId}
					moduleId={moduleId}
				/>
			</Card>
		</div>
	);
}
