"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Logo from "../logo";
import Image from "next/image";

const navItems = [
	{ href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
	{ href: "/admin/courses", label: "Cours", icon: BookOpen },
	{ href: "/admin/users", label: "Utilisateurs", icon: Users },
	{ href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function AdminSidebar({ user }) {
	const pathname = usePathname();

	return (
		<aside className="flex h-screen w-64 flex-col border-r bg-card shadow-md">
			<div className="border-b p-6 h-22.5">
				<Link
					href="/"
					className="flex items-center gap-2"
				>
					<Image
						src="/images/aeria-icon.svg"
						alt="ÆRIA Voyages Académie"
						width={35}
						height={35}
						className="object-contain"
					/>
					<div className="flex flex-col transition-colors duration-300 text-gray-900">
						<p className="font-display font-semibold tracking-widest -mb-0.5 uppercase text-md">ÆRIA Voyages</p>
						<span className="h-[0.5px] w-full bg-[#9a6f14]" />
						<p className="font-display tracking-widest uppercase text-sm font-medium opacity-80">Académie</p>
					</div>
				</Link>
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
