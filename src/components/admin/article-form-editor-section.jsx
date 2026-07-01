import clsx from "clsx";
import {
	Bold,
	Code2,
	Columns3,
	Eye,
	EyeOff,
	Focus,
	Heading2,
	Heading3,
	Italic,
	Link2,
	List,
	ListOrdered,
	Minimize2,
	Redo2,
	Underline,
	Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
import { ArticleContent } from "@/components/articles/article-content";
import ButtonTooltip from "../ui/button-tooltip";

export function ArticleFormEditorSection({
	isFocusMode,
	onToggleFocusMode,
	viewMode,
	onViewModeChange,
	onUndo,
	onRedo,
	canUndo,
	canRedo,
	onSaveDraft,
	onSubmitForm,
	onQuitEditor,
	onWrapBold,
	onWrapItalic,
	onWrapUnderline,
	onInsertMarkdownLink,
	onMediaUpload,
	onInsertYouTube,
	onAddTable,
	onAddChecklist,
	onInsertCodeBlock,
	onAddSeparator,
	onInsertSubtitle,
	onRemoveStyles,
	onInsertH1,
	onInsertH2,
	onInsertH3,
	onInsertBulletList,
	onInsertNumberedList,
	onInsertQuote,
	onGenerateSlug,
	onApplyTemplate,
	onCopyMarkdown,
	onShowStats,
	onOpenCommandPalette,
	showQuickToolbar,
	onToggleQuickToolbar,
	isRightPanelOpen,
	onToggleRightPanel,
	rightPanelSections,
	onToggleRightPanelSection,
	hasTextSelection,
	onSyncSelectionState,
	textareaRef,
	content,
	onContentChange,
	onEditorKeyDown,
	onCommandPaletteOpenChange,
}) {
	return (
		<>
			<Card className={clsx(isFocusMode && "fixed inset-4 z-50 overflow-auto bg-neutral-100 shadow-xl p-0")}>
				{/* <CardHeader>
					<div className="flex items-center justify-between px-4.5 pt-6 -mb-3">
						<div>
							<CardTitle className="text-2xl">Éditeur</CardTitle>
						</div>
					</div>
				</CardHeader> */}
				<CardContent className="relative space-y-4 pt-4 px-0">
					<div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-1 px-6 -mb-px">
						<div>
							<DropdownMenu modal={false}>
								<DropdownMenuTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-8 min-w-20 px-2 py-2 text-sm whitespace-nowrap rounded-b-none"
									>
										Fichier
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start">
									<DropdownMenuItem onSelect={onSaveDraft}>Sauvegarder brouillon</DropdownMenuItem>
									<DropdownMenuItem onSelect={onSubmitForm}>Enregistrer article</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onSelect={onQuitEditor}>Quitter l&apos;editeur</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/*  ÉDITION */}
							<DropdownMenu modal={false}>
								<DropdownMenuTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-8 min-w-20 px-2 py-2 text-sm whitespace-nowrap rounded-b-none"
									>
										Edition
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start">
									<DropdownMenuItem onSelect={onUndo}>Annuler</DropdownMenuItem>
									<DropdownMenuItem onSelect={onRedo}>Retablir</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onSelect={onWrapBold}>Gras</DropdownMenuItem>
									<DropdownMenuItem onSelect={onWrapItalic}>Italique</DropdownMenuItem>
									<DropdownMenuItem onSelect={onWrapUnderline}>Sous-ligne</DropdownMenuItem>
									<DropdownMenuItem onSelect={onInsertMarkdownLink}>Lien</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/*  INSERTION */}
							<DropdownMenu modal={false}>
								<DropdownMenuTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-8 min-w-20 px-2 py-2 text-sm whitespace-nowrap rounded-b-none"
									>
										Insertion
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start">
									<DropdownMenuItem onSelect={() => onMediaUpload("image", "image/*")}>Image</DropdownMenuItem>
									<DropdownMenuItem onSelect={() => onMediaUpload("audio", "audio/*")}>Audio</DropdownMenuItem>
									<DropdownMenuItem onSelect={() => onMediaUpload("pdf", "application/pdf")}>PDF</DropdownMenuItem>
									<DropdownMenuItem onSelect={onInsertYouTube}>Video YouTube</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onSelect={onAddTable}>Tableau</DropdownMenuItem>
									<DropdownMenuItem onSelect={onAddChecklist}>Checklist</DropdownMenuItem>
									<DropdownMenuItem onSelect={onInsertCodeBlock}>Bloc code</DropdownMenuItem>
									<DropdownMenuItem onSelect={onAddSeparator}>Separateur</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/*  FORMAT */}
							<DropdownMenu modal={false}>
								<DropdownMenuTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-8 min-w-20 px-2 py-2 text-sm whitespace-nowrap rounded-b-none"
									>
										Format
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start">
									<DropdownMenuItem onSelect={onInsertH2}>Titre H2</DropdownMenuItem>
									<DropdownMenuItem onSelect={onInsertH3}>Titre H3</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onSelect={onInsertBulletList}>Liste a puces</DropdownMenuItem>
									<DropdownMenuItem onSelect={onInsertNumberedList}>Liste numerotee</DropdownMenuItem>
									<DropdownMenuItem onSelect={onInsertQuote}>Citation</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/*  OUTILS */}
							<DropdownMenu modal={false}>
								<DropdownMenuTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-8 min-w-20 px-2 py-2 text-sm whitespace-nowrap rounded-b-none"
									>
										Outils
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start">
									<DropdownMenuItem onSelect={onGenerateSlug}>Generer slug depuis le titre</DropdownMenuItem>
									<DropdownMenuItem onSelect={onApplyTemplate}>Appliquer template courant</DropdownMenuItem>
									<DropdownMenuItem onSelect={onCopyMarkdown}>Copier markdown</DropdownMenuItem>
									<DropdownMenuItem onSelect={onOpenCommandPalette}>Palette de commandes</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onSelect={onShowStats}>Statistiques du texte</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/*  AFFICHAGE */}
							<DropdownMenu modal={false}>
								<DropdownMenuTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-8 min-w-20 px-2 py-2 text-sm whitespace-nowrap rounded-b-none"
									>
										Affichage
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start">
									<DropdownMenuItem onSelect={() => onViewModeChange("editor")}>Mode Editeur</DropdownMenuItem>
									<DropdownMenuItem onSelect={() => onViewModeChange("preview")}>Mode Apercu</DropdownMenuItem>
									<DropdownMenuItem onSelect={() => onViewModeChange("split")}>Mode Split</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuCheckboxItem
										checked={isFocusMode}
										onCheckedChange={onToggleFocusMode}
									>
										Mode focus
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem onCheckedChange={onToggleQuickToolbar}>Afficher barre rapide</DropdownMenuCheckboxItem>
									<DropdownMenuSeparator />
									<DropdownMenuCheckboxItem
										checked={isRightPanelOpen}
										onCheckedChange={onToggleRightPanel}
									>
										Afficher panneau droit
									</DropdownMenuCheckboxItem>
									<DropdownMenuLabel>Sections panneau droit</DropdownMenuLabel>
									<DropdownMenuCheckboxItem
										checked={rightPanelSections.templates}
										onCheckedChange={() => onToggleRightPanelSection("templates")}
									>
										Templates
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={rightPanelSections.seo}
										onCheckedChange={() => onToggleRightPanelSection("seo")}
									>
										SEO
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={rightPanelSections.quality}
										onCheckedChange={() => onToggleRightPanelSection("quality")}
									>
										Qualite
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={rightPanelSections.checklist}
										onCheckedChange={() => onToggleRightPanelSection("checklist")}
									>
										Checklist
									</DropdownMenuCheckboxItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					{hasTextSelection ? (
						<div className="sticky top-11 z-20 inline-flex w-fit items-center gap-1 rounded-lg border bg-background/95 p-1 shadow-lg backdrop-blur">
							<ButtonTooltip
								type="button"
								variant="ghost"
								size="sm"
								className="h-8 px-2 text-xl font-bold"
								onClick={onWrapBold}
								label="Gras Ctrl+B"
							>
								<Bold />
							</ButtonTooltip>
							<ButtonTooltip
								type="button"
								variant="ghost"
								size="sm"
								className="h-8 px-2 text-xl italic"
								onClick={onWrapItalic}
								label="Italique Ctrl+I"
							>
								<Italic />
							</ButtonTooltip>
							<ButtonTooltip
								type="button"
								variant="ghost"
								size="sm"
								className="h-8 px-2"
								onClick={onWrapUnderline}
								label="Souligné Ctrl+U"
							>
								<Underline />
							</ButtonTooltip>
							<ButtonTooltip
								type="button"
								variant="ghost"
								size="sm"
								className="h-8 px-2"
								onClick={onInsertMarkdownLink}
								label="Lien"
							>
								<Link2 />
							</ButtonTooltip>
						</div>
					) : null}

					{showQuickToolbar ? (
						// QUICK TOOLBAR
						<div className="flex flex-wrap justify-between items-center bg-muted py-2 px-8 mt-0 border-b-2 border-border">
							<div className="flex justify-start items-center gap-0.5">
								{/* STYLES */}
								<DropdownMenu modal={false}>
									<DropdownMenuTrigger asChild>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="bg-muted px-3 hover:bg-muted/80 rounded-l-full"
										>
											Styles
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start">
										<DropdownMenuItem onSelect={onRemoveStyles}>Texte</DropdownMenuItem>
										<DropdownMenuItem onSelect={onInsertH1}>Titre</DropdownMenuItem>
										<DropdownMenuItem onSelect={onInsertSubtitle}>Sous-titre</DropdownMenuItem>
										<DropdownMenuItem onSelect={onInsertH2}>Titre 2</DropdownMenuItem>
										<DropdownMenuItem onSelect={onInsertH3}>Titre 3</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>

								{/* BOLD */}
								<ButtonTooltip
									type="button"
									variant="ghost"
									size="sm"
									onClick={onWrapBold}
									className="bg-muted hover:muted/80 rounded-none"
									label="Gras Ctrl+B"
									side="bottom"
								>
									<Bold className="h-4 w-4" />
								</ButtonTooltip>

								{/* ITALIC */}
								<ButtonTooltip
									type="button"
									variant="ghost"
									size="sm"
									onClick={onWrapItalic}
									className="bg-muted hover:muted/80 rounded-none"
									label="Italique Ctrl+I"
									side="bottom"
								>
									<Italic className="h-4 w-4" />
								</ButtonTooltip>

								{/* UNDERLINE */}
								<ButtonTooltip
									type="button"
									variant="ghost"
									size="sm"
									onClick={onWrapUnderline}
									className="bg-muted hover:muted/80 rounded-none"
									label="Souligné Ctrl+U"
									side="bottom"
								>
									<Underline className="h-4 w-4" />
								</ButtonTooltip>

								{/* LINK */}
								<ButtonTooltip
									type="button"
									variant="ghost"
									size="sm"
									onClick={onInsertMarkdownLink}
									className="bg-muted hover:muted/80 rounded-none"
									label="Lien Ctrl+K"
									side="bottom"
								>
									<Link2 className="h-4 w-4" />
								</ButtonTooltip>

								{/* BULLET LIST */}
								<ButtonTooltip
									type="button"
									variant="ghost"
									size="sm"
									onClick={onInsertBulletList}
									className="bg-muted hover:muted/80 rounded-none"
									label="Liste à puces"
									side="bottom"
								>
									<List className="h-4 w-4" />
								</ButtonTooltip>

								{/* NUMBERED LIST */}
								<ButtonTooltip
									type="button"
									variant="ghost"
									size="sm"
									onClick={onInsertNumberedList}
									className="bg-muted hover:muted/80 rounded-r-full"
									label="Liste numerotée"
									side="bottom"
								>
									<ListOrdered className="h-4 w-4" />
								</ButtonTooltip>
							</div>

							<div className="flex justify-end items-center gap-0.5">
								{/* UNDO */}
								<ButtonTooltip
									type="button"
									variant="ghost"
									size="sm"
									onClick={onUndo}
									disabled={!canUndo}
									className="bg-muted hover:muted/80 rounded-l-full"
									label="Undo Ctrl+Z"
									side="bottom"
								>
									<Undo2 className="mr-1 h-4 w-4" />
								</ButtonTooltip>

								{/* REDO */}
								<ButtonTooltip
									type="button"
									variant="ghost"
									size="sm"
									onClick={onRedo}
									disabled={!canRedo}
									className="bg-muted hover:muted/80 rounded-r-full"
									label="Redo Ctrl+Y"
									side="bottom"
								>
									<Redo2 className="mr-1 h-4 w-4" />
								</ButtonTooltip>
							</div>
						</div>
					) : null}

					{/* PREVIEW */}
					{viewMode === "preview" ? (
						<div className="min-h-100 rounded-md border p-6 bg-white">
							{content ? <ArticleContent content={content} /> : <p className="text-muted-foreground">Aperçu vide. Écris du contenu pour le voir ici.</p>}
						</div>
					) : viewMode === "split" ? (
						<div className="grid gap-3 lg:grid-cols-2">
							<Textarea
								ref={textareaRef}
								value={content}
								onChange={(e) => onContentChange(e.target.value)}
								placeholder="Commence à écrire ton article en markdown..."
								rows={20}
								className="font-mono text-sm bg-white px-12 rounded-none py-6 border-none focus-within:ring-0"
								onKeyDown={onEditorKeyDown}
								onSelect={onSyncSelectionState}
								onKeyUp={onSyncSelectionState}
								onMouseUp={onSyncSelectionState}
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
							onChange={(e) => onContentChange(e.target.value)}
							placeholder="Commence à écrire ton article en markdown..."
							rows={20}
							className="font-mono text-sm bg-white px-12 rounded-none py-6 border-none focus:ring-0"
							onSelect={onSyncSelectionState}
							onKeyUp={onSyncSelectionState}
							onMouseUp={onSyncSelectionState}
							required
						/>
					)}
				</CardContent>
			</Card>
		</>
	);
}
