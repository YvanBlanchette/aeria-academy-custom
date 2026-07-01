"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile, uploadProfileImage } from "@/app/(member)/profile/actions";
import { normalizePublicVisibility } from "@/lib/profile-visibility";
import { UsernameSection } from "./username-section";

export function ProfileForm({ profile, user }) {
	const router = useRouter();
	const { update: updateSession } = useSession();
	const fileInputRef = useRef(null);
	const [loading, setLoading] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [publicProfile, setPublicProfile] = useState(profile?.publicProfile || false);
	const [visibility, setVisibility] = useState(() => normalizePublicVisibility(profile?.publicVisibility));
	const [image, setImage] = useState(user?.image || "");

	// Extrait les social links depuis le JSON
	const sl = profile?.socialLinks || {};
	const initials = (user?.name || user?.email || "?")
		.split(" ")
		.map((s) => s.charAt(0))
		.join("")
		.toUpperCase()
		.slice(0, 2);

	async function handleImageChange(e) {
		const file = e.target.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.set("file", file);

		setUploadingImage(true);
		const result = await uploadProfileImage(formData);
		setUploadingImage(false);

		if (result?.error) {
			toast.error(result.error);
			return;
		}

		setImage(result.url);
		toast.success("Photo de profil mise à jour");
	}

	function clearImage() {
		setImage("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);
		formData.set("publicProfile", publicProfile.toString());
		formData.set("image", image);
		Object.entries(visibility).forEach(([key, value]) => {
			formData.set(key, String(Boolean(value)));
		});

		const result = await updateProfile(formData);
		setLoading(false);

		if (result?.error) {
			toast.error(result.error);
			return;
		}

		await updateSession();
		toast.success("Profil mis à jour");
		router.refresh();
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
		>
			{user?.username ? (
				<div className="flex justify-end">
					<Button
						asChild
						variant="outline"
						size="sm"
					>
						<Link href={`/users/${user.username}`}>Voir le profile public</Link>
					</Button>
				</div>
			) : null}

			<Card>
				<CardHeader>
					<CardTitle>Compte</CardTitle>
					<CardDescription>Modifie ton nom et ta photo de profil</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
						<Avatar
							size="lg"
							className="h-20 w-20"
						>
							<AvatarImage
								src={image || undefined}
								alt={user?.name || "Photo de profil"}
							/>
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>

						<div className="flex flex-wrap items-center gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => fileInputRef.current?.click()}
								disabled={uploadingImage}
							>
								{uploadingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
								{uploadingImage ? "Upload..." : "Changer la photo"}
							</Button>
							<Button
								type="button"
								variant="ghost"
								onClick={clearImage}
								disabled={!image || uploadingImage}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Supprimer
							</Button>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
								onChange={handleImageChange}
								className="hidden"
							/>
						</div>
					</div>

					<input
						type="hidden"
						name="image"
						value={image}
					/>
					<input
						type="hidden"
						name="coverImage"
						value={profile?.coverImage || ""}
					/>

					<div className="space-y-2">
						<Label htmlFor="name">Nom complet</Label>
						<Input
							id="name"
							name="name"
							defaultValue={user?.name || ""}
							placeholder="Ton nom"
							required
						/>
					</div>
				</CardContent>
			</Card>

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

			{publicProfile ? (
				<Card>
					<CardHeader>
						<CardTitle>Contrôle de visibilité publique</CardTitle>
						<CardDescription>Choisis exactement les informations affichées sur ton profil public.</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3 md:grid-cols-2">
						{[
							["showJobTitle", "Afficher le titre de poste"],
							["showCompany", "Afficher l'entreprise"],
							["showBio", "Afficher la bio"],
							["showWebsite", "Afficher le site web"],
							["showSocialLinks", "Afficher les réseaux sociaux"],
							["showAgency", "Afficher les informations d'agence"],
							["showCommunityStats", "Afficher les statistiques communauté"],
							["showCommunityPosts", "Afficher les publications récentes"],
							["showCertificates", "Afficher les certificats"],
							["showFollowStats", "Afficher followers et abonnements"],
						].map(([key, label]) => (
							<label
								key={key}
								className="flex items-center gap-2 rounded-md border p-2 text-sm"
							>
								<input
									type="checkbox"
									checked={Boolean(visibility[key])}
									onChange={(e) =>
										setVisibility((prev) => ({
											...prev,
											[key]: e.target.checked,
										}))
									}
								/>
								<span>{label}</span>
							</label>
						))}
					</CardContent>
				</Card>
			) : null}

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
