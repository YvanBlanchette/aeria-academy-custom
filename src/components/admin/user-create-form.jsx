"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createUser } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function UserCreateForm() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [role, setRole] = useState("STUDENT");
	const [membership, setMembership] = useState("FREE");

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);
		formData.set("role", role);
		formData.set("membership", membership);

		const result = await createUser(formData);
		setLoading(false);

		if (result?.error) {
			toast.error(result.error);
			return;
		}

		toast.success("Utilisateur créé");
		if (result?.userId) {
			router.push(`/admin/users/${result.userId}`);
			return;
		}
		router.push("/admin/users");
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Nouveau membre</CardTitle>
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
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Mot de passe temporaire</Label>
						<Input
							id="password"
							name="password"
							type="password"
							required
						/>
						<p className="text-xs text-muted-foreground">8+ caractères, au moins 1 majuscule et 1 chiffre.</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="role">Rôle</Label>
							<Select
								value={role}
								onValueChange={setRole}
							>
								<SelectTrigger id="role">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="STUDENT">Étudiant</SelectItem>
									<SelectItem value="INSTRUCTOR">Instructeur</SelectItem>
									<SelectItem value="ADMIN">Administrateur</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="membership">Membership</Label>
							<Select
								value={membership}
								onValueChange={setMembership}
							>
								<SelectTrigger id="membership">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="FREE">Gratuit</SelectItem>
									<SelectItem value="ACADEMY">Académie</SelectItem>
									<SelectItem value="PRIME">Prime</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<label className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							name="emailVerified"
							className="h-4 w-4"
						/>
						Marquer l&apos;email comme vérifié
					</label>

					<div className="flex gap-3 pt-2">
						<Button
							type="submit"
							disabled={loading}
						>
							{loading ? "Création..." : "Créer le membre"}
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
