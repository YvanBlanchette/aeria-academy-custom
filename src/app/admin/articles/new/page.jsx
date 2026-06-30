import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { ArticleForm } from "@/components/admin/article-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Nouvel article — AERIA Admin" };

export default async function NewArticlePage() {
	const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-neutral-100">
			<div className="mb-2">
				<Link
					href="/admin/articles"
					className="text-sm text-muted-foreground bg-white hover:translate-x-1 transition-transform active:bg-neutral-200 active:shadow-inner px-4 py-1.5 rounded-full font-medium shadow-sm flex items-center justify-center gap-2 w-fit"
				>
					<ArrowLeft className="h-4 w-4" />
					Retour aux articles
				</Link>
			</div>

			<h2 className="text-3xl font-bold text-center">Création d&apos;un nouvel article</h2>

			<Card className="border-dashed">
				<CardContent className="p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
					<div className="flex items-start gap-2 text-sm text-muted-foreground">
						<Lightbulb className="h-4 w-4 mt-0.5 text-primary" />
						<p>Conseil: commence par un titre + résumé, ajoute la structure du contenu, puis termine par les médias et tags.</p>
					</div>
					<p className="text-xs text-muted-foreground">Le statut est brouillon par défaut jusqu&apos;à publication.</p>
				</CardContent>
			</Card>

			<div className="max-w-7xl">
				<ArticleForm allTags={tags} />
			</div>
		</div>
	);
}
