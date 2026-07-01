import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ArticleFormPublicationSection({
	requiredTier,
	onRequiredTierChange,
	allTags,
	selectedTagIds,
	onToggleTag,
	hierarchicalTagNames,
	effectivePrimaryCategoryPath,
	onPrimaryCategoryPathChange,
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Publication</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label>Niveau d&apos;accès requis</Label>
					<Select
						value={requiredTier}
						onValueChange={onRequiredTierChange}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="FREE">Gratuit · accessible à tous</SelectItem>
							<SelectItem value="ACADEMY">Académie · ACADEMY et PRIME</SelectItem>
							<SelectItem value="PRIME">Prime · uniquement PRIME</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{allTags.length > 0 && (
					<div className="space-y-2">
						<Label>Tags ({selectedTagIds.length} sélectionné(s))</Label>
						<div className="flex flex-wrap gap-2">
							{allTags.map((tag) => (
								<button
									key={tag.id}
									type="button"
									onClick={() => onToggleTag(tag.id)}
									className={`rounded-full border px-3 py-1 text-sm transition-colors ${
										selectedTagIds.includes(tag.id) ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
									}`}
									style={selectedTagIds.includes(tag.id) && tag.color ? { backgroundColor: tag.color, borderColor: tag.color, color: "#fff" } : undefined}
								>
									{tag.name}
								</button>
							))}
						</div>

						{hierarchicalTagNames.length > 0 ? (
							<div className="space-y-2 rounded-md border bg-muted/20 p-3">
								<Label>Fil d&apos;Ariane principal</Label>
								<Select
									value={effectivePrimaryCategoryPath}
									onValueChange={onPrimaryCategoryPathChange}
								>
									<SelectTrigger>
										<SelectValue placeholder="Choisir la categorie principale" />
									</SelectTrigger>
									<SelectContent>
										{hierarchicalTagNames.map((name) => (
											<SelectItem
												key={name}
												value={name}
											>
												{name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-xs text-muted-foreground">Ce chemin sera utilise pour le fil d&apos;Ariane de la page ressource.</p>
							</div>
						) : (
							<p className="text-xs text-muted-foreground">Astuce: utilise des tags hierarchiques avec / (ex: Destinations / Europe / Ecosse / Edimbourg).</p>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
