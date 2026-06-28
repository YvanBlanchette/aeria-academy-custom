"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, X, Trash2, UserMinus } from "lucide-react";
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
import { approveAgency, rejectAgency, removeMemberFromAgency } from "@/app/admin/agencies/actions";

export function ApproveButton({ agencyId }) {
	const [loading, setLoading] = useState(false);

	async function handleApprove() {
		setLoading(true);
		const result = await approveAgency(agencyId);
		setLoading(false);
		if (result?.error) toast.error(result.error);
		else toast.success("Agence approuvée");
	}

	return (
		<Button
			onClick={handleApprove}
			disabled={loading}
		>
			<Check className="mr-1 h-4 w-4" />
			{loading ? "..." : "Approuver"}
		</Button>
	);
}

export function RejectButton({ agencyId, agencyName }) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	async function handleReject() {
		setLoading(true);
		const result = await rejectAgency(agencyId);
		setLoading(false);
		if (result?.error) {
			toast.error(result.error);
			setOpen(false);
		}
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
						<AlertDialogTitle>Supprimer cette agence ?</AlertDialogTitle>
						<AlertDialogDescription>
							&quot;{agencyName}&quot; sera supprimée définitivement. Les membres seront détachés (leur compte AERIA reste actif).
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleReject}
							disabled={loading}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{loading ? "..." : "Supprimer"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

export function RemoveMemberButton({ userId, agencyId, userName }) {
	const [loading, setLoading] = useState(false);

	async function handleRemove() {
		if (!confirm(`Retirer "${userName}" de l'agence ?`)) return;
		setLoading(true);
		const result = await removeMemberFromAgency(userId, agencyId);
		setLoading(false);
		if (result?.error) toast.error(result.error);
		else toast.success("Membre retiré de l'agence");
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={handleRemove}
			disabled={loading}
			title="Retirer ce membre"
		>
			<UserMinus className="h-4 w-4 text-destructive" />
		</Button>
	);
}
