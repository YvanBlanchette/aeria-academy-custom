"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, FileText, Headphones, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadLessonFile } from "@/app/admin/upload/lesson-actions";

const TYPE_CONFIG = {
	PDF: {
		icon: FileText,
		accept: "application/pdf",
		label: "PDF",
		hint: "Document PDF · 20 MB max",
		allowUpload: true,
	},
	AUDIO: {
		icon: Headphones,
		accept: "audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm",
		label: "audio",
		hint: "MP3, M4A, WAV, OGG ou WebM · 50 MB max",
		allowUpload: true,
	},
	VIDEO: {
		icon: Video,
		accept: null,
		label: "vidéo",
		hint: null,
		allowUpload: false, // 👈 Vidéo = URL uniquement (YouTube/Vimeo)
	},
};

export function LessonFileUpload({ type, value, onChange, name }) {
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef(null);
	const config = TYPE_CONFIG[type];

	if (!config) return null;
	const Icon = config.icon;

	async function handleFileChange(e) {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploading(true);
		const formData = new FormData();
		formData.set("file", file);
		formData.set("type", type);

		const result = await uploadLessonFile(formData);
		setUploading(false);

		if (result.error) {
			toast.error(result.error);
			return;
		}

		toast.success("Fichier uploadé");
		onChange(result.url);
	}

	function handleRemove() {
		onChange("");
		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	const isUploadedFile = value?.startsWith("/uploads/");

	return (
		<div className="space-y-3">
			{/* Input URL — toujours dispo */}
			<Input
				type="url"
				value={value || ""}
				onChange={(e) => onChange(e.target.value)}
				placeholder={type === "VIDEO" ? "https://youtube.com/watch?v=... ou https://vimeo.com/..." : "https://... ou utilise l'upload ci-dessous"}
				name={name}
				className="bg-neutral-50 shadow-inner"
			/>

			{/* Section upload — masquée pour VIDEO */}
			{config.allowUpload && (
				<>
					{isUploadedFile ? (
						<div className="flex items-center gap-2 rounded-md border bg-muted/30 p-3">
							<Icon className="h-5 w-5 text-muted-foreground" />
							<span className="text-sm flex-1 truncate">{value.split("/").pop()}</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={handleRemove}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					) : (
						<div
							className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
							onClick={() => fileInputRef.current?.click()}
						>
							{uploading ? (
								<div className="flex flex-col items-center gap-2 text-muted-foreground">
									<Loader2 className="h-6 w-6 animate-spin" />
									<p className="text-sm">Upload en cours...</p>
								</div>
							) : (
								<div className="flex flex-col items-center gap-2 text-muted-foreground">
									<Upload className="h-6 w-6" />
									<p className="text-sm font-medium">Cliquer pour uploader un {config.label}</p>
									<p className="text-xs">{config.hint}</p>
								</div>
							)}
						</div>
					)}

					<input
						ref={fileInputRef}
						type="file"
						accept={config.accept}
						onChange={handleFileChange}
						disabled={uploading}
						className="hidden"
					/>
				</>
			)}

			{/* Indicateur visuel pour VIDEO */}
			{type === "VIDEO" && <p className="text-xs text-muted-foreground">💡 Colle une URL YouTube ou Vimeo (les vidéos directes ne sont pas supportées ici)</p>}
		</div>
	);
}
