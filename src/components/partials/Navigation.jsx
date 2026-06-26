"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { HiMenu } from "react-icons/hi";

import { dict } from "@/lib/i18n";
import { localizedHref } from "@/lib/links";
import { useCurrentUser } from "@/hooks/use-current-user";
import Logo from "../logo";
import { Button } from "../ui/button";
import { UserButton } from "../ui/user-button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";

const LOCKED_ROUTES = ["/pricing", "/courses", "/about", "/login", "/register", "/dashboard", "/profile"];

export default function Navbar({ locale = "fr", otherLocale }) {
	// 1. Hooks
	const pathname = usePathname();
	const { isLoaded, isSignedIn, isMember } = useCurrentUser();

	const locked = LOCKED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

	const [scrolledPast, setScrolledPast] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	// État final dérivé : pas besoin d'effet de synchronisation
	const scrolled = locked || scrolledPast;

	// Scroll listener (skip si locked)
	useEffect(() => {
		if (locked) return;
		let ticking = false;
		const onScroll = () => {
			if (ticking) return;
			requestAnimationFrame(() => {
				setScrolledPast(window.scrollY > 40);
				ticking = false;
			});
			ticking = true;
		};
		setScrolledPast(window.scrollY > 40);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [locked]);

	// 2. Early return APRÈS les hooks
	const t = dict[locale]?.nav;
	if (!t) {
		console.warn(`Navbar: locale "${locale}" not found in dict`);
		return null;
	}

	// 3. Logique dérivée
	const href = (path) => localizedHref(locale, path);
	const closeMobile = () => setMobileOpen(false);
	const navTextColor = scrolled ? "text-gray-900" : "text-white";

	const navLinks = [
		{ label: t.academy, href: href("/"), desktop: true, mobile: true },
		{ label: t.learningPaths, href: href("/#learning-paths"), desktop: true, mobile: false },
		{ label: t.oceanCruises, href: href("/cruises"), desktop: false, mobile: true },
		{ label: t.destinations, href: href("/destinations"), desktop: false, mobile: true },
		{ label: t.tours, href: href("/tours"), desktop: false, mobile: true },
		{ label: t.pricing, href: href("/pricing"), desktop: true, mobile: true, hideIfMember: false },
		{ label: t.about, href: href("/about"), desktop: true, mobile: true },
	];

	const visibleLinks = (placement) =>
		navLinks.filter((link) => {
			if (link.hideIfMember && isLoaded && isMember) return false;
			return placement === "desktop" ? link.desktop : link.mobile;
		});

	return (
		<header className={clsx("top-0 left-0 right-0 z-50 transition-all duration-300", locked ? "sticky" : "fixed", scrolled ? "bg-white shadow-md" : "")}>
			<div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
				<Logo
					scrolled={scrolled}
					locale={locale}
				/>

				<nav
					className={clsx(
						"hidden lg:flex items-center gap-8 text-[0.75rem] tracking-widest uppercase font-medium transition-colors duration-300",
						navTextColor,
					)}
				>
					{visibleLinks("desktop").map(({ label, href: linkHref }) => (
						<Link
							key={label}
							href={linkHref}
							className="hover:text-yellow-500 transition-colors text-sm"
						>
							{label}
						</Link>
					))}
				</nav>

				<div className="hidden lg:flex items-center gap-2">
					{!isLoaded ? (
						<div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
					) : isSignedIn ? (
						<UserButton />
					) : (
						<Button
							asChild
							variant={scrolled ? "ghost" : "outline"}
						>
							<Link href="/login">Connexion</Link>
						</Button>
					)}
				</div>

				<Sheet
					open={mobileOpen}
					onOpenChange={setMobileOpen}
				>
					<SheetTrigger asChild>
						<button
							className={clsx("lg:hidden transition-colors", navTextColor)}
							aria-label="Ouvrir le menu"
						>
							<HiMenu className="w-6 h-6" />
						</button>
					</SheetTrigger>
					<SheetContent
						side="right"
						className="w-full sm:max-w-md flex flex-col"
					>
						<SheetHeader>
							<SheetTitle asChild>
								<Logo
									variant="dark"
									locale={locale}
								/>
							</SheetTitle>
						</SheetHeader>

						<nav className="flex flex-col items-center justify-center flex-1 gap-6 py-8">
							{visibleLinks("mobile").map(({ label, href: linkHref }) => (
								<Link
									key={label}
									href={linkHref}
									onClick={closeMobile}
									className="text-base tracking-widest uppercase text-gray-900 hover:text-yellow-600 transition-colors"
								>
									{label}
								</Link>
							))}
						</nav>

						<div className="border-t pt-6 flex flex-col gap-3 pb-4">
							{!isLoaded ? null : isSignedIn ? (
								<div className="flex justify-center">
									<UserButton />
								</div>
							) : (
								<>
									<Button
										asChild
										size="lg"
										variant="outline"
										onClick={closeMobile}
									>
										<Link href="/login">Connexion</Link>
									</Button>
									<Button
										asChild
										size="lg"
										onClick={closeMobile}
									>
										<Link href="/register">S&apos;inscrire</Link>
									</Button>
								</>
							)}
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
