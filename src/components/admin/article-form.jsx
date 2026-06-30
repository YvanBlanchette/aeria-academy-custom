"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookText, Code2, Columns3, Eye, EyeOff, Focus, Hash, List, Minimize2, Redo2, Sparkles, Undo2, Wand2 } from "lucide-react";
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
import clsx from "clsx";
import { slugify } from "@/lib/slugify";

const NEW_ARTICLE_DRAFT_KEY = "admin-article-new-draft-v1";
const HISTORY_LIMIT = 80;

const SLASH_COMMANDS = {
	"/h2": "\n## Nouveau sous-titre\n\n",
	"/h3": "\n### Nouveau titre niveau 3\n\n",
	"/list": "\n- Point 1\n- Point 2\n- Point 3\n",
	"/code": "\n```md\nVotre code ici\n```\n",
	"/callout": '\n::callout[Information importante]{type="info"}\n',
	"/quote": '\n::quote[Citation]{author="Auteur"}\n',
	"/video": "\n::video[https://youtube.com/watch?v=ID]\n",
};

function readDraftFromStorage() {
	if (typeof window === "undefined") return null;
	const raw = window.localStorage.getItem(NEW_ARTICLE_DRAFT_KEY);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return null;
		return parsed;
	} catch {
		window.localStorage.removeItem(NEW_ARTICLE_DRAFT_KEY);
		return null;
	}
}

const ARTICLE_TEMPLATES = {
	guide: {
		label: "Guide pratique",
		title: "Guide: ",
		excerpt: "Guide rapide pour aider vos lecteurs a appliquer une methode claire.",
		content:
			"## Contexte\n\nExpliquez le probleme ou l'objectif en 3-4 phrases.\n\n## Etapes\n\n1. Etape 1\n2. Etape 2\n3. Etape 3\n\n## Points de vigilance\n\n::callout[Attention aux erreurs frequentes]{type=\"warning\"}\n\n## Conclusion\n\nResumer l'essentiel et proposer la prochaine action.",
		requiredTier: "FREE",
	},
	news: {
		label: "Annonce / actualite",
		title: "Annonce: ",
		excerpt: "Nouveaute importante a communiquer a la communaute.",
		content:
			"## Ce qui change\n\nDetaillez la nouveaute en termes simples.\n\n## Pourquoi c'est important\n\n- Benefice 1\n- Benefice 2\n\n## Date d'entree en vigueur\n\nPrecisez la date et les impacts.",
		requiredTier: "FREE",
	},
	caseStudy: {
		label: "Etude de cas",
		title: "Etude de cas: ",
		excerpt: "Retour d'experience detaille avec resultats concrets.",
		content:
			"## Situation initiale\n\nContexte client / equipe.\n\n## Strategie appliquee\n\nExpliquez les decisions prises.\n\n## Resultats\n\n- KPI 1\n- KPI 2\n\n## Lecons retenues\n\nCe qu'on reproduit, ce qu'on evite.",
		requiredTier: "ACADEMY",
	},
};

