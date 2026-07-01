"use client";

import Image from "next/image";
import Link from "next/link";

const SIZES = {
	xs: { icon: 24, main: "text-sm", sub: "text-[10px]", gap: "gap-2" },
	sm: { icon: 32, main: "text-base", sub: "text-xs", gap: "gap-2" },
	md: { icon: 45, main: "text-2xl", sub: "text-lg", gap: "gap-3" },
	lg: { icon: 56, main: "text-3xl", sub: "text-xl", gap: "gap-3" },
	xl: { icon: 72, main: "text-4xl", sub: "text-2xl", gap: "gap-4" },
	"2xl": { icon: 96, main: "text-5xl", sub: "text-3xl", gap: "gap-4" },
	"3xl": { icon: 128, main: "text-6xl", sub: "text-4xl", gap: "gap-5" },
	"4xl": { icon: 160, main: "text-7xl", sub: "text-5xl", gap: "gap-6" },
};

const Logo = ({ locale, size = "md", scrolled = false, variant, icon = false }) => {
	const config = SIZES[size] || SIZES.md;

	// "variant" prend le dessus si explicitement passé (pour les cas Footer, Sheet, etc.)
	// sinon, on déduit du "scrolled" : transparent navbar = logo blanc, solid = logo sombre
	const isWhite = variant === "white" || (variant === undefined && !scrolled);
	const textColor = isWhite ? "text-white" : "text-gray-900";

	return (
		<Link
			href={locale === "en" ? "/en" : "/"}
			className={`flex items-center ${config.gap}`}
		>
			<Image
				src={isWhite ? "/images/aeria-icon-white.svg" : "/images/aeria-icon.svg"}
				alt="ÆRIA Voyages Académie"
				width={config.icon}
				height={config.icon}
				className="object-contain transition-opacity duration-300"
				priority
			/>
			{!icon && (
				<div className="flex flex-col transition-colors duration-300">
					<p className={`font-display ${config.main} font-semibold tracking-widest -mb-0.5 uppercase ${textColor}`}>ÆRIA Voyages</p>
					<span className="h-[0.5px] w-full bg-[#9a6f14]" />
					<p className={`font-display ${config.sub} tracking-widest uppercase -mt-0.5 font-medium opacity-80 ${textColor}`}>
						{locale === "fr" ? "Académie" : "Academy"}
					</p>
				</div>
			)}
		</Link>
	);
};

export default Logo;
