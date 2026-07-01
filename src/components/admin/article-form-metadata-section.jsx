import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";

export function ArticleFormMetadataSection({
	title,
	onTitleChange,
	slug,
	onSlugChange,
	slugPreview,
	onGenerateSlug,
	excerpt,
	onExcerptChange,
	coverImage,
	onCoverImageChange,
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Informations de base</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="title">Titre *</Label>
					<Input
						id="title"
						value={title}
						onChange={onTitleChange}
						placeholder="Le titre de ton article"
						required
						className="bg-neutral-50 shadow-inner"
					/>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="slug">Slug (URL)</Label>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onGenerateSlug}
						>
							<Wand2 className="mr-1 h-3.5 w-3.5" />
							Générer depuis le titre
						</Button>
					</div>
					<Input
						id="slug"
						value={slug}
						onChange={onSlugChange}
						placeholder="mon-super-article"
						className="bg-neutral-50 shadow-inner"
					/>
					<p className="text-xs text-muted-foreground">Aperçu: /resources/{slugPreview || "..."}</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="excerpt">Résumé (optionnel)</Label>
					<Textarea
						id="excerpt"
						value={excerpt}
						onChange={onExcerptChange}
						placeholder="Court résumé affiché dans les listes. Si vide, généré automatiquement."
						rows={2}
						className="bg-neutral-50 shadow-inner"
					/>
					<p className="text-xs text-muted-foreground">{excerpt.length}/500 caractères</p>
				</div>

				<div className="space-y-2">
					<Label>Image de couverture</Label>
					<ImageUpload
						value={coverImage}
						onChange={onCoverImageChange}
						name="coverImage"
						className="bg-neutral-50 shadow-inner"
					/>
				</div>
			</CardContent>
		</Card>
	);
}
