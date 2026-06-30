"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserButtonClient({ user, size }) {
	const { theme, setTheme } = useTheme();
	const avatar = user?.image || "/images/avatar-placeholder.png";
	const dashboardURL = user?.role === "ADMIN" ? "/admin" : "/dashboard";

	const userInitials = user?.name
		? user.name
				.split(" ")
				.map((name) => name.charAt(0))
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "?";

	function handleSignOut() {
		signOut({ callbackUrl: "/" });
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full cursor-pointer"
				>
					<Avatar size={size}>
						<AvatarImage
							src={avatar}
							alt={user?.name}
						/>
						<AvatarFallback>{userInitials}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-44"
				align="end"
			>
				<DropdownMenuLabel>Apparence</DropdownMenuLabel>
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={() => setTheme("light")}>
						<Sun className="mr-2 h-4 w-4" />
						<span>Clair</span>
						{theme === "light" ? <Check className="ml-auto h-4 w-4" /> : null}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("dark")}>
						<Moon className="mr-2 h-4 w-4" />
						<span>Sombre</span>
						{theme === "dark" ? <Check className="ml-auto h-4 w-4" /> : null}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("system")}>
						<Monitor className="mr-2 h-4 w-4" />
						<span>Système</span>
						{theme === "system" ? <Check className="ml-auto h-4 w-4" /> : null}
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link href="/profile">Profil</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href={dashboardURL}>Tableau de bord</Link>
					</DropdownMenuItem>
					{user?.role === "ADMIN" && (
						<DropdownMenuItem asChild>
							<Link href="/admin/settings">Paramètres</Link>
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						variant="destructive"
						onClick={handleSignOut}
					>
						Déconnexion
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
