import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, MapPin, Globe, Building2 } from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaYoutube, FaXTwitter, FaTiktok } from "react-icons/fa6";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const SOCIAL_ICONS = {
	facebook: FaFacebookF,
	linkedin: FaLinkedinIn,
	instagram: FaInstagram,
	youtube: FaYoutube,
	twitter: FaXTwitter,
	tiktok: FaTiktok,
};

const SOCIAL_LABELS = {
	facebook: "Facebook",
	linkedin: "LinkedIn",
	instagram: "Instagram",
	youtube: "YouTube",
	twitter: "Twitter/X",
	tiktok: "TikTok",
};

export async function generateMetadata({ params }) {
	const { username } = await params;
	const user = await prisma.user.findUnique({
		where: { username },
		include: { profile: { include: { agency: true } } },
	});

	if (!user || !user.profile?.publicProfile) {
		return { title: "Profil introuvable" };
	}

	return {
		title: `${user.name} | ÆRIA Voyages Academy`,
		description: user.profile?.bio?.slice(0, 160) || `Profil de ${user.name}`,
	};
}

export default async function PublicProfilePage({ params }) {
	const { username } = await params;

	const user = await prisma.user.findUnique({
		where: { username: username.toLowerCase() },
		include: {
			profile: {
				include: { agency: true },
			},
		},
	});

	// Pas trouvé OU profil non public → 404
	if (!user || !user.profile?.publicProfile) {
		notFound();
	}

	const profile = user.profile;
	const agency = profile.agency;
	const socialLinks = profile.socialLinks || {};

	const initials = (user.name || user.email)
		.split(" ")
		.map((s) => s.charAt(0))
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<div className="min-h-screen bg-gradient-to-b from-muted/30 to-background pt-24 pb-12">
			<div className="container max-w-2xl mx-auto px-4 space-y-6">
				{/* Header */}
				<Card>
					<CardContent className="p-8 text-center space-y-4">
						<Avatar className="h-24 w-24 mx-auto">
							<AvatarImage
								src={user.image}
								alt={user.name}
							/>
							<AvatarFallback className="text-2xl">{initials}</AvatarFallback>
						</Avatar>

						<div>
							<h1 className="text-2xl font-bold">{user.name}</h1>
							{profile.jobTitle && (
								<p className="text-muted-foreground">
									{profile.jobTitle}
									{profile.company && ` chez ${profile.company}`}
								</p>
							)}
							{profile.agencyRole && agency && <p className="text-sm text-muted-foreground mt-1">{profile.agencyRole}</p>}
						</div>

						{profile.bio && <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed whitespace-pre-wrap">{profile.bio}</p>}
					</CardContent>
				</Card>

				{/* Contact / liens publics */}
				{(profile.websiteUrl || Object.keys(socialLinks).length > 0) && (
					<Card>
						<CardContent className="p-6 space-y-3">
							{profile.websiteUrl && (
								<a
									href={profile.websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors"
								>
									<Globe className="h-5 w-5 text-muted-foreground" />
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium">Site web</p>
										<p className="text-xs text-muted-foreground truncate">{profile.websiteUrl}</p>
									</div>
								</a>
							)}

							{Object.entries(socialLinks).map(([platform, url]) => {
								if (!url) return null;
								const Icon = SOCIAL_ICONS[platform];
								const label = SOCIAL_LABELS[platform] || platform;
								return (
									<a
										key={platform}
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors"
									>
										{Icon ? (
											<Icon className="h-5 w-5 text-muted-foreground" />
										) : (
											<div className="h-5 w-5 rounded bg-muted-foreground/20 text-xs flex items-center justify-center font-semibold text-muted-foreground">
												{label.charAt(0)}
											</div>
										)}
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium">{label}</p>
											<p className="text-xs text-muted-foreground truncate">{url}</p>
										</div>
									</a>
								);
							})}
						</CardContent>
					</Card>
				)}

				{/* Agence */}
				{agency && agency.approved && (
					<Card>
						<CardContent className="p-6">
							<div className="flex items-start gap-4">
								{agency.logoUrl ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={agency.logoUrl}
										alt={agency.name}
										className="h-14 w-14 rounded object-cover"
									/>
								) : (
									<div className="h-14 w-14 rounded bg-muted flex items-center justify-center">
										<Building2 className="h-7 w-7 text-muted-foreground" />
									</div>
								)}
								<div className="flex-1">
									<p className="text-xs uppercase tracking-wider text-muted-foreground">Travaille chez</p>
									<h3 className="font-semibold">{agency.name}</h3>
									{(agency.city || agency.province) && (
										<p className="text-sm text-muted-foreground">{[agency.city, agency.province].filter(Boolean).join(", ")}</p>
									)}
									<div className="flex flex-wrap gap-2 mt-2">
										{agency.iataCode && (
											<Badge
												variant="outline"
												className="text-xs"
											>
												IATA · {agency.iataCode}
											</Badge>
										)}
										{agency.tico && (
											<Badge
												variant="outline"
												className="text-xs"
											>
												TICO · {agency.tico}
											</Badge>
										)}
										{agency.opc && (
											<Badge
												variant="outline"
												className="text-xs"
											>
												OPC · {agency.opc}
											</Badge>
										)}
									</div>
								</div>
							</div>

							{agency.description && <p className="text-sm text-muted-foreground mt-4 leading-relaxed whitespace-pre-wrap">{agency.description}</p>}

							{(agency.phone || agency.email || agency.websiteUrl) && (
								<div className="mt-4 pt-4 border-t space-y-2 text-sm">
									{agency.phone && (
										<a
											href={`tel:${agency.phone}`}
											className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
										>
											<Phone className="h-4 w-4" />
											{agency.phone}
										</a>
									)}
									{agency.email && (
										<a
											href={`mailto:${agency.email}`}
											className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
										>
											<Mail className="h-4 w-4" />
											{agency.email}
										</a>
									)}
									{agency.websiteUrl && (
										<a
											href={agency.websiteUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
										>
											<Globe className="h-4 w-4" />
											{agency.websiteUrl}
										</a>
									)}
									{agency.address && (
										<p className="flex items-start gap-2 text-muted-foreground">
											<MapPin className="h-4 w-4 mt-0.5 shrink-0" />
											<span>
												{agency.address}
												{agency.city && `, ${agency.city}`}
												{agency.postalCode && `, ${agency.postalCode}`}
											</span>
										</p>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				)}

				{/* Footer */}
				<p className="text-center text-xs text-muted-foreground pt-4">
					Propulsé par{" "}
					<Link
						href="/"
						className="font-medium hover:underline"
					>
						AERIA Academy
					</Link>
				</p>
			</div>
		</div>
	);
}
