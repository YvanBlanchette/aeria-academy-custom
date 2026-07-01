"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, List, X } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ResourceTableOfContents } from "@/components/resources/resource-table-of-contents";
import { UserButtonClient } from "@/components/ui/user-button-client";
import { CommunityNotificationsMenu } from "@/components/ui/community-notifications-menu";

function FloatingCategoriesTrigger() {
	const { open } = useSidebar();

	if (open) return null;

	return (
		<div className="fixed left-3 top-21 z-30 flex w-fit justify-start md:left-4 md:top-26">
			<SidebarTrigger
				variant="outline"
				size="sm"
				className="h-9 w-9 rounded-full border border-border bg-white p-0 shadow-lg transition-transform hover:translate-x-1 hover:bg-white sm:h-8 sm:w-auto sm:gap-2 sm:px-2.5"
			>
				<span className="hidden sm:inline">Catégories</span>
			</SidebarTrigger>
		</div>
	);
}

function renderCategoryNodes(nodes, activePath) {
	return (
		<ul className="space-y-1">
			{nodes.map((node) => {
				const isActive = activePath && (activePath === node.path || activePath.startsWith(`${node.path} /`));
				return (
					<li key={node.path}>
						<div className="space-y-1">
							<Link
								href={`/resources?category=${encodeURIComponent(node.path)}`}
								className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
									isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
								}`}
							>
								<span className="line-clamp-1">{node.name}</span>
								<span className="text-xs opacity-75">{node.count}</span>
							</Link>
							{node.children.length > 0 ? <div className="pl-3">{renderCategoryNodes(node.children, activePath)}</div> : null}
						</div>
					</li>
				);
			})}
		</ul>
	);
}

export function ResourceReadingShell({
	categoryTree,
	activeCategoryPath,
	sidebarCategoryResources,
	currentArticleSlug,
	title,
	breadcrumbSegments = [],
	user,
	children,
}) {
	return (
		<SidebarProvider
			defaultOpen
			style={{
				"--sidebar-width": "320px",
				"--sidebar-width-mobile": "320px",
			}}
		>
			<Sidebar
				collapsible="offcanvas"
				desktopOverlay
				className="border-r shadow-lg"
			>
				<SidebarHeader className="relative flex h-14 items-center justify-center border-b bg-white md:h-16">
					<SidebarTrigger
						variant="ghost"
						size="icon-sm"
						showIcon={false}
						className="absolute right-1 top-1"
					>
						<X className="h-4 w-4" />
						<span className="sr-only">Fermer les catégories</span>
					</SidebarTrigger>
					<p className="text-sm font-semibold">Navigation des ressources</p>
				</SidebarHeader>
				<SidebarContent className="bg-white px-2 py-2">
					<div className="space-y-2">
						<p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Catégories</p>
						<div className="max-h-[52vh] overflow-y-auto pr-1">{renderCategoryNodes(categoryTree, activeCategoryPath)}</div>
					</div>

					{sidebarCategoryResources.length > 0 ? (
						<div className="mt-3 border-t pt-3">
							<p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Même étape</p>
							<ul className="mt-2 space-y-1">
								{sidebarCategoryResources.map((item) => (
									<li key={item.id}>
										<Link
											href={`/resources/${item.slug}`}
											className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
												item.slug === currentArticleSlug ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
											}`}
										>
											<span className="line-clamp-2">{item.title}</span>
										</Link>
									</li>
								))}
							</ul>
						</div>
					) : null}
				</SidebarContent>
				<SidebarFooter className="border-t bg-white">
					<Link
						href="/resources"
						className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour aux ressources
					</Link>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset className="bg-transparent shadow-none md:m-0 md:rounded-none">
				<header className="sticky top-0 z-20 border-b bg-background">
					<div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
						<div className="min-w-0 flex-1 space-y-1">
							<h1 className="line-clamp-2 text-lg font-semibold sm:text-xl">{title}</h1>
							{breadcrumbSegments.length > 0 ? (
								<nav aria-label="Fil d'Ariane">
									<ol className="flex flex-wrap items-center gap-1 text-sm">
										<li>
											<Link
												href="/resources"
												className="text-muted-foreground hover:text-foreground"
											>
												Ressources
											</Link>
										</li>
										{breadcrumbSegments.map((item) => (
											<li
												key={item.path}
												className="inline-flex items-center gap-1"
											>
												<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
												<Link
													href={`/resources?category=${encodeURIComponent(item.path)}`}
													className="text-muted-foreground hover:text-foreground"
												>
													{item.label}
												</Link>
											</li>
										))}
									</ol>
								</nav>
							) : null}
						</div>
						{user ? (
							<div className="flex items-center gap-2">
								<CommunityNotificationsMenu />
								<UserButtonClient user={user} />
							</div>
						) : null}
					</div>
				</header>

				<FloatingCategoriesTrigger />

				<div className="fixed right-3 top-21 z-30 flex w-fit justify-end md:right-4 md:top-26">
					<Sheet>
						<SheetTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className="h-9 w-9 rounded-full border border-border bg-white p-0 shadow-lg transition-transform hover:-translate-x-1 hover:bg-white sm:h-8 sm:w-auto sm:gap-2 sm:px-2.5"
							>
								<List className="h-4 w-4" />
								<span className="hidden sm:inline">Sommaire</span>
							</Button>
						</SheetTrigger>
						<SheetContent
							side="right"
							className="w-full p-0 sm:max-w-sm"
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
							<div className="h-14 border-b bg-white px-4 flex items-center justify-center md:h-16">
								<p className="text-sm font-semibold">Table des matières</p>
							</div>
							<div className="p-3">
								<ResourceTableOfContents containerId="resource-reading-content" />
							</div>
						</SheetContent>
					</Sheet>
				</div>

				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
