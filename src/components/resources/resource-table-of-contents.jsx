"use client";

import { useEffect, useState } from "react";

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

export function ResourceTableOfContents({ containerId }) {
	const [items, setItems] = useState([]);
	const [activeId, setActiveId] = useState(null);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const container = document.getElementById(containerId);
		if (!container) {
			queueMicrotask(() => {
				setItems([]);
				setActiveId(null);
			});
			return;
		}

		const slugCounts = new Map();
		const headings = Array.from(container.querySelectorAll("h2, h3"))
			.map((heading) => {
				const title = (heading.textContent || "").trim();
				if (!title) return null;

				if (!heading.id) {
					const baseSlug = slugifyHeading(title) || "section";
					const count = slugCounts.get(baseSlug) || 0;
					slugCounts.set(baseSlug, count + 1);
					heading.id = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
				}

				return {
					id: heading.id,
					title,
					level: Number(heading.tagName.replace("H", "")),
				};
			})
			.filter(Boolean);

		queueMicrotask(() => {
			setItems(headings);
			setActiveId(headings[0]?.id || null);
		});
	}, [containerId]);

	useEffect(() => {
		if (typeof window === "undefined" || items.length === 0) return;

		const elements = items.map((item) => document.getElementById(item.id)).filter(Boolean);
		if (elements.length === 0) return;

		const visible = new Map();
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						visible.set(entry.target.id, entry.boundingClientRect.top);
					} else {
						visible.delete(entry.target.id);
					}
				});

				const topVisible = Array.from(visible.entries()).sort((a, b) => a[1] - b[1])[0]?.[0];
				if (topVisible) {
					setActiveId(topVisible);
					return;
				}

				const fallback = elements
					.slice()
					.reverse()
					.find((el) => el.getBoundingClientRect().top <= 140);
				setActiveId(fallback?.id || items[0].id);
			},
			{ rootMargin: "-110px 0px -60% 0px", threshold: [0, 1] },
		);

		elements.forEach((el) => observer.observe(el));

		return () => observer.disconnect();
	}, [items]);

	if (items.length === 0) {
		return <p className="text-sm text-muted-foreground">Aucune section detectee dans cette ressource.</p>;
	}

	return (
		<ol className="space-y-1.5">
			{items.map((item, index) => (
				<li key={item.id}>
					<a
						href={`#${item.id}`}
						aria-current={activeId === item.id ? "location" : undefined}
						className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
							activeId === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
						}`}
						style={{ marginLeft: item.level === 3 ? "0.8rem" : 0 }}
					>
						<span className="inline-flex items-center gap-2">
							<span className="text-[11px] opacity-70">{index + 1}.</span>
							<span className="line-clamp-2">{item.title}</span>
						</span>
					</a>
				</li>
			))}
		</ol>
	);
}
