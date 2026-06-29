import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TagsManager } from "@/components/admin/tags-manager";

export const metadata = { title: "Tags — AERIA Admin" };

export default async function AdminTagsPage() {
	const tags = await prisma.tag.findMany({
		include: {
			_count: { select: { articles: true } },
		},
		orderBy: { name: "asc" },
	});

	return (
		<DashboardLayoutRight
			title="Tags"
			subtitle="Gestion des catégories d'articles"
		>
			<div className="mb-4">
				<Link
					href="/admin/articles"
					className="text-sm text-muted-foreground hover:underline"
				>
					← Retour aux articles
				</Link>
			</div>

			<div className="max-w-3xl">
				<TagsManager tags={tags} />
			</div>
		</DashboardLayoutRight>
	);
}
