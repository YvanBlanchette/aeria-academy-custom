"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import Logo from "@/components/logo";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { CommunityNotificationsMenu } from "@/components/ui/community-notifications-menu";
import { UserButtonClient as UserButton } from "@/components/ui/user-button-client";
import { FaHouseChimney, FaUsers } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import { Search } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const TAB_ICONS = {
	home: FaHouseChimney,
	profile: FaUserCircle,
	users: FaUsers,
};

function isActiveTab(pathname, href) {
	return pathname === href || pathname.startsWith(`${href}/`) || pathname.startsWith(`${href}?`);
}

export function SocialShell({ tabs, children }) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { isLoaded, isSignedIn } = useCurrentUser();
	const activeTabHref = tabs.filter((tab) => isActiveTab(pathname, tab.href)).sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;
	const activeQuery = searchParams.get("q") || "";
	const searchValue = pathname.startsWith("/community") ? activeQuery : "";
	const [searchBarOpen, setSearchBarOpen] = useState(false);

	return (
		<div className="min-h-screen bg-[#f0f2f5] text-foreground">
			<header className="sticky top-0 z-50 border-b border-border/70 bg-white/95 backdrop-blur shadow-lg">
				<div className="mx-auto grid grid-cols-3 h-16 w-full max-w-7xl items-center justify gap-3 px-4 sm:px-6 lg:px-8">
					<div className="flex shrink-0 items-center gap-3">
						<Logo
							variant="dark"
							size="sm"
							icon={true}
						/>
						<form
							action="/community"
							method="get"
							className={clsx(
								"hidden sm:flex items-center rounded-full bg-[#f0f2f5] h-9  transition-all duration-300 overflow-hidden",
								searchBarOpen ? "px-2 w-56 lg:w-72 justify-start" : "w-9 px-0 justify-center",
							)}
						>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										onClick={() => setSearchBarOpen((open) => !open)}
										className="flex shrink-0 items-center justify-center text-muted-foreground cursor-pointer p-0 m-0 h-9 w-9"
										aria-label="Ouvrir la recherche"
									>
										<Search className="h-4 w-4" />
									</button>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p>Rechercher</p>
								</TooltipContent>
							</Tooltip>

							<input
								type="search"
								name="q"
								defaultValue={searchValue}
								placeholder="Rechercher..."
								className={clsx(
									"ml-2 bg-transparent text-sm outline-none placeholder:text-muted-foreground transition-all duration-300",
									searchBarOpen ? "w-full block" : "hidden",
								)}
							/>
						</form>
					</div>

					<nav className="flex flex-1 items-center justify-center overflow-x-auto">
						<div className="flex min-w-max items-center gap-4 rounded-full bg-muted/40 p-1">
							{tabs.map((tab) => {
								const active = activeTabHref === tab.href;
								const TabIcon = tab.iconKey ? TAB_ICONS[tab.iconKey] : null;
								return (
									<Link
										key={tab.href}
										href={tab.href}
										className={clsx(
											"rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1",
											active ? "bg-[#CE8500] text-white shadow-sm" : "text-muted-foreground hover:bg-[#CE8500]/10 hover:text-[#CE8500]",
										)}
									>
										{TabIcon && <TabIcon className="mr-1 inline h-4 w-4" />}
										<span>{tab.label}</span>
									</Link>
								);
							})}
						</div>
					</nav>

					<div className="flex shrink-0 items-center justify-end gap-2">
						{!isLoaded ? (
							<div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
						) : isSignedIn ? (
							<div className="flex shrink-0 items-center gap-4">
								<CommunityNotificationsMenu />
								<UserButton />
							</div>
						) : (
							<Button
								asChild
								variant="outline"
								className="rounded-full"
							>
								<Link href="/login">Connexion</Link>
							</Button>
						)}
					</div>
				</div>
			</header>

			{children}
		</div>
	);
}
