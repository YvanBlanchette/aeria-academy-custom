"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, Trash2, CheckCircle2, XCircle } from "lucide-react";
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
import { togglePublishArticle, deleteArticle } from "@/app/admin/articles/actions";

export function ArticleActions({ article }) {
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
		const result = await deleteArticle(article.id);
		setLoading(false);
		if (result?.error) {
			toast.error(result.error);
			setOpen(false);
		}
	}

	return (
		<>
			<div className="flex gap-2 flex-wrap">
				{article.published && (
					<Button
						asChild
						variant="outline"
					>
						<a
							href={`/resources/${article.slug}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Eye className="mr-1 h-4 w-4" />
							Voir la page
						</a>
					</Button>
				)}

				<Button
					type="button"
					variant={article.published ? "outline" : "default"}
					onClick={handleToggle}
					disabled={loading}
				>
					{article.published ? (
						<>
							<XCircle className="mr-1 h-4 w-4" />
							Dépublier
						</>
					) : (
						<>
							<CheckCircle2 className="mr-1 h-4 w-4" />
							Publier
						</>
					)}
				</Button>

				<Button
					variant="destructive"
					onClick={() => setOpen(true)}
				>
					<Trash2 className="mr-1 h-4 w-4" />
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
