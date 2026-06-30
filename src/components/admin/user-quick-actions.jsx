"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { markUserEmailVerified, quickUpdateUserRole, resetUserPasswordTemp } from "@/app/admin/users/actions";

export function UserQuickActions({ user, currentUserId }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [selectedRole, setSelectedRole] = useState(user.role);
	const [tempPassword, setTempPassword] = useState("");

	const isSelf = user.id === currentUserId;

	async function handleVerifyEmail() {
		setLoading(true);
		const result = await markUserEmailVerified(user.id);
		setLoading(false);
		if (result?.error) {
			toast.error(result.error);
			return;
		}
		toast.success("Email marqué comme vérifié");
		router.refresh();
	}

	async function handleRoleUpdate() {
		setLoading(true);
		const result = await quickUpdateUserRole(user.id, selectedRole);
		setLoading(false);
		if (result?.error) {
			toast.error(result.error);
			return;
		}
		toast.success("Rôle mis à jour");
		router.refresh();
	}

	async function handleTempPasswordReset() {
		setLoading(true);
		const result = await resetUserPasswordTemp(user.id);
		setLoading(false);
		if (result?.error) {
			toast.error(result.error);
			return;
		}

		setTempPassword(result?.tempPassword || "");
		toast.success("Mot de passe temporaire généré");
	}

	async function copyPassword() {
		if (!tempPassword) return;
		try {
			await navigator.clipboard.writeText(tempPassword);
			toast.success("Mot de passe copié");
		} catch {
			toast.error("Impossible de copier automatiquement");
		}
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label>Rôle rapide</Label>
				<div className="flex gap-2">
					<Select
						value={selectedRole}
						onValueChange={setSelectedRole}
						disabled={loading}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="STUDENT">Étudiant</SelectItem>
							<SelectItem value="INSTRUCTOR">Instructeur</SelectItem>
							<SelectItem value="ADMIN">Administrateur</SelectItem>
						</SelectContent>
					</Select>
					<Button
						type="button"
						variant="outline"
						onClick={handleRoleUpdate}
						disabled={loading || (isSelf && selectedRole !== "ADMIN")}
					>
						<ShieldCheck className="mr-1 h-4 w-4" />
						Appliquer
					</Button>
				</div>
			</div>

			<Button
				type="button"
				variant="outline"
				onClick={handleVerifyEmail}
				disabled={loading || !!user.emailVerified}
				className="w-full"
			>
				<CheckCheck className="mr-1 h-4 w-4" />
				{user.emailVerified ? "Email déjà vérifié" : "Marquer l'email comme vérifié"}
			</Button>

			<Button
				type="button"
				variant="outline"
				onClick={handleTempPasswordReset}
				disabled={loading}
				className="w-full"
			>
				<KeyRound className="mr-1 h-4 w-4" />
				Réinitialiser le mot de passe
			</Button>

			{tempPassword ? (
				<div className="rounded-md border bg-muted/40 p-3 text-sm space-y-2">
					<p className="font-medium">Mot de passe temporaire</p>
					<p className="break-all font-mono text-xs">{tempPassword}</p>
					<Button
						type="button"
						variant="secondary"
						size="sm"
						onClick={copyPassword}
					>
						Copier
					</Button>
				</div>
			) : null}
		</div>
	);
}
