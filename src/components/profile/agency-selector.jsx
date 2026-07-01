"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Plus, X, Building2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { searchAgencies, joinAgency, leaveAgency } from "@/app/(member)/profile/agency-actions";
import { AgencyFormDialog } from "./agency-form-dialog";

export function AgencySelector({ profile, currentAgency, isAgencyAdmin }) {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);
	const [searching, setSearching] = useState(false);
	const [showCreate, setShowCreate] = useState(false);
	const [showEdit, setShowEdit] = useState(false);
	const searchTimerRef = useRef(null);

	function handleQueryChange(value) {
		setQuery(value);

		if (searchTimerRef.current) {
			clearTimeout(searchTimerRef.current);
		}

		if (!value || value.length < 2) {
			setSearching(false);
			setResults([]);
			return;
		}

		setSearching(true);
		searchTimerRef.current = setTimeout(async () => {
			const found = await searchAgencies(value);
			setResults(found);
			setSearching(false);
		}, 300);
	}

	async function handleJoin(agencyId) {
		const result = await joinAgency(agencyId);
		if (result?.error) {
			toast.error(result.error);
			return;
		}
		toast.success("Tu as rejoint l'agence");
		setQuery("");
		setSearching(false);
		setResults([]);
		router.refresh();
	}

	async function handleLeave() {
		if (!confirm("Quitter cette agence ?")) return;
		const result = await leaveAgency();
		if (result?.error) {
			toast.error(result.error);
			return;
		}
		toast.success("Tu as quitté l'agence");
		router.refresh();
	}

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="h-5 w-5" />
						Mon agence
					</CardTitle>
					<CardDescription>Ton appartenance professionnelle (optionnel)</CardDescription>
				</CardHeader>
				<CardContent>
					{currentAgency ? (
						<div className="space-y-4">
							<div className="rounded-lg border bg-muted/30 p-4">
								<div className="flex items-start justify-between gap-3">
									<div className="flex items-start gap-3 flex-1">
										{currentAgency.logoUrl ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={currentAgency.logoUrl}
												alt={currentAgency.name}
												className="h-12 w-12 rounded object-cover"
											/>
										) : (
											<div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
												<Building2 className="h-6 w-6 text-muted-foreground" />
											</div>
										)}
										<div>
											<p className="font-semibold">{currentAgency.name}</p>
											{currentAgency.city && (
												<p className="text-sm text-muted-foreground">
													{currentAgency.city}
													{currentAgency.province && `, ${currentAgency.province}`}
												</p>
											)}
											{!currentAgency.approved && <p className="text-xs text-amber-600 mt-1">⏳ En attente de validation par l&apos;équipe AERIA</p>}
										</div>
									</div>
									<div className="flex flex-col gap-1">
										{isAgencyAdmin && (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => setShowEdit(true)}
											>
												<Edit className="h-4 w-4" />
											</Button>
										)}
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={handleLeave}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>

							{/* Rôle dans l'agence */}
							<div className="space-y-2">
								<label
									htmlFor="agencyRole"
									className="text-sm font-medium"
								>
									Mon rôle dans l&apos;agence
								</label>
								<Input
									id="agencyRole"
									name="agencyRole"
									defaultValue={profile?.agencyRole || ""}
									placeholder="Ex: Conseillère senior, Propriétaire, Stagiaire..."
								/>
								<p className="text-xs text-muted-foreground">Ce champ est sauvegardé avec le reste du profil</p>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									value={query}
									onChange={(e) => handleQueryChange(e.target.value)}
									placeholder="Rechercher mon agence..."
									className="pl-9"
								/>
							</div>

							{searching && <p className="text-sm text-muted-foreground">Recherche...</p>}

							{!searching && query.length >= 2 && results.length === 0 && (
								<p className="text-sm text-muted-foreground">Aucune agence trouvée. Tu peux la créer ci-dessous.</p>
							)}

							{results.length > 0 && (
								<div className="space-y-2 max-h-60 overflow-y-auto">
									{results.map((a) => (
										<button
											key={a.id}
											type="button"
											onClick={() => handleJoin(a.id)}
											className="w-full text-left rounded-md border p-3 hover:bg-muted transition-colors flex items-center gap-3"
										>
											{a.logoUrl ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={a.logoUrl}
													alt={a.name}
													className="h-10 w-10 rounded object-cover shrink-0"
												/>
											) : (
												<div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
													<Building2 className="h-5 w-5 text-muted-foreground" />
												</div>
											)}
											<div className="flex-1 min-w-0">
												<p className="font-medium truncate">{a.name}</p>
												<p className="text-xs text-muted-foreground">
													{a.city || "—"}
													{a.province && `, ${a.province}`}
													{a._count.members > 0 && ` · ${a._count.members} agent(s)`}
												</p>
											</div>
										</button>
									))}
								</div>
							)}

							<div className="pt-2 border-t">
								<p className="text-sm text-muted-foreground mb-2">Tu ne trouves pas ton agence ?</p>
								<Button
									type="button"
									variant="outline"
									onClick={() => setShowCreate(true)}
								>
									<Plus className="mr-1 h-4 w-4" /> Créer mon agence
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<AgencyFormDialog
				open={showCreate}
				onOpenChange={setShowCreate}
				mode="create"
			/>

			{currentAgency && (
				<AgencyFormDialog
					open={showEdit}
					onOpenChange={setShowEdit}
					mode="edit"
					agency={currentAgency}
				/>
			)}
		</>
	);
}
