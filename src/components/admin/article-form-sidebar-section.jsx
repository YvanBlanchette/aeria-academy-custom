import clsx from "clsx";
import { BookText, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function ArticleFormSidebarSection({
	isRightPanelOpen,
	isFocusMode,
	rightPanelSections,
	templateKey,
	onTemplateKeyChange,
	onApplyTemplate,
	title,
	titleSeoState,
	excerpt,
	excerptSeoState,
	autosaving,
	wordCount,
	readingMinutes,
	contentQuality,
	lastSavedAt,
	slugPreview,
	content,
	selectedTagIds,
	coverImage,
}) {
	if (!isRightPanelOpen || isFocusMode) return null;

	return (
		<aside className="space-y-4 xl:sticky xl:top-6 h-fit">
			{rightPanelSections.templates ? (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Templates d&apos;article</CardTitle>
						<CardDescription>Démarre rapidement avec une structure prête à remplir.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Select
							value={templateKey}
							onValueChange={onTemplateKeyChange}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="guide">Guide pratique</SelectItem>
								<SelectItem value="news">Annonce / actualite</SelectItem>
								<SelectItem value="caseStudy">Etude de cas</SelectItem>
							</SelectContent>
						</Select>
						<Button
							type="button"
							className="w-full"
							variant="outline"
							onClick={onApplyTemplate}
						>
							Appliquer le template
						</Button>
					</CardContent>
				</Card>
			) : null}

			{rightPanelSections.seo ? (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Indicateurs SEO</CardTitle>
						<CardDescription>Optimise ton titre et ton resume pour la recherche.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Titre ({title.length})</span>
							<Badge variant={titleSeoState === "optimal" ? "default" : titleSeoState === "ok" ? "secondary" : "outline"}>
								{titleSeoState === "optimal" ? "Optimal" : titleSeoState === "ok" ? "Acceptable" : "A ajuster"}
							</Badge>
						</div>
						<p className="text-xs text-muted-foreground">Cible recommandee: 45 a 65 caracteres.</p>
						<div className="h-1.5 rounded bg-muted overflow-hidden">
							<div
								className={clsx(
									"h-full transition-all",
									titleSeoState === "optimal" ? "bg-primary" : titleSeoState === "ok" ? "bg-amber-500" : "bg-muted-foreground",
								)}
								style={{ width: `${Math.min(100, (title.length / 80) * 100)}%` }}
							/>
						</div>

						<div className="flex items-center justify-between pt-2">
							<span className="text-muted-foreground">Resume ({excerpt.length})</span>
							<Badge variant={excerptSeoState === "optimal" ? "default" : excerptSeoState === "ok" ? "secondary" : "outline"}>
								{excerptSeoState === "optimal" ? "Optimal" : excerptSeoState === "ok" ? "Acceptable" : "A ajuster"}
							</Badge>
						</div>
						<p className="text-xs text-muted-foreground">Meta description recommandee: 120 a 160 caracteres.</p>
						<div className="h-1.5 rounded bg-muted overflow-hidden">
							<div
								className={clsx(
									"h-full transition-all",
									excerptSeoState === "optimal" ? "bg-primary" : excerptSeoState === "ok" ? "bg-amber-500" : "bg-muted-foreground",
								)}
								style={{ width: `${Math.min(100, (excerpt.length / 220) * 100)}%` }}
							/>
						</div>
					</CardContent>
				</Card>
			) : null}

			{rightPanelSections.quality ? (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<BookText className="h-4 w-4" />
							Qualité de contenu
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Auto-save</span>
							<Badge variant={autosaving ? "secondary" : "outline"}>{autosaving ? "En cours" : "Actif"}</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Mots</span>
							<strong>{wordCount}</strong>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Lecture estimée</span>
							<strong>{readingMinutes} min</strong>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Niveau</span>
							<Badge variant={contentQuality === "Complet" ? "default" : contentQuality === "Moyen" ? "secondary" : "outline"}>{contentQuality}</Badge>
						</div>
						<p className="text-xs text-muted-foreground">
							{lastSavedAt ? `Derniere sauvegarde: ${lastSavedAt.toLocaleTimeString("fr-FR")}` : "Aucune sauvegarde automatique pour l'instant"}
						</p>
					</CardContent>
				</Card>
			) : null}

			{rightPanelSections.checklist ? (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<Hash className="h-4 w-4" />
							Checklist rapide
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						<p className={title.trim() ? "text-foreground" : "text-muted-foreground"}>• Titre renseigné</p>
						<p className={slugPreview ? "text-foreground" : "text-muted-foreground"}>• Slug prêt</p>
						<p className={content.trim().length > 0 ? "text-foreground" : "text-muted-foreground"}>• Contenu ajouté</p>
						<p className={selectedTagIds.length > 0 ? "text-foreground" : "text-muted-foreground"}>• Tags sélectionnés</p>
						<p className={coverImage ? "text-foreground" : "text-muted-foreground"}>• Image de couverture (optionnel)</p>
					</CardContent>
				</Card>
			) : null}
		</aside>
	);
}
