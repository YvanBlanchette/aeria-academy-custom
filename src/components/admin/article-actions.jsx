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
import { MdMoreVert } from "react-icons/md";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaEye, FaFileDownload, FaFileUpload } from "react-icons/fa";

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
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost">
							<MdMoreVert className="h-6 w-6" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuGroup>
							<DropdownMenuItem>
								{article.published && (
									<a
										href={`/resources/${article.slug}`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center"
									>
										<FaEye className="mr-1 h-4 w-4" />
										Voir la page
									</a>
								)}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={handleToggle}
								disabled={loading}
							>
								{article.published ? (
									<>
										<FaFileDownload className="mr-1 h-4 w-4" />
										Dépublier
									</>
								) : (
									<>
										<FaFileUpload className="mr-1 h-4 w-4" />
										Publier
									</>
								)}
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								variant="destructive"
								onClick={() => setOpen(true)}
							>
								<Trash2 className="mr-1 h-4 w-4" />
								Supprimer
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
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
