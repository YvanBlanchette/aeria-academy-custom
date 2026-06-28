"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, User, Settings, LogOut, Award, CreditCard } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/logo";
import { userSidebarNavItems as navItems } from "@/lib/data/navigation";

const membershipLabel = {
	FREE: { label: "Gratuit", variant: "outline" },
	ACADEMY: { label: "Académie", variant: "default" },
	PRIME: { label: "Prime", variant: "secondary" },
};

export function UserSidebar({ user }) {
	const pathname = usePathname();

	const initials = (user.name || user.email)
		.split(" ")
		.map((s) => s.charAt(0))
		.join("")
		.toUpperCase()
		.slice(0, 2);

	const tier = membershipLabel[user.membership] || membershipLabel.FREE;

	return (
		<aside className="flex h-screen w-80 flex-col border-r bg-card shadow-md">
			{/* Logo */}
			<div className="border-b p-6 h-22.5 flex items-center justify-center">
				<Logo
					locale="fr"
					scrolled
				/>
			</div>

			{/* Navigation */}
			<nav className="flex-1 space-y-1 p-3 overflow-y-auto">
				{navItems.map((item) => {
					// Active = match exact pour les routes courtes, prefix pour les longues
					const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
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

			{/* Footer : retour site + déconnexion */}
			<div className="border-t p-3 space-y-1">
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
			</div>
		</aside>
	);
}
