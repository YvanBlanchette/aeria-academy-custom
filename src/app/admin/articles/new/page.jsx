import { prisma } from "@/lib/prisma";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata = { title: "Nouvel article — AERIA Admin" };

export default async function NewArticlePage() {
	const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

	return (
		<DashboardLayoutRight
			title="Nouvel article"
			subtitle="Crée une nouvelle ressource pour tes membres"
		>
			<div className="max-w-4xl">
				<ArticleForm allTags={tags} />
			</div>
		</DashboardLayoutRight>
	);
}
