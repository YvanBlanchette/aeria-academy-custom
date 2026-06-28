"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { updateProfile } from "@/app/(member)/profile/actions";
import { UsernameSection } from "./username-section";

export function ProfileForm({ profile, user }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [publicProfile, setPublicProfile] = useState(profile?.publicProfile || false);

	// Extrait les social links depuis le JSON
	const sl = profile?.socialLinks || {};

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);
		formData.set("publicProfile", publicProfile.toString());

		const result = await updateProfile(formData);
		setLoading(false);

		if (result?.error) {
			toast.error(result.error);
			return;
		}

		toast.success("Profil mis à jour");
		router.refresh();
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
		>
			{/* Profil professionnel */}
			<Card>
				<CardHeader>
					<CardTitle>Profil professionnel</CardTitle>
					<CardDescription>Ces informations apparaissent sur ton profil public</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="jobTitle">Titre du poste</Label>
							<Input
								id="jobTitle"
								name="jobTitle"
								defaultValue={profile?.jobTitle || ""}
								placeholder="Conseillère en voyages"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="company">Entreprise / Agence</Label>
							<Input
								id="company"
								name="company"
								defaultValue={profile?.company || ""}
								placeholder="Ex: Voyages XYZ"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="bio">Bio</Label>
						<Textarea
							id="bio"
							name="bio"
							defaultValue={profile?.bio || ""}
							placeholder="Présente-toi en quelques lignes..."
							rows={4}
						/>
						<p className="text-xs text-muted-foreground">Max 2000 caractères</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="websiteUrl">Site web</Label>
						<Input
							id="websiteUrl"
							name="websiteUrl"
							type="text"
							defaultValue={profile?.websiteUrl || ""}
							placeholder="https://monsite.com"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Coordonnées */}
			<Card>
				<CardHeader>
					<CardTitle>Coordonnées</CardTitle>
					<CardDescription>Privées par défaut, jamais affichées publiquement</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="phone">Téléphone</Label>
							<Input
								id="phone"
								name="phone"
								type="tel"
								defaultValue={profile?.phone || ""}
								placeholder="514-555-1234"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="address">Adresse</Label>
							<Input
								id="address"
								name="address"
								defaultValue={profile?.address || ""}
								placeholder="123 rue Principale"
							/>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<Label htmlFor="city">Ville</Label>
							<Input
								id="city"
								name="city"
								defaultValue={profile?.city || ""}
								placeholder="Montréal"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="province">Province / État</Label>
							<Input
								id="province"
								name="province"
								defaultValue={profile?.province || ""}
								placeholder="QC"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="postalCode">Code postal</Label>
							<Input
								id="postalCode"
								name="postalCode"
								defaultValue={profile?.postalCode || ""}
								placeholder="H1A 1A1"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="country">Pays</Label>
						<Input
							id="country"
							name="country"
							defaultValue={profile?.country || "Canada"}
							placeholder="Canada"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Réseaux sociaux */}
			<Card>
				<CardHeader>
					<CardTitle>Réseaux sociaux</CardTitle>
					<CardDescription>Liens vers tes profils publics (laisser vide ce que tu n&apos;utilises pas)</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="facebookUrl">Facebook</Label>
							<Input
								id="facebookUrl"
								name="facebookUrl"
								type="text"
								defaultValue={sl.facebook || ""}
								placeholder="https://facebook.com/..."
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="linkedinUrl">LinkedIn</Label>
							<Input
								id="linkedinUrl"
								name="linkedinUrl"
								type="text"
								defaultValue={sl.linkedin || ""}
								placeholder="https://linkedin.com/in/..."
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="instagramUrl">Instagram</Label>
							<Input
								id="instagramUrl"
								name="instagramUrl"
								type="text"
								defaultValue={sl.instagram || ""}
								placeholder="https://instagram.com/..."
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="tiktokUrl">TikTok</Label>
							<Input
								id="tiktokUrl"
								name="tiktokUrl"
								type="text"
								defaultValue={sl.tiktok || ""}
								placeholder="https://tiktok.com/@..."
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="twitterUrl">Twitter / X</Label>
							<Input
								id="twitterUrl"
								name="twitterUrl"
								type="text"
								defaultValue={sl.twitter || ""}
								placeholder="https://x.com/..."
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="youtubeUrl">YouTube</Label>
							<Input
								id="youtubeUrl"
								name="youtubeUrl"
								type="text"
								defaultValue={sl.youtube || ""}
								placeholder="https://youtube.com/@..."
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Visibilité */}
			<UsernameSection
				user={user}
				publicEnabled={publicProfile}
				onPublicChange={setPublicProfile}
			/>

			<div className="flex justify-end">
				<Button
					type="submit"
					disabled={loading}
				>
					{loading ? "Enregistrement..." : "Enregistrer"}
				</Button>
			</div>
		</form>
	);
}