export function ArticleForm({ article, allTags = [] }) {
	const router = useRouter();
	const isEdit = !!article;
	const initialDraft = !isEdit ? readDraftFromStorage() : null;

	const [loading, setLoading] = useState(false);
	const [title, setTitle] = useState(article?.title || initialDraft?.title || "");
	const [slug, setSlug] = useState(article?.slug || initialDraft?.slug || "");
	const [excerpt, setExcerpt] = useState(article?.excerpt || initialDraft?.excerpt || "");
	const [coverImage, setCoverImage] = useState(article?.coverImage || initialDraft?.coverImage || "");
	const [content, setContent] = useState(article?.content || initialDraft?.content || "");
	const [requiredTier, setRequiredTier] = useState(article?.requiredTier || initialDraft?.requiredTier || "FREE");
	const [selectedTagIds, setSelectedTagIds] = useState(article?.tags?.map((t) => t.tagId) || initialDraft?.selectedTagIds || []);
	const [viewMode, setViewMode] = useState("editor");
	const [isDirty, setIsDirty] = useState(Boolean(initialDraft?.title || initialDraft?.content));
	const [autosaving, setAutosaving] = useState(false);
	const [lastSavedAt, setLastSavedAt] = useState(null);
	const [templateKey, setTemplateKey] = useState("guide");
	const [isFocusMode, setIsFocusMode] = useState(false);
	const [historyPast, setHistoryPast] = useState(Array.isArray(initialDraft?.historyPast) ? initialDraft.historyPast.slice(-HISTORY_LIMIT) : []);
	const [historyFuture, setHistoryFuture] = useState(Array.isArray(initialDraft?.historyFuture) ? initialDraft.historyFuture.slice(0, HISTORY_LIMIT) : []);
	const [slashInput, setSlashInput] = useState("");
	const [commandHint, setCommandHint] = useState("");

	const textareaRef = useRef(null);
	const checkpointRef = useRef(content);

	function buildFormDataPayload() {
		const formData = new FormData();
		formData.set("title", title);
		formData.set("slug", slug);
		formData.set("excerpt", excerpt);
		formData.set("coverImage", coverImage);
		formData.set("content", content);
		formData.set("requiredTier", requiredTier);
		formData.set("tagIds", selectedTagIds.join(","));
		return formData;
	}

	useEffect(() => {
		if (!isEdit && initialDraft && (initialDraft.title || initialDraft.content)) {
			toast.info("Brouillon local restaure");
		}
	}, [initialDraft, isEdit]);

	useEffect(() => {
		if (!isFocusMode) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [isFocusMode]);

	useEffect(() => {
		if (content === checkpointRef.current) return;
		const timer = window.setTimeout(() => {
			setHistoryPast((prev) => {
				if (prev[prev.length - 1] === checkpointRef.current) return prev;
				return [...prev.slice(-(HISTORY_LIMIT - 1)), checkpointRef.current];
			});
			checkpointRef.current = content;
			setHistoryFuture([]);
		}, 1200);
		return () => window.clearTimeout(timer);
	}, [content]);

	useEffect(() => {
		if (!isDirty) return;

		const save = async () => {
			if (!isEdit) {
				window.localStorage.setItem(
					NEW_ARTICLE_DRAFT_KEY,
					JSON.stringify({
						title,
						slug,
						excerpt,
						coverImage,
						content,
						requiredTier,
						selectedTagIds,
						historyPast,
						historyFuture,
					}),
				);
				setLastSavedAt(new Date());
				return;
			}

			if (!article?.id || content.trim().length < 10 || title.trim().length < 3) return;
			setAutosaving(true);
			const formData = new FormData();
			formData.set("title", title);
			formData.set("slug", slug);
			formData.set("excerpt", excerpt);
			formData.set("coverImage", coverImage);
			formData.set("content", content);
			formData.set("requiredTier", requiredTier);
			formData.set("tagIds", selectedTagIds.join(","));
			const result = await updateArticle(article.id, formData);
			setAutosaving(false);
			if (!result?.error) {
				setLastSavedAt(new Date());
				setIsDirty(false);
			}
		};

		const timer = window.setTimeout(save, 6000);
		return () => window.clearTimeout(timer);
	}, [article?.id, content, coverImage, excerpt, historyFuture, historyPast, isDirty, isEdit, requiredTier, selectedTagIds, slug, title]);

	function toggleTag(tagId) {
		setIsDirty(true);
		setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]));
	}

	// Helper : insère du texte à la position du curseur
	function insertAtCursor(text) {
		const ta = textareaRef.current;
		if (!ta) return;
		const start = ta.selectionStart;
		const end = ta.selectionEnd;
		setHistoryPast((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), content]);
		setHistoryFuture([]);
		const newContent = content.slice(0, start) + text + content.slice(end);
		setIsDirty(true);
		setContent(newContent);
		// Restore le focus + curseur après le texte inséré
		setTimeout(() => {
			ta.focus();
			ta.setSelectionRange(start + text.length, start + text.length);
		}, 0);
	}

	function wrapSelection(prefix, suffix = prefix) {
		const ta = textareaRef.current;
		if (!ta) return;
		const start = ta.selectionStart;
		const end = ta.selectionEnd;
		setHistoryPast((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), content]);
		setHistoryFuture([]);
		const selected = content.slice(start, end) || "texte";
		const wrapped = `${prefix}${selected}${suffix}`;
		const next = content.slice(0, start) + wrapped + content.slice(end);
		setIsDirty(true);
		setContent(next);
		setTimeout(() => {
			ta.focus();
			const cursorPos = start + wrapped.length;
			ta.setSelectionRange(cursorPos, cursorPos);
		}, 0);
	}

	function applySlashCommand(rawCommand, fromInline = false, range = null) {
		const normalized = rawCommand.trim().toLowerCase();
		const snippet = SLASH_COMMANDS[normalized];
		if (!snippet) {
			setCommandHint(`Commande inconnue: ${rawCommand}`);
			return false;
		}

		if (fromInline && range && textareaRef.current) {
			const ta = textareaRef.current;
			setHistoryPast((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), content]);
			setHistoryFuture([]);
			const next = content.slice(0, range.start) + snippet + content.slice(range.end);
			setIsDirty(true);
			setContent(next);
			setCommandHint(`Commande appliquee: ${normalized}`);
			setTimeout(() => {
				ta.focus();
				const pos = range.start + snippet.length;
				ta.setSelectionRange(pos, pos);
			}, 0);
			return true;
		}

		insertAtCursor(snippet);
		setCommandHint(`Commande appliquee: ${normalized}`);
		setSlashInput("");
		return true;
	}

	function handleUndo() {
		if (historyPast.length === 0) return;
		const previous = historyPast[historyPast.length - 1];
		setHistoryPast((prev) => prev.slice(0, -1));
		setHistoryFuture((prev) => [content, ...prev].slice(0, HISTORY_LIMIT));
		setContent(previous);
		setIsDirty(true);
		checkpointRef.current = previous;
	}

	function handleRedo() {
		if (historyFuture.length === 0) return;
		const next = historyFuture[0];
		setHistoryFuture((prev) => prev.slice(1));
		setHistoryPast((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), content]);
		setContent(next);
		setIsDirty(true);
		checkpointRef.current = next;
	}

	function handleEditorKeyDown(e) {
		if (e.key === "Enter") {
			const ta = textareaRef.current;
			if (ta) {
				const start = ta.selectionStart;
				const lineStart = content.lastIndexOf("\n", start - 1) + 1;
				const lineEndCandidate = content.indexOf("\n", start);
				const lineEnd = lineEndCandidate === -1 ? content.length : lineEndCandidate;
				const line = content.slice(lineStart, lineEnd).trim();
				if (line.startsWith("/")) {
					e.preventDefault();
					const ok = applySlashCommand(line.split(/\s+/)[0], true, { start: lineStart, end: lineEnd });
					if (!ok) toast.error("Commande slash inconnue");
					return;
				}
			}
		}

		if (!(e.ctrlKey || e.metaKey)) return;
		const key = e.key.toLowerCase();

		if (key === "z" && !e.shiftKey) {
			e.preventDefault();
			handleUndo();
			return;
		}

		if (key === "y" || (key === "z" && e.shiftKey)) {
			e.preventDefault();
			handleRedo();
			return;
		}

		if (key === "b") {
			e.preventDefault();
			wrapSelection("**");
			return;
		}

		if (key === "i") {
			e.preventDefault();
			wrapSelection("*");
			return;
		}

		if (key === "k") {
			e.preventDefault();
			const ta = textareaRef.current;
			if (!ta) return;
			const start = ta.selectionStart;
			const end = ta.selectionEnd;
			const selected = content.slice(start, end) || "texte";
			const markdownLink = `[${selected}](https://)`;
			const next = content.slice(0, start) + markdownLink + content.slice(end);
			setIsDirty(true);
			setContent(next);
			setTimeout(() => {
				ta.focus();
				const urlStart = start + markdownLink.lastIndexOf("https://");
				ta.setSelectionRange(urlStart, urlStart + "https://".length);
			}, 0);
			return;
		}

		if (e.altKey && key === "2") {
			e.preventDefault();
			insertAtCursor("\n## Sous-titre\n\n");
			return;
		}

		if (e.altKey && key === "3") {
			e.preventDefault();
			insertAtCursor("\n### Sous-section\n\n");
			return;
		}

		if (e.shiftKey && key === "8") {
			e.preventDefault();
			insertAtCursor("\n- Point\n");
			return;
		}

		if (e.shiftKey && key === "c") {
			e.preventDefault();
			insertAtCursor("\n```md\nVotre code ici\n```\n");
		}
	}

	function addSnippet(kind) {
		const snippets = {
			table: "\n| Colonne A | Colonne B |\n| --- | --- |\n| Valeur 1 | Valeur 2 |\n",
			cta: '\n::callout[Passer a l\'action]{type="success"}\n',
			checklist: "\n- [ ] Point 1\n- [ ] Point 2\n- [ ] Point 3\n",
			separator: "\n---\n",
		};
		insertAtCursor(snippets[kind] || "");
	}

	function generateSlugFromTitle() {
		const generated = slugify(title || "");
		if (!generated) {
			toast.error("Impossible de générer un slug avec ce titre");
			return;
		}
		setIsDirty(true);
		setSlug(generated);
		toast.success("Slug généré");
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

		const formData = buildFormDataPayload();

		const result = isEdit ? await updateArticle(article.id, formData) : await createArticle(formData);

		if (result?.error) {
			toast.error(result.error);
			setLoading(false);
			return;
		}

		if (isEdit) {
			toast.success("Article mis à jour");
			router.refresh();
			setIsDirty(false);
		} else {
			window.localStorage.removeItem(NEW_ARTICLE_DRAFT_KEY);
			setHistoryPast([]);
			setHistoryFuture([]);
			setIsDirty(false);
		}
		setLoading(false);
	}

	function applyTemplate() {
		const template = ARTICLE_TEMPLATES[templateKey];
		if (!template) return;
		const shouldOverwrite = !isEdit || (!title && !content) || window.confirm("Appliquer ce template et remplacer le contenu actuel ?");
		if (!shouldOverwrite) return;

		setTitle(template.title);
		setExcerpt(template.excerpt);
		setContent(template.content);
		setRequiredTier(template.requiredTier);
		setSlug(slugify(template.title));
		setIsDirty(true);
		toast.success(`Template \"${template.label}\" applique`);
	}

	const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
	const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
	const slugPreview = slugify(slug || title || "");
	const contentQuality = wordCount > 700 ? "Complet" : wordCount > 250 ? "Moyen" : "Court";
	const saveLabel = isEdit ? "Mettre à jour" : "Créer l'article";
	const titleSeoState = title.length >= 45 && title.length <= 65 ? "optimal" : title.length >= 30 && title.length <= 80 ? "ok" : "weak";
	const excerptSeoState = excerpt.length >= 120 && excerpt.length <= 160 ? "optimal" : excerpt.length >= 80 && excerpt.length <= 220 ? "ok" : "weak";

	return (
		<div className="grid gap-6 xl:grid-cols-[1fr_320px]">
			<form
				onSubmit={handleSubmit}
				className="space-y-6"
			>
				{/* Card 1 : Métadonnées */}
				<Card>
					<CardHeader>
						<CardTitle>Informations de base</CardTitle>
						<CardDescription>Titre, résumé, image de couverture</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Titre *</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => {
									setIsDirty(true);
									setTitle(e.target.value);
								}}
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
									onClick={generateSlugFromTitle}
								>
									<Wand2 className="mr-1 h-3.5 w-3.5" />
									Générer depuis le titre
								</Button>
							</div>
							<Input
								id="slug"
								value={slug}
								onChange={(e) => {
									setIsDirty(true);
									setSlug(e.target.value);
								}}
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
								onChange={(e) => {
									setIsDirty(true);
									setExcerpt(e.target.value);
								}}
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
								onChange={(v) => {
									setIsDirty(true);
									setCoverImage(v);
								}}
								name="coverImage"
								className="bg-neutral-50 shadow-inner"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Card 2 : Contenu markdown */}
				<Card className={clsx(isFocusMode && "fixed inset-4 z-50 overflow-auto bg-neutral-100 shadow-xl")}>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Contenu</CardTitle>
								<CardDescription>Markdown enrichi (Ctrl+B, Ctrl+I, Ctrl+K, Alt+2, Alt+3, Shift+8, Shift+C, Ctrl+Z/Y)</CardDescription>
							</div>
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleUndo}
									disabled={historyPast.length === 0}
									className="shadow-sm bg-white hover:bg-neutral-50"
								>
									<Undo2 className="mr-1 h-4 w-4" />
									Undo
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleRedo}
									disabled={historyFuture.length === 0}
									className="shadow-sm bg-white hover:bg-neutral-50"
								>
									<Redo2 className="mr-1 h-4 w-4" />
									Redo
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setViewMode("editor")}
									className={clsx(
										"text-neutral-900 active:shadow-inner active:bg-neutral-200",
										viewMode === "editor" ? "shadow-inner bg-neutral-200 hover:bg-neutral-200" : "shadow-sm bg-white hover:bg-neutral-50",
									)}
								>
									<EyeOff className="mr-1 h-4 w-4" />
									Editeur
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setViewMode("preview")}
									className={clsx(
										"text-neutral-900 active:shadow-inner active:bg-neutral-200",
										viewMode === "preview" ? "shadow-inner bg-neutral-200 hover:bg-neutral-200" : "shadow-sm bg-white hover:bg-neutral-50",
									)}
								>
									<Eye className="mr-1 h-4 w-4" />
									Apercu
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setViewMode("split")}
									className={clsx(
										"text-neutral-900 active:shadow-inner active:bg-neutral-200",
										viewMode === "split" ? "shadow-inner bg-neutral-200 hover:bg-neutral-200" : "shadow-sm bg-white hover:bg-neutral-50",
									)}
								>
									<Columns3 className="mr-1 h-4 w-4" />
									Split
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setIsFocusMode((v) => !v)}
									className="shadow-sm bg-white hover:bg-neutral-50"
								>
									{isFocusMode ? <Minimize2 className="mr-1 h-4 w-4" /> : <Focus className="mr-1 h-4 w-4" />}
									{isFocusMode ? "Quitter focus" : "Mode focus"}
								</Button>
							</div>
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
								className="shadow-sm bg-white text-neutral-900 hover:bg-neutral-50 active:shadow-inner active:bg-neutral-200"
							>
								Titre
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => handleMediaUpload("image", "image/*")}
								className="shadow-sm bg-white text-neutral-900 hover:bg-neutral-50 active:shadow-inner active:bg-neutral-200"
							>
								+ Image
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => handleMediaUpload("audio", "audio/*")}
								className="shadow-sm bg-white text-neutral-900 hover:bg-neutral-50 active:shadow-inner active:bg-neutral-200"
							>
								+ Audio
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => handleMediaUpload("pdf", "application/pdf")}
								className="shadow-sm bg-white text-neutral-900 hover:bg-neutral-50 active:shadow-inner active:bg-neutral-200"
							>
								+ PDF
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => insertAtCursor("\n::video[https://youtube.com/watch?v=ID]\n")}
								className="shadow-sm bg-white text-neutral-900 hover:bg-neutral-50 active:shadow-inner active:bg-neutral-200"
							>
								+ Vidéo YouTube
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => insertAtCursor('\n::callout[Information importante]{type="info"}\n')}
								className="shadow-sm bg-white text-neutral-900 hover:bg-neutral-50 active:shadow-inner active:bg-neutral-200"
							>
								+ Callout
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => insertAtCursor('\n::quote[Citation]{author="Auteur"}\n')}
								className="shadow-sm bg-white text-neutral-900 hover:bg-neutral-50 active:shadow-inner active:bg-neutral-200"
							>
								+ Citation
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => addSnippet("table")}
								className="shadow-sm bg-white text-neutral-900 hover:bg-neutral-50 active:shadow-inner active:bg-neutral-200"
							>
								+ Tableau
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => addSnippet("checklist")}
								className="shadow-sm bg-white text-neutral-900 hover:bg-neutral-50 active:shadow-inner active:bg-neutral-200"
							>
								+ Checklist
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => addSnippet("cta")}
								className="shadow-sm bg-white text-neutral-900 hover:bg-neutral-50 active:shadow-inner active:bg-neutral-200"
							>
								+ CTA
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => addSnippet("separator")}
								className="shadow-sm bg-white text-neutral-900 hover:bg-neutral-50 active:shadow-inner active:bg-neutral-200"
							>
								+ Séparateur
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => insertAtCursor("\n```md\nVotre code ici\n```\n")}
								className="shadow-sm bg-white text-neutral-900 hover:bg-neutral-50 active:shadow-inner active:bg-neutral-200"
							>
								<Code2 className="mr-1 h-3.5 w-3.5" />+ Code
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => insertAtCursor("\n- Point 1\n- Point 2\n")}
								className="shadow-sm bg-white text-neutral-900 hover:bg-neutral-50 active:shadow-inner active:bg-neutral-200"
							>
								<List className="mr-1 h-3.5 w-3.5" />+ Liste
							</Button>
						</div>

						<div className="rounded-md border bg-muted/20 p-3 space-y-2">
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<Input
									value={slashInput}
									onChange={(e) => setSlashInput(e.target.value)}
									placeholder="Commande rapide (ex: /callout, /video, /quote)"
									className="bg-white"
								/>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										if (!slashInput.trim()) return;
										const ok = applySlashCommand(slashInput.trim().split(/\s+/)[0]);
										if (!ok) toast.error("Commande slash inconnue");
									}}
								>
									Appliquer /commande
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">Commandes: /h2, /h3, /list, /code, /callout, /quote, /video</p>
							{commandHint ? <p className="text-xs text-primary">{commandHint}</p> : null}
						</div>

						{/* Éditeur ou Aperçu */}
						{viewMode === "preview" ? (
							<div className="min-h-100 rounded-md border p-6 bg-white">
								{content ? <ArticleContent content={content} /> : <p className="text-muted-foreground">Aperçu vide. Écris du contenu pour le voir ici.</p>}
							</div>
						) : viewMode === "split" ? (
							<div className="grid gap-3 lg:grid-cols-2">
								<Textarea
									ref={textareaRef}
									value={content}
									onChange={(e) => {
										setIsDirty(true);
										setContent(e.target.value);
									}}
									placeholder="Commence à écrire ton article en markdown..."
									rows={20}
									className="font-mono text-sm bg-neutral-50 shadow-inner"
									onKeyDown={handleEditorKeyDown}
									required
								/>
								<div className="min-h-100 rounded-md border p-6 bg-white overflow-auto">
									{content ? <ArticleContent content={content} /> : <p className="text-muted-foreground">Aperçu vide. Écris du contenu pour le voir ici.</p>}
								</div>
							</div>
						) : (
							<Textarea
								ref={textareaRef}
								value={content}
								onChange={(e) => {
									setIsDirty(true);
									setContent(e.target.value);
								}}
								placeholder="Commence à écrire ton article en markdown..."
								rows={20}
								className="font-mono text-sm bg-neutral-50 shadow-inner"
								onKeyDown={handleEditorKeyDown}
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
								onValueChange={(value) => {
									setIsDirty(true);
									setRequiredTier(value);
								}}
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
						variant="secondary"
						onClick={() => {
							if (!isEdit) {
								toast.info("Le brouillon est créé au premier enregistrement");
								return;
							}
							const form = document.querySelector("form");
							if (form) form.requestSubmit();
						}}
						disabled={loading || !isDirty}
					>
						<Sparkles className="mr-1 h-4 w-4" />
						Sauvegarder brouillon
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push("/admin/articles")}
						className="shadow-sm bg-white text-neutral-900 hover:bg-neutral-50 active:shadow-inner active:bg-neutral-200"
					>
						Annuler
					</Button>
					<Button
						type="submit"
						disabled={loading}
					>
						{loading ? "Enregistrement..." : saveLabel}
					</Button>
				</div>
			</form>

			<aside className={clsx("space-y-4 xl:sticky xl:top-6 h-fit", isFocusMode && "hidden")}>
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Templates d&apos;article</CardTitle>
						<CardDescription>Démarre rapidement avec une structure prête à remplir.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Select
							value={templateKey}
							onValueChange={setTemplateKey}
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
							onClick={applyTemplate}
						>
							Appliquer le template
						</Button>
					</CardContent>
				</Card>

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
			</aside>
		</div>
	);
}
