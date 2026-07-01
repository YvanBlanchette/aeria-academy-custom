"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { FaEdit, FaEye, FaFileDownload, FaFileUpload, FaRegCopy, FaTrash } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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
				{/* --- EDIT BUTTON --- */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Link
							href={`/admin/articles/${article.id}`}
							className="rounded px-2 py-1 group"
						>
							<FaEdit className="mr-1 inline h-5 w-5 group-hover:text-neutral-900 text-neutral-500 transition-all" />
						</Link>
					</TooltipTrigger>
					<TooltipContent side={"bottom"}>
						<p>Éditer l&apos;article</p>
					</TooltipContent>
				</Tooltip>

				{/* --- VIEW BUTTON --- */}
				{article.published ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<a
								href={`/resources/${article.slug}`}
								target="_blank"
								rel="noopener noreferrer"
								className="rounded px-2 py-1 group"
							>
								<FaEye className="mr-1 inline h-5 w-5 group-hover:text-neutral-900 text-neutral-500 transition-all" />
							</a>
						</TooltipTrigger>
						<TooltipContent side={"bottom"}>
							<p>Voir l&apos;article</p>
						</TooltipContent>
					</Tooltip>
				) : null}

				{/* --- DUPLICATE BUTTON --- */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							onClick={handleDuplicate}
							disabled={loading}
							className="group"
						>
							<FaRegCopy className="mr-1 inline h-6 w-6 group-hover:text-neutral-900 text-neutral-500 transition-all" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side={"bottom"}>
						<p>Dupliquer l&apos;article</p>
					</TooltipContent>
				</Tooltip>

				{/* --- PUBLISH/UNPUBLISH BUTTON --- */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							onClick={handleToggle}
							disabled={loading}
							className="group"
						>
							{article.published ? (
								<>
									<FaFileDownload className="mr-1 inline h-8 w-8 group-hover:text-neutral-900 text-neutral-500 transition-all" />
								</>
							) : (
								<>
									<FaFileUpload className="mr-1 inline h-8 w-8 group-hover:text-neutral-900 text-neutral-500 transition-all" />
								</>
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent side={"bottom"}>
						<p>{article.published ? "Dépublier" : "Publier"} l&apos;article</p>
					</TooltipContent>
				</Tooltip>

				{/* --- DELETE BUTTON --- */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							onClick={() => setOpen(true)}
							disabled={loading}
							className="group"
						>
							<FaTrash className="mr-1 inline h-5 w-5 group-hover:text-red-600 text-neutral-500 transition-all" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side={"bottom"}>
						<p>Supprimer l&apos;article</p>
					</TooltipContent>
				</Tooltip>
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
