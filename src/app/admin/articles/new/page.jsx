import { prisma } from "@/lib/prisma";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata = { title: "Nouvel article — AERIA Admin" };

export default async function NewArticlePage() {
	const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-neutral-100">
			<h2 className="text-3xl font-bold text-center">Création d&apos;un nouvel article</h2>
			<div className="max-w-7xl">
				<ArticleForm allTags={tags} />
			</div>
		</div>
	);
}
