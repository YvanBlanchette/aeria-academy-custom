"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
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
import { deleteUser } from "@/app/admin/users/actions";

export function UserDeleteButton({ user, disabled, disabledReason }) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	async function handleDelete() {
		setLoading(true);
		const result = await deleteUser(user.id);
		setLoading(false);

		if (result?.error) {
			toast.error(result.error);
			setOpen(false);
		}
		// Sur succès, deleteUser fait un redirect — pas besoin de toast ici
	}

	if (disabled) {
		return (
			<Button
				variant="outline"
				disabled
			>
				<Trash2 className="mr-1 h-4 w-4" />
				{disabledReason || "Suppression impossible"}
			</Button>
		);
	}

	return (
		<>
			<Button
				variant="destructive"
				onClick={() => setOpen(true)}
			>
				<Trash2 className="mr-1 h-4 w-4" />
				Supprimer
			</Button>

			<AlertDialog
				open={open}
				onOpenChange={setOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
						<AlertDialogDescription>
							&quot;{user.name || user.email}&quot; sera supprimé définitivement, ainsi que toutes ses inscriptions et sa progression. Cette action est
							irréversible.
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
