"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserButtonClient({ user }) {
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
					<Avatar>
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
