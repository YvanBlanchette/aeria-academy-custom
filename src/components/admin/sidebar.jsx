"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/logo";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarTrigger, SidebarFooter } from "@/components/ui/sidebar";
import { adminSidebarNavItems as navItems } from "@/lib/data/navigation";
import { UserButtonClient } from "../ui/user-button-client";

export function AdminSidebar({ user, children }) {
	const pathname = usePathname();
	const activeItem = navItems.find((item) => (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href))) || navItems[0];

	return (
		<SidebarProvider
			defaultOpen
			style={{
				"--sidebar-width": "22.5rem",
				"--sidebar-width-mobile": "22.5rem",
				"--background": "#f5f5f5",
			}}
		>
			<Sidebar
				collapsible="offcanvas"
				className="border-r shadow-lg"
			>
				<SidebarHeader className="flex h-[90px] items-center justify-center border-b bg-white">
					<Logo
						locale="fr"
						scrolled
					/>
				</SidebarHeader>
				<SidebarContent className="bg-white">
					<div className="space-y-1 p-3">
						{navItems.map((item) => {
							const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
							const Icon = item.icon;
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
										isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
									)}
								>
									<Icon className="h-4 w-4" />
									{item.label}
								</Link>
							);
						})}
					</div>
				</SidebarContent>
				<SidebarFooter className="border-t bg-white">
					<Button
						variant="ghost"
						className="w-full justify-start gap-3 px-3"
						onClick={() => signOut({ callbackUrl: "/" })}
					>
						<LogOut className="h-4 w-4" />
						Déconnexion
					</Button>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				<header className="sticky top-0 z-10 flex h-[90px] items-center border-b bg-white shadow-sm">
					<div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
						<div className="flex items-center gap-3">
							<SidebarTrigger />
							<div>
								<p className="text-sm font-medium text-muted-foreground">Administration</p>
								<h1 className="text-xl font-semibold">{activeItem.label}</h1>
							</div>
						</div>
						{user && (
							<div className="flex items-center gap-3">
								<div className="hidden text-right sm:block mr-2">
									<div className="hidden text-right sm:block -space-y-0.5">
										<p className="text-sm font-medium">{user.name}</p>
										<p className="text-sm font-medium text-neutral-500">{user.email}</p>
									</div>
								</div>
								<UserButtonClient
									user={user}
									size="lg"
								/>
							</div>
						)}
					</div>
				</header>
				<main className="flex-1 overflow-y-auto bg-muted/20">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
