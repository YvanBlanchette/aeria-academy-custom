"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CopyPlus, Eye, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { deleteArticleInline, duplicateArticleInline, togglePublishArticle } from "@/app/admin/articles/actions";

export function ArticleRowActions({ article }) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	async function handleToggle() {
		setLoading(true);
		const result = await togglePublishArticle(article.id);
		setLoading(false);
		if (result?.error) {
			toast.error(result.error);
			return;
		}

		toast.success(result.published ? "Article publié" : "Article dépublié");
		router.refresh();
	}

	async function handleDelete() {
		setLoading(true);
		const result = await deleteArticleInline(article.id);
		setLoading(false);
		if (result?.error) {
			toast.error(result.error);
			setOpen(false);
			return;
		}

		toast.success("Article supprimé");
		setOpen(false);
		router.refresh();
	}

	async function handleDuplicate() {
		setLoading(true);
		const result = await duplicateArticleInline(article.id);
		setLoading(false);
		if (result?.error) {
			toast.error(result.error);
			return;
		}

		toast.success("Article dupliqué");
		if (result?.articleId) {
			router.push(`/admin/articles/${result.articleId}`);
			return;
		}
		router.refresh();
	}

	return (
		<>
			<div className="flex items-center justify-center gap-2">
				<Link
					href={`/admin/articles/${article.id}`}
					className="rounded px-2 py-1 text-xs border hover:bg-muted"
				>
					Éditer
				</Link>
				{article.published ? (
					<a
						href={`/resources/${article.slug}`}
						target="_blank"
						rel="noopener noreferrer"
						className="rounded px-2 py-1 text-xs border hover:bg-muted"
					>
						<Eye className="mr-1 inline h-3.5 w-3.5" />
						Voir
					</a>
				) : null}
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleDuplicate}
					disabled={loading}
				>
					<CopyPlus className="mr-1 h-3.5 w-3.5" />
					Dupliquer
				</Button>
				<Button
					type="button"
					variant={article.published ? "outline" : "default"}
					size="sm"
					onClick={handleToggle}
					disabled={loading}
				>
					{article.published ? (
						<>
							<XCircle className="mr-1 h-3.5 w-3.5" />
							Dépublier
						</>
					) : (
						<>
							<CheckCircle2 className="mr-1 h-3.5 w-3.5" />
							Publier
						</>
					)}
				</Button>
				<Button
					type="button"
					variant="destructive"
					size="sm"
					onClick={() => setOpen(true)}
					disabled={loading}
				>
					<Trash2 className="mr-1 h-3.5 w-3.5" />
					Supprimer
				</Button>
			</div>

			<AlertDialog
				open={open}
				onOpenChange={setOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
						<AlertDialogDescription>&quot;{article.title}&quot; sera supprimé définitivement. Cette action est irréversible.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={loading}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{loading ? "Suppression..." : "Supprimer"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
