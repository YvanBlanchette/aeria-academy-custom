"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { dict } from "@/lib/i18n";
import { localizedHref } from "@/lib/links";
import Image from "next/image";
import Link from "next/link";

export default function Hero({ locale }) {
	// User auth + membership state
	const { isLoaded, isSignedIn, isMember, user } = useCurrentUser();

	// Translated content for the hero section
	const t = dict[locale].hero;

	// Locale-aware link helper
	const href = (path) => localizedHref(locale, path);

	// Choose the CTA based on user state:
	//  - members get nothing (they're already in)
	//  - signed-in non-members get "Upgrade" to /pricing
	//  - signed-out visitors get the main "Join the Academy" CTA to /register
	const cta = isMember ? null : isSignedIn ? { label: t.ctaUpgrade ?? "Upgrade", href: href("/pricing") } : { label: t.cta, href: href("/register") };

	return (
		<section className="relative min-h-screen flex items-center">
			<div className="absolute inset-0 bg-cover bg-center" />

			{/* Background video, with poster as fallback for unsupported browsers / slow connections */}
			<video
				autoPlay
				muted
				loop
				playsInline
				preload="metadata"
				className="absolute inset-0 object-cover w-full h-full"
				poster="/videos/hero-fallback.webp"
			>
				<source
					src="/videos/hero-bg.webm"
					type="video/webm"
				/>
			</video>

			{/* Dark gradient overlay to keep text readable over the video */}
			<div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/45 to-black/20" />

			{/* Content */}
			<div className="relative z-10 max-w-7xl mx-auto px-6 pt-36 pb-24">
				{/* Decorative filigree logo, large and faded behind the text */}
				<Image
					src="/images/windrose-filigran.svg"
					alt=""
					aria-hidden="true"
					width={600}
					height={600}
					className="absolute top-1/2 aspect-square left-0 -translate-x-1/4 -translate-y-1/2 opacity-[0.08] -z-10"
				/>

				{/* Main hero copy */}
				<div className="max-w-5xl flex flex-col justify-center items-center">
					<p className="eyebrow text-yellow-600 mb-4">{t.eyebrow}</p>
					<h1 className="font-display text-5xl md:text-7xl text-white font-normal leading-tight mb-6 text-shadow">
						{isSignedIn && user?.fullName && t.greeting ? t.greeting.replace("{name}", user.fullName.split(" ")[0]) : t.headline}
					</h1>
					<p className="text-white text-base md:text-lg font-light leading-relaxed mb-10 max-w-xl text-center tracking-wider text-shadow">{t.sub}</p>

					{/* CTA: reserve space during initial auth load to avoid layout shift */}
					{!isLoaded ? (
						<div
							className="h-12"
							aria-hidden="true"
						/>
					) : cta ? (
						<Link
							href={cta.href}
							className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded w-fit"
						>
							{cta.label}
						</Link>
					) : null}
				</div>
			</div>
		</section>
	);
}
