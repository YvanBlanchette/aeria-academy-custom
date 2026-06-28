"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminCreateAgency, adminUpdateAgency } from "@/app/admin/agencies/actions";

export function AgencyForm({ agency }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const isEdit = !!agency;

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);
		const result = isEdit ? await adminUpdateAgency(agency.id, formData) : await adminCreateAgency(formData);

		if (result?.error) {
			toast.error(result.error);
			setLoading(false);
			return;
		}

		if (isEdit) {
			toast.success("Agence mise à jour");
			router.refresh();
		}
		setLoading(false);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
		>
			<Card>
				<CardHeader>
					<CardTitle>Informations générales</CardTitle>
					<CardDescription>Nom, logo et description publique</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
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
						<Label htmlFor="logoUrl">URL du logo</Label>
						<Input
							id="logoUrl"
							name="logoUrl"
							defaultValue={agency?.logoUrl || ""}
							placeholder="https://..."
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							name="description"
							defaultValue={agency?.description || ""}
							placeholder="Présentation de l'agence..."
							rows={4}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Coordonnées</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="address">Adresse</Label>
						<Input
							id="address"
							name="address"
							defaultValue={agency?.address || ""}
							placeholder="123 rue Principale"
						/>
					</div>

					<div className="grid gap-4 md:grid-cols-3">
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
							<Label htmlFor="province">Province / État</Label>
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
					</div>

					<div className="grid gap-4 md:grid-cols-3">
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Certifications professionnelles</CardTitle>
					<CardDescription>Numéros officiels affichés sur le profil</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<Label htmlFor="iataCode">IATA</Label>
							<Input
								id="iataCode"
								name="iataCode"
								defaultValue={agency?.iataCode || ""}
								placeholder="12345678"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="tico">TICO (Ontario)</Label>
							<Input
								id="tico"
								name="tico"
								defaultValue={agency?.tico || ""}
								placeholder="50012345"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="opc">OPC (Québec)</Label>
							<Input
								id="opc"
								name="opc"
								defaultValue={agency?.opc || ""}
								placeholder="123456"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="flex gap-3 justify-end">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push("/admin/agencies")}
				>
					Annuler
				</Button>
				<Button
					type="submit"
					disabled={loading}
				>
					{loading ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer l'agence"}
				</Button>
			</div>
		</form>
	);
}
