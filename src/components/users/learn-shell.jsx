"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarTrigger, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { LessonSidebar } from "./lesson-sidebar";
import Logo from "@/components/logo";
import { UserButtonClient } from "../ui/user-button-client";
import Footer from "../partials/Footer";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";

function FloatingLessonsTrigger() {
	const { open } = useSidebar();

	if (open) {
		return null;
	}

	return (
		<div className="fixed left-4 top-26 z-30 flex w-fit justify-start ">
			<SidebarTrigger
				variant="outline"
				size="sm"
				className="gap-2 rounded-full border-border shadow-lg cursor-pointer hover:translate-x-1 transition-transform bg-white hover:bg-white border"
			>
				<span>Leçons</span>
			</SidebarTrigger>
		</div>
	);
}

export function LearnShell({ course, completedSet, defaultOpen, children, session }) {
	const user = session?.user;

	return (
		<SidebarProvider
			defaultOpen={defaultOpen}
			style={{
				"--sidebar-width": "20.5rem",
				"--sidebar-width-mobile": "20.5rem",
				"--background": "#f5f5f5",
			}}
		>
			<Sidebar
				collapsible="offcanvas"
				desktopOverlay
				className="border-r shadow-lg"
			>
				<SidebarHeader className="relative border-b h-[90px] flex items-center justify-center bg-white">
					<SidebarTrigger
						variant="ghost"
						size="icon-sm"
						showIcon={false}
						className="absolute right-1 top-1"
					>
						<X className="h-4 w-4" />
						<span className="sr-only">Fermer les lecons</span>
					</SidebarTrigger>
					<Logo
						locale="fr"
						scrolled
					/>
				</SidebarHeader>
				<SidebarContent className="bg-white">
					<LessonSidebar
						course={course}
						completedSet={completedSet}
					/>
				</SidebarContent>
				<SidebarFooter>
					<Link
						href="/"
						className="flex items-center justify-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted border-t"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour à l&apos;accueil
					</Link>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				<FloatingLessonsTrigger />

				<header className="sticky top-0 z-10 flex h-[90px] justify-between items-center border-b bg-white shadow-lg">
					<div className="w-[90%] lg:w-full mx-auto max-w-7xl flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div>
								<h1 className="text-3xl font-bold">{course.title}</h1>
								<div className="flex items-center gap-2">
									<p className="text-muted-foreground">{course.description}</p>
								</div>
							</div>
						</div>
						{user && (
							<div className="flex items-center gap-4">
								<div>
									<h2 className="text-base font-bold">{user?.name}</h2>
									<p className="text-xs text-muted-foreground">{user?.email}</p>
								</div>
								<UserButtonClient
									user={user}
									size="lg"
								/>
							</div>
						)}
					</div>
				</header>

				<main className="flex-1 overflow-y-auto">{children}</main>
				<Footer locale="fr" />
			</SidebarInset>
		</SidebarProvider>
	);
}
