"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useCurrentUser } from "@/hooks/use-current-user";
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

export function UserButton() {
	const { isLoaded, isSignedIn, user, isAdmin } = useCurrentUser();

	if (!isLoaded) {
		return <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />;
	}
	if (!isSignedIn) return null;

	const avatar = user?.imageUrl || "/images/avatar-placeholder.png";
	const dashboardURL = isAdmin ? "/admin" : "/dashboard";

	const userInitials = user?.fullName
		? user.fullName
				.split(" ")
				.map((n) => n.charAt(0))
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "?";

	function handleSignOut() {
		signOut({ callbackUrl: "/" });
	}

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full cursor-pointer"
				>
					<Avatar size="lg">
						<AvatarImage
							src={avatar}
							alt={user?.fullName}
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
					{isAdmin && (
						<DropdownMenuItem asChild>
							<Link href="/admin/settings">Paramètres</Link>
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					variant="destructive"
					onClick={handleSignOut}
				>
					Déconnexion
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
