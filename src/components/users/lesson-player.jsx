"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function VideoPlayer({ url }) {
	// YouTube embed
	const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?]+)/);
	if (ytMatch) {
		return (
			<div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
				<iframe
					src={`https://www.youtube.com/embed/${ytMatch[1]}`}
					className="h-full w-full"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				/>
			</div>
		);
	}
	// Vimeo embed
	const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
	if (vimeoMatch) {
		return (
			<div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
				<iframe
					src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
					className="h-full w-full"
					allow="autoplay; fullscreen; picture-in-picture"
					allowFullScreen
				/>
			</div>
		);
	}
	// Fichier MP4/WebM direct
	return (
		<div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
			<video
				src={url}
				controls
				className="h-full w-full"
			/>
		</div>
	);
}

function AudioPlayer({ url }) {
	return (
		<div className="rounded-lg border bg-card p-6">
			<audio
				src={url}
				controls
				className="w-full"
			/>
		</div>
	);
}

function PdfViewer({ url }) {
	return (
		<div className="space-y-2">
			<div className="aspect-[4/3] w-full overflow-hidden rounded-lg border">
				<iframe
					src={url}
					className="h-full w-full"
					title="PDF"
				/>
			</div>
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				className="text-sm text-primary hover:underline"
			>
				Ouvrir dans un nouvel onglet ↗
			</a>
		</div>
	);
}

function TextRenderer({ content }) {
	return (
		<div className="prose prose-slate max-w-none dark:prose-invert">
			<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
		</div>
	);
}

export function LessonPlayer({ lesson }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	// Évite les soucis d'hydratation pour les players client
	if (!mounted && lesson.type !== "TEXT") {
		return <div className="aspect-video w-full rounded-lg bg-muted animate-pulse" />;
	}

	switch (lesson.type) {
		case "VIDEO":
			return <VideoPlayer url={lesson.content} />;
		case "AUDIO":
			return <AudioPlayer url={lesson.content} />;
		case "TEXT":
			return <TextRenderer content={lesson.content} />;
		case "PDF":
			return <PdfViewer url={lesson.content} />;
		default:
			return <p className="text-muted-foreground">Type de leçon non supporté</p>;
	}
}
