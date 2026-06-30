"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";
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
import { deleteUserInline } from "@/app/admin/users/actions";

export function UserRowActions({ user, isSelf }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);

	async function handleDelete() {
		setLoading(true);
		const result = await deleteUserInline(user.id);
		setLoading(false);

		if (result?.error) {
			toast.error(result.error);
			setOpen(false);
			return;
		}

		toast.success("Utilisateur supprimé");
		setOpen(false);
		router.refresh();
	}

	return (
		<>
			<div className="flex justify-center gap-2">
				<Button
					asChild
					variant="outline"
					size="sm"
				>
					<Link href={`/admin/users/${user.id}`}>
						<Eye className="mr-1 h-3.5 w-3.5" />
						Voir
					</Link>
				</Button>
				<Button
					type="button"
					variant="destructive"
					size="sm"
					onClick={() => setOpen(true)}
					disabled={isSelf || loading}
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
						<AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
						<AlertDialogDescription>
							Le compte &quot;{user.name || user.email}&quot; sera supprimé avec ses données associées. Cette action est irréversible.
						</AlertDialogDescription>
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
