"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Logo from "../logo";
import { adminSidebarNavItems as navItems } from "@/lib/data/navigation";

export function AdminSidebar({ user }) {
	const pathname = usePathname();

	return (
		<aside className="flex h-screen w-80 flex-col border-r bg-card shadow-md">
			<div className="border-b p-6 h-22.5 flex items-center justify-center">
				<Logo
					locale="fr"
					scrolled
				/>
			</div>

			<nav className="flex-1 space-y-1 p-3">
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
			</nav>

			<div className="border-t p-3 space-y-1">
				<Button
					variant="ghost"
					className="w-full justify-start gap-3 px-3"
					onClick={() => signOut({ callbackUrl: "/" })}
				>
					<LogOut className="h-4 w-4" />
					Déconnexion
				</Button>
			</div>
		</aside>
	);
}
