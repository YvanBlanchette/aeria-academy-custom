"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateUser } from "@/app/admin/users/actions";

export function UserForm({ user, currentUserId }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [role, setRole] = useState(user.role);
	const [membership, setMembership] = useState(user.membership);

	const isSelf = user.id === currentUserId;

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);
		formData.set("role", role);
		formData.set("membership", membership);

		const result = await updateUser(user.id, formData);
		setLoading(false);

		if (result?.error) {
			toast.error(result.error);
			return;
		}

		toast.success("Utilisateur mis à jour");
		router.refresh();
	}

	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>Informations</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="name">Nom complet</Label>
						<Input
							id="name"
							name="name"
							defaultValue={user.name || ""}
							required
							className="bg-neutral-50 shadow-inner"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							defaultValue={user.email}
							required
							className="bg-neutral-50 shadow-inner"
						/>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="role">Rôle</Label>
							<Select
								value={role}
								onValueChange={setRole}
								disabled={isSelf}
								className="bg-neutral-50 shadow-inner"
							>
								<SelectTrigger
									id="role"
									className="bg-neutral-50 shadow-inner"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="STUDENT">Étudiant</SelectItem>
									<SelectItem value="INSTRUCTOR">Instructeur</SelectItem>
									<SelectItem value="ADMIN">Administrateur</SelectItem>
								</SelectContent>
							</Select>
							{isSelf && <p className="text-xs text-muted-foreground">Impossible de modifier ton propre rôle</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="membership">Membership</Label>
							<Select
								value={membership}
								onValueChange={setMembership}
							>
								<SelectTrigger
									id="membership"
									className="bg-neutral-50 shadow-inner"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="FREE">Gratuit</SelectItem>
									<SelectItem value="ACADEMY">Académie</SelectItem>
									<SelectItem value="PRIME">Prime</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">Override manuel (utile pour les comptes promo)</p>
						</div>
					</div>

					<div className="flex gap-3 pt-2">
						<Button
							type="submit"
							disabled={loading}
						>
							{loading ? "Enregistrement..." : "Mettre à jour"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => router.push("/admin/users")}
						>
							Annuler
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
