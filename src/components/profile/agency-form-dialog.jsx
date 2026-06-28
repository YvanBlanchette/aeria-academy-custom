"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createAgency, updateAgency } from "@/app/(member)/profile/agency-actions";

export function AgencyFormDialog({ open, onOpenChange, mode, agency }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);
		const result = mode === "create" ? await createAgency(formData) : await updateAgency(agency.id, formData);

		setLoading(false);

		if (result?.error) {
			toast.error(result.error);
			return;
		}

		toast.success(mode === "create" ? "Agence créée — en attente de validation" : "Agence mise à jour");
		onOpenChange(false);
		router.refresh();
	}

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{mode === "create" ? "Créer une agence" : "Modifier l'agence"}</DialogTitle>
					<DialogDescription>
						{mode === "create"
							? "Renseigne les infos de ton agence. Elle devra être validée par notre équipe avant d'être visible publiquement."
							: "Modifie les informations de l'agence"}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="name">Nom de l&apos;agence *</Label>
						<Input
							id="name"
							name="name"
							defaultValue={agency?.name || ""}
							placeholder="Voyages XYZ"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							name="description"
							defaultValue={agency?.description || ""}
							placeholder="Description courte de l'agence..."
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="logoUrl">Logo (URL)</Label>
						<Input
							id="logoUrl"
							name="logoUrl"
							defaultValue={agency?.logoUrl || ""}
							placeholder="https://..."
						/>
						<p className="text-xs text-muted-foreground">Pour l&apos;instant, colle une URL d&apos;image hébergée. Upload local à venir.</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="address">Adresse</Label>
							<Input
								id="address"
								name="address"
								defaultValue={agency?.address || ""}
								placeholder="123 rue Principale"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="city">Ville</Label>
							<Input
								id="city"
								name="city"
								defaultValue={agency?.city || ""}
								placeholder="Montréal"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="province">Province</Label>
							<Input
								id="province"
								name="province"
								defaultValue={agency?.province || ""}
								placeholder="QC"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="postalCode">Code postal</Label>
							<Input
								id="postalCode"
								name="postalCode"
								defaultValue={agency?.postalCode || ""}
								placeholder="H1A 1A1"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="country">Pays</Label>
							<Input
								id="country"
								name="country"
								defaultValue={agency?.country || "Canada"}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="phone">Téléphone</Label>
							<Input
								id="phone"
								name="phone"
								type="tel"
								defaultValue={agency?.phone || ""}
								placeholder="514-555-1234"
							/>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								defaultValue={agency?.email || ""}
								placeholder="contact@agence.com"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="websiteUrl">Site web</Label>
							<Input
								id="websiteUrl"
								name="websiteUrl"
								defaultValue={agency?.websiteUrl || ""}
								placeholder="https://..."
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label>Certifications professionnelles</Label>
						<div className="grid gap-2 md:grid-cols-3">
							<Input
								name="iataCode"
								defaultValue={agency?.iataCode || ""}
								placeholder="IATA"
							/>
							<Input
								name="tico"
								defaultValue={agency?.tico || ""}
								placeholder="TICO (ON)"
							/>
							<Input
								name="opc"
								defaultValue={agency?.opc || ""}
								placeholder="OPC (QC)"
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={loading}
						>
							Annuler
						</Button>
						<Button
							type="submit"
							disabled={loading}
						>
							{loading ? "Enregistrement..." : mode === "create" ? "Créer l'agence" : "Mettre à jour"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
