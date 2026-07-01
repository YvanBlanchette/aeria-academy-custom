"use client";

import Link from "next/link";

const COOKIE_NAME = "dashboard_courses_view";
const ONE_YEAR = 60 * 60 * 24 * 365;

function persistView(view) {
	document.cookie = `${COOKIE_NAME}=${view}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

export function CoursesViewToggle({ currentView, cardsHref, listHref }) {
	return (
		<div className="flex items-center gap-2">
			<Link
				href={cardsHref}
				onClick={() => persistView("cards")}
				className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
					currentView === "cards" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
				}`}
			>
				Cartes
			</Link>
			<Link
				href={listHref}
				onClick={() => persistView("list")}
				className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
					currentView === "list" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
				}`}
			>
				Liste
			</Link>
		</div>
	);
}
