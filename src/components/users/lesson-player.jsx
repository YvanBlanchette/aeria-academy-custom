"use client";

import { useEffect, useRef, useState } from "react";
import { List, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function slugifyHeading(value) {
	return value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

function flattenNodeText(node) {
	if (typeof node === "string" || typeof node === "number") {
		return String(node);
	}

	if (Array.isArray(node)) {
		return node.map(flattenNodeText).join("");
	}

	if (node && typeof node === "object" && "props" in node) {
		return flattenNodeText(node.props?.children);
	}

	return "";
}

function TableOfContents({ items, activeId }) {
	if (items.length === 0) {
		return <p className="text-sm text-muted-foreground">Aucun intertitre h2 detecte dans cette lecon.</p>;
	}

	return (
		<ol className="space-y-2">
			{items.map((item, index) => (
				<li key={item.id}>
					<a
						href={`#${item.id}`}
						aria-current={activeId === item.id ? "location" : undefined}
						className={[
							"flex items-center gap-2 rounded-none px-3 py-2 text-sm transition-colors",
							activeId === item.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
						].join(" ")}
					>
						<span className={["inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-[11px] font-semibold"].join(" ")}>
							{index + 1}
						</span>
						<span className="line-clamp-2 flex-1">{item.title}</span>
					</a>
				</li>
			))}
		</ol>
	);
}

function createHeadingRenderer(tagName) {
	const slugCounts = new Map();

	return function Heading({ children, ...props }) {
		const title = flattenNodeText(children).trim();
		const baseSlug = slugifyHeading(title) || "section";
		const count = slugCounts.get(baseSlug) ?? 0;
		slugCounts.set(baseSlug, count + 1);

		const id = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
		const Tag = tagName;

		return (
			<Tag
				id={id}
				className="scroll-mt-24"
				{...props}
			>
				{children}
			</Tag>
		);
	};
}

function VideoPlayer({ url }) {
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
			<div className="aspect-4/3 w-full overflow-hidden rounded-lg border">
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

function TextRenderer({ content, lessonTitle }) {
	const articleRef = useRef(null);
	const [tableOfContents, setTableOfContents] = useState([]);
	const [activeId, setActiveId] = useState(null);
	const headingComponents = {
		h1: createHeadingRenderer("h1"),
		h2: createHeadingRenderer("h2"),
		h3: createHeadingRenderer("h3"),
	};

	useEffect(() => {
		const articleElement = articleRef.current;

		if (!articleElement) {
			setTableOfContents([]);
			setActiveId(null);
			return;
		}

		const headings = [...articleElement.querySelectorAll("h2")]
			.map((element) => ({
				id: element.id,
				title: element.textContent?.trim() ?? "",
				level: Number(element.tagName.replace("H", "")),
			}))
			.filter((item) => item.id && item.title);

		setTableOfContents(headings);
		setActiveId(headings[0]?.id ?? null);
	}, [content]);

	useEffect(() => {
		if (tableOfContents.length === 0 || typeof window === "undefined") {
			setActiveId(null);
			return undefined;
		}

		setActiveId(tableOfContents[0].id);

		const headingElements = tableOfContents.map((item) => document.getElementById(item.id)).filter(Boolean);

		if (headingElements.length === 0) {
			return undefined;
		}

		const visibleHeadings = new Map();
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						visibleHeadings.set(entry.target.id, entry.boundingClientRect.top);
					} else {
						visibleHeadings.delete(entry.target.id);
					}
				});

				const topVisibleHeading = [...visibleHeadings.entries()].sort((a, b) => a[1] - b[1])[0]?.[0];

				if (topVisibleHeading) {
					setActiveId(topVisibleHeading);
					return;
				}

				const fallback = [...headingElements].reverse().find((element) => element.getBoundingClientRect().top <= 140);

				setActiveId(fallback?.id ?? tableOfContents[0].id);
			},
			{
				rootMargin: "-96px 0px -55% 0px",
				threshold: [0, 1],
			},
		);

		headingElements.forEach((element) => observer.observe(element));

		const handleHashChange = () => {
			const hash = window.location.hash.replace("#", "");
			if (hash) {
				setActiveId(hash);
			}
		};

		window.addEventListener("hashchange", handleHashChange);

		return () => {
			observer.disconnect();
			window.removeEventListener("hashchange", handleHashChange);
		};
	}, [content, tableOfContents]);

	return (
		<div className="relative">
			<div className="fixed right-4 top-26 z-40 flex w-fit justify-end">
				<Sheet>
					<SheetTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							className="h-8 w-8 p-0 gap-0 rounded-full border-border shadow-lg cursor-pointer hover:-translate-x-1 transition-transform bg-white hover:bg-white border sm:h-7 sm:w-auto sm:px-2.5 sm:gap-2"
						>
							<List className="h-4 w-4" />
							<span className="max-sm:hidden">Sommaire</span>
						</Button>
					</SheetTrigger>
					<SheetContent
						className="w-full gap-0 p-0 sm:max-w-md"
						overlayClassName="bg-black/5 supports-backdrop-filter:backdrop-blur-none"
						showCloseButton={false}
					>
						<SheetClose asChild>
							<Button
								variant="ghost"
								size="icon-sm"
								className="absolute left-1 top-1 z-10"
							>
								<X className="h-4 w-4" />
								<span className="sr-only">Fermer le sommaire</span>
							</Button>
						</SheetClose>
						<div className="border-b h-[90px] flex items-center justify-center bg-white px-6">
							<Logo
								locale="fr"
								scrolled
								size="md"
							/>
						</div>
						<div className="border-b px-4 py-4">
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground text-center">Table des matieres</p>
						</div>
						<div className="bg-white px-0 py-2">
							<TableOfContents
								items={tableOfContents}
								activeId={activeId}
							/>
						</div>
					</SheetContent>
				</Sheet>
			</div>

			<div
				ref={articleRef}
				className="prose prose-slate max-w-none pr-0 pt-6 dark:prose-invert sm:pr-4"
			>
				<ReactMarkdown
					remarkPlugins={[remarkGfm]}
					components={headingComponents}
				>
					{content}
				</ReactMarkdown>
			</div>
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
			return (
				<TextRenderer
					content={lesson.content}
					lessonTitle={lesson.title}
				/>
			);
		case "PDF":
			return <PdfViewer url={lesson.content} />;
		default:
			return <p className="text-muted-foreground">Type de leçon non supporté</p>;
	}
}
