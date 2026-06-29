"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createLesson, updateLesson } from "@/app/admin/courses/[id]/modules/[moduleId]/actions";
import { LessonFileUpload } from "../ui/lesson-file-upload";

const contentLabels = {
	VIDEO: { label: "Vidéo (URL YouTube/Vimeo ou upload)", placeholder: "https://youtube.com/watch?v=..." },
	AUDIO: { label: "Fichier audio (URL ou upload)", placeholder: "https://.../capsule.mp3" },
	TEXT: { label: "Contenu (Markdown supporté)", placeholder: "# Mon contenu..." },
	PDF: { label: "Document PDF (URL ou upload)", placeholder: "https://.../document.pdf" },
};

export function LessonForm({ courseId, moduleId, lesson }) {
	const router = useRouter();
	const [content, setContent] = useState(lesson?.content || "");
	const [loading, setLoading] = useState(false);
	const [type, setType] = useState(lesson?.type || "VIDEO");
	const [audioUrl, setAudioUrl] = useState(lesson?.audioUrl || "");
	const [audioUrlExpress, setAudioUrlExpress] = useState(lesson?.audioUrlExpress || "");
	const isEdit = !!lesson;

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);

		const fd = new FormData(e.currentTarget);
		fd.set("content", content);
		fd.set("audioUrl", audioUrl);
		fd.set("audioUrlExpress", audioUrlExpress);
		const result = isEdit ? await updateLesson(courseId, moduleId, lesson.id, fd) : await createLesson(courseId, moduleId, fd);

		if (result?.error) {
			toast.error(result.error);
			setLoading(false);
			return;
		}

		if (isEdit) {
			toast.success("Leçon mise à jour");
			router.refresh();
		}
		setLoading(false);
	}

	const contentField = contentLabels[type];

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6 w-full"
		>
			<div className="space-y-2">
				<Label htmlFor="title">Titre de la leçon *</Label>
				<Input
					id="title"
					name="title"
					defaultValue={lesson?.title}
					placeholder="Ex: Bienvenue dans AERIA"
					required
					className="bg-neutral-50 shadow-inner"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="type">Type *</Label>
				<Select
					name="type"
					value={type}
					onValueChange={setType}
				>
					<SelectTrigger className="bg-neutral-50 shadow-inner">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="VIDEO">Vidéo</SelectItem>
						<SelectItem value="AUDIO">Capsule audio</SelectItem>
						<SelectItem value="TEXT">Texte / Markdown</SelectItem>
						<SelectItem value="PDF">Document PDF</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="content">{contentField.label} *</Label>

				{type === "TEXT" ? (
					<Textarea
						id="content"
						name="content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder={contentField.placeholder}
						rows={12}
						required
						className="bg-neutral-50 shadow-inner"
					/>
				) : (
					<LessonFileUpload
						type={type}
						value={content}
						onChange={setContent}
						name="content"
					/>
				)}
			</div>

			{/* Capsule audio optionnelle (pour les leçons TEXT principalement) */}
			{type === "TEXT" && (
				<>
					<div className="space-y-2">
						<Label htmlFor="audioUrl">Capsule audio (version régulière optionnel)</Label>
						<p className="text-xs text-muted-foreground">Version principale de la capsule audio, jouée par défaut.</p>
						<LessonFileUpload
							type="AUDIO"
							value={audioUrl}
							onChange={setAudioUrl}
							name="audioUrl"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="audioUrlExpress">Capsule audio (version express optionnel)</Label>
						<p className="text-xs text-muted-foreground">
							Version courte ou condensée. L&apos;étudiant peut basculer entre les deux versions depuis le lecteur.
						</p>
						<LessonFileUpload
							type="AUDIO"
							value={audioUrlExpress}
							onChange={setAudioUrlExpress}
							name="audioUrlExpress"
						/>
					</div>
				</>
			)}

			<div className="space-y-2">
				<Label htmlFor="duration">Durée (en secondes)</Label>
				<Input
					id="duration"
					name="duration"
					type="number"
					min="0"
					defaultValue={lesson?.duration || ""}
					placeholder="Ex: 300 pour 5 min"
					className="bg-neutral-50 shadow-inner"
				/>
			</div>

			<div className="flex gap-3">
				<Button
					type="submit"
					disabled={loading}
				>
					{loading ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer la leçon"}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push(`/admin/courses/${courseId}/modules/${moduleId}`)}
				>
					Annuler
				</Button>
			</div>
		</form>
	);
}
