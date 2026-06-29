"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/image-upload";
import { uploadArticleMedia } from "@/app/admin/articles/upload-actions";
import { createArticle, updateArticle } from "@/app/admin/articles/actions";
import { ArticleContent } from "@/components/articles/article-content";

export function ArticleForm({ article, allTags = [] }) {
	const router = useRouter();
	const isEdit = !!article;

	const [loading, setLoading] = useState(false);
	const [title, setTitle] = useState(article?.title || "");
	const [excerpt, setExcerpt] = useState(article?.excerpt || "");
	const [coverImage, setCoverImage] = useState(article?.coverImage || "");
	const [content, setContent] = useState(article?.content || "");
	const [requiredTier, setRequiredTier] = useState(article?.requiredTier || "FREE");
	const [selectedTagIds, setSelectedTagIds] = useState(article?.tags?.map((t) => t.tagId) || []);
	const [showPreview, setShowPreview] = useState(false);

	const textareaRef = useRef(null);

	function toggleTag(tagId) {
		setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]));
	}

	// Helper : insère du texte à la position du curseur
	function insertAtCursor(text) {
		const ta = textareaRef.current;
		if (!ta) return;
		const start = ta.selectionStart;
		const end = ta.selectionEnd;
		const newContent = content.slice(0, start) + text + content.slice(end);
		setContent(newContent);
		// Restore le focus + curseur après le texte inséré
		setTimeout(() => {
			ta.focus();
			ta.setSelectionRange(start + text.length, start + text.length);
		}, 0);
	}

	async function handleMediaUpload(kind, accept) {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = accept;
		input.onchange = async (e) => {
			const file = e.target.files?.[0];
			if (!file) return;

			toast.loading("Upload en cours...");
			const formData = new FormData();
			formData.set("file", file);
			formData.set("kind", kind);
			const result = await uploadArticleMedia(formData);
			toast.dismiss();

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success("Média uploadé");

			// Insère la directive markdown correspondante
			const directive =
				kind === "image"
					? `\n::image[${result.url}]{caption=""}\n`
					: kind === "audio"
						? `\n::audio[${result.url}]{caption=""}\n`
						: `\n::pdf[${result.url}]{title=""}\n`;
			insertAtCursor(directive);
		};
		input.click();
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData();
		formData.set("title", title);
		formData.set("excerpt", excerpt);
		formData.set("coverImage", coverImage);
		formData.set("content", content);
		formData.set("requiredTier", requiredTier);
		formData.set("tagIds", selectedTagIds.join(","));

		const result = isEdit ? await updateArticle(article.id, formData) : await createArticle(formData);

		if (result?.error) {
			toast.error(result.error);
			setLoading(false);
			return;
		}

		if (isEdit) {
			toast.success("Article mis à jour");
			router.refresh();
		}
		setLoading(false);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
		>
			{/* Card 1 : Métadonnées */}
			<Card>
				<CardHeader>
					<CardTitle>Informations</CardTitle>
					<CardDescription>Titre, résumé, image de couverture</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">Titre *</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Le titre de ton article"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="excerpt">Résumé (optionnel)</Label>
						<Textarea
							id="excerpt"
							value={excerpt}
							onChange={(e) => setExcerpt(e.target.value)}
							placeholder="Court résumé affiché dans les listes. Si vide, généré automatiquement."
							rows={2}
						/>
					</div>

					<div className="space-y-2">
						<Label>Image de couverture</Label>
						<ImageUpload
							value={coverImage}
							onChange={setCoverImage}
							name="coverImage"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Card 2 : Contenu markdown */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Contenu</CardTitle>
							<CardDescription>Markdown enrichi avec directives ::audio, ::video, ::image, ::pdf, ::callout, ::quote</CardDescription>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setShowPreview((v) => !v)}
						>
							{showPreview ? <EyeOff className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
							{showPreview ? "Éditeur" : "Aperçu"}
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Toolbar d'insertion */}
					<div className="flex flex-wrap gap-2 border-b pb-3">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => insertAtCursor("\n## Sous-titre\n\n")}
						>
							Titre
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => handleMediaUpload("image", "image/*")}
						>
							+ Image
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => handleMediaUpload("audio", "audio/*")}
						>
							+ Audio
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => handleMediaUpload("pdf", "application/pdf")}
						>
							+ PDF
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => insertAtCursor("\n::video[https://youtube.com/watch?v=ID]\n")}
						>
							+ Vidéo YouTube
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => insertAtCursor('\n::callout[Information importante]{type="info"}\n')}
						>
							+ Callout
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => insertAtCursor('\n::quote[Citation]{author="Auteur"}\n')}
						>
							+ Citation
						</Button>
					</div>

					{/* Éditeur ou Aperçu */}
					{showPreview ? (
						<div className="min-h-[400px] rounded-md border p-6 bg-white">
							{content ? <ArticleContent content={content} /> : <p className="text-muted-foreground">Aperçu vide. Écris du contenu pour le voir ici.</p>}
						</div>
					) : (
						<Textarea
							ref={textareaRef}
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="Commence à écrire ton article en markdown..."
							rows={20}
							className="font-mono text-sm"
							required
						/>
					)}
				</CardContent>
			</Card>

			{/* Card 3 : Accès + Tags */}
			<Card>
				<CardHeader>
					<CardTitle>Publication</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label>Niveau d&apos;accès requis</Label>
						<Select
							value={requiredTier}
							onValueChange={setRequiredTier}
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
										onClick={() => toggleTag(tag.id)}
										className={`rounded-full border px-3 py-1 text-sm transition-colors ${
											selectedTagIds.includes(tag.id) ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
										}`}
										style={selectedTagIds.includes(tag.id) && tag.color ? { backgroundColor: tag.color, borderColor: tag.color, color: "#fff" } : undefined}
									>
										{tag.name}
									</button>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<div className="flex justify-end gap-3">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push("/admin/articles")}
				>
					Annuler
				</Button>
				<Button
					type="submit"
					disabled={loading}
				>
					{loading ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer l'article"}
				</Button>
			</div>
		</form>
	);
}
