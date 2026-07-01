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
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function UserButtonClient({ user: userProp, size }) {
	const { user: sessionUser, isSignedIn } = useCurrentUser();
	const user =
		userProp ||
		(isSignedIn
			? {
					id: sessionUser?.id,
					name: sessionUser?.fullName,
					email: sessionUser?.email,
					image: sessionUser?.imageUrl,
					role: sessionUser?.role,
				}
			: null);

	const avatar = user?.image || "/images/avatar-placeholder.png";
	const dashboardURL = "/dashboard";
	const communityURL = "/community";
	const profileSlug = user?.username || user?.id;
	const profileURL = profileSlug ? `/users/${profileSlug}` : "/profile";

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
		<DropdownMenu modal={false}>
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
				<DropdownMenuGroup>
					<DropdownMenuLabel asChild>
						<div className="space-y-1 text-center cursor-default pb-2 border-b border-sidebar-border">
							<p className="text-xs font-medium leading-none">{user?.name}</p>
							<p className="text-[10px] leading-none text-muted-foreground">{user?.email}</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuItem asChild>
						<Link href={profileURL}>Profil</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href={dashboardURL}>Tableau de bord</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href={communityURL}>Communauté ÆRIA</Link>
					</DropdownMenuItem>
					{user?.role === "ADMIN" && (
						<DropdownMenuItem asChild>
							<Link href="/admin">Administration</Link>
						</DropdownMenuItem>
					)}
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
