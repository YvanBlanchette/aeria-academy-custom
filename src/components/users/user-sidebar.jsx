"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/logo";
import { UserButtonClient } from "@/components/ui/user-button-client";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarTrigger, SidebarFooter } from "@/components/ui/sidebar";
import { userSidebarNavItems as navItems } from "@/lib/data/navigation";

const membershipLabel = {
	FREE: { label: "Gratuit", variant: "outline" },
	ACADEMY: { label: "Académie", variant: "default" },
	PRIME: { label: "Prime", variant: "secondary" },
};

export function UserSidebar({ user, children }) {
	const pathname = usePathname();
	const activeItem = navItems.find((item) => (item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href))) || navItems[0];
	const tier = membershipLabel[user.membership] || membershipLabel.FREE;

	return (
		<SidebarProvider
			defaultOpen
			style={{
				"--sidebar-width": "22.5rem",
				"--sidebar-width-mobile": "22.5rem",
			}}
		>
			<Sidebar
				variant="inset"
				collapsible="offcanvas"
				className="border-r border-sidebar-border"
			>
				<SidebarHeader className="flex h-22.5 items-center justify-center border-b border-sidebar-border bg-sidebar/95">
					<Logo
						locale="fr"
						scrolled
					/>
				</SidebarHeader>
				<SidebarContent className="bg-sidebar/95">
					<div className="space-y-1 p-3">
						{navItems.map((item) => {
							const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
							const Icon = item.icon;
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
										isActive ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-sidebar-accent",
									)}
								>
									<Icon className="h-4 w-4" />
									{item.label}
								</Link>
							);
						})}
					</div>
				</SidebarContent>
				<SidebarFooter className="border-t border-sidebar-border bg-sidebar/95">
					<Badge
						variant={tier.variant}
						className="mx-2 mb-1 justify-center"
					>
						Abonnement: {tier.label}
					</Badge>
					<Button
						asChild
						variant="ghost"
						className="w-full justify-start gap-3 px-3"
					>
						<Link href="/">
							<BookOpen className="h-4 w-4" />
							Retour au site
						</Link>
					</Button>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				<header className="sticky top-0 z-10 flex h-22.5 items-center border-b border-border/70 bg-background/80 backdrop-blur-xl">
					<div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
						<div className="flex items-center gap-3">
							<SidebarTrigger />
							<div>
								<p className="text-sm font-medium text-muted-foreground">Espace membre</p>
								<h1 className="text-xl font-semibold">{activeItem.label}</h1>
							</div>
						</div>
						{user && (
							<div className="flex items-center gap-3">
								<div className="hidden text-right sm:block">
									<p className="text-sm font-medium">{user.name}</p>
									<p className="text-sm font-medium text-muted-foreground">{user.email}</p>
								</div>
								<UserButtonClient
									user={user}
									size="lg"
								/>
							</div>
						)}
					</div>
				</header>
				<main className="dashboard-shell flex-1 overflow-y-auto bg-linear-to-b from-background via-background to-muted/30">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
