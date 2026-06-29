import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Lock, Crown, Calendar } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessArticle, articleAccessBlockedInfo } from "@/lib/article-access";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArticleContent } from "@/components/articles/article-content";

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const article = await prisma.article.findUnique({
		where: { slug },
		select: { title: true, excerpt: true },
	});
	if (!article) return { title: "Article introuvable" };
	return {
		title: `${article.title} | ÆRIA Voyages Academy`,
		description: article.excerpt,
	};
}

const tierBadges = {
	FREE: { label: "Gratuit", variant: "secondary" },
	ACADEMY: { label: "Académie", variant: "default" },
	PRIME: { label: "Prime", variant: "outline" },
};

export default async function ArticleDetailPage({ params }) {
	const { slug } = await params;
	const session = await auth();
	if (!session) redirect(`/login?callbackUrl=/resources/${slug}`);

	const article = await prisma.article.findUnique({
		where: { slug },
		include: {
			tags: { include: { tag: true } },
			author: {
				select: {
					name: true,
					image: true,
					username: true,
					profile: { select: { publicProfile: true, jobTitle: true } },
				},
			},
		},
	});

	if (!article || !article.published) notFound();

	const access = canAccessArticle(session.user, article);

	// Si pas d'accès, montre une page teaser avec CTA upgrade
	if (!access.allowed) {
		const info = articleAccessBlockedInfo(access.reason, article);

		return (
			<DashboardLayoutRight
				title={article.title}
				subtitle="Contenu verrouillé"
			>
				<div className="mb-4">
					<Link
						href="/resources"
						className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour aux ressources
					</Link>
				</div>

				<div className="max-w-3xl mx-auto">
					{article.coverImage && (
						<div className="aspect-video w-full overflow-hidden rounded-lg bg-muted mb-6 relative">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={article.coverImage}
								alt={article.title}
								className="h-full w-full object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
						</div>
					)}

					{/* Excerpt accessible */}
					{article.excerpt && <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{article.excerpt}</p>}

					{/* Card de blocage */}
					<Card className="border-amber-200 bg-amber-50">
						<CardContent className="p-8 text-center space-y-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mx-auto">
								{article.requiredTier === "PRIME" ? <Crown className="h-8 w-8 text-amber-600" /> : <Lock className="h-8 w-8 text-amber-600" />}
							</div>
							<div>
								<h2 className="text-xl font-bold">{info.title}</h2>
								<p className="text-muted-foreground mt-2 max-w-md mx-auto">{info.message}</p>
							</div>
							<Button
								asChild
								size="lg"
							>
								<Link href={info.cta.href}>{info.cta.label}</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</DashboardLayoutRight>
		);
	}

	// Accès accordé : affiche tout le contenu
	const authorInitials = article.author.name
		.split(" ")
		.map((s) => s.charAt(0))
		.join("")
		.toUpperCase()
		.slice(0, 2);

	const tierBadge = tierBadges[article.requiredTier];

	return (
		<DashboardLayoutRight
			title={article.title}
			subtitle={article.excerpt || "Article AERIA"}
		>
			<div className="mb-4">
				<Link
					href="/resources"
					className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
				>
					<ArrowLeft className="h-4 w-4" />
					Retour aux ressources
				</Link>
			</div>

			<article className="max-w-3xl mx-auto">
				{/* Image de couverture */}
				{article.coverImage && (
					<div className="aspect-video w-full overflow-hidden rounded-lg bg-muted mb-8">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={article.coverImage}
							alt={article.title}
							className="h-full w-full object-cover"
						/>
					</div>
				)}

				{/* Métadonnées */}
				<div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b">
					{/* Auteur */}
					{article.author.profile?.publicProfile && article.author.username ? (
						<Link
							href={`/users/${article.author.username}`}
							className="flex items-center gap-2 hover:underline"
						>
							<Avatar className="h-9 w-9">
								<AvatarImage
									src={article.author.image}
									alt={article.author.name}
								/>
								<AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
							</Avatar>
							<div>
								<p className="text-sm font-medium">{article.author.name}</p>
								{article.author.profile?.jobTitle && <p className="text-xs text-muted-foreground">{article.author.profile.jobTitle}</p>}
							</div>
						</Link>
					) : (
						<div className="flex items-center gap-2">
							<Avatar className="h-9 w-9">
								<AvatarImage
									src={article.author.image}
									alt={article.author.name}
								/>
								<AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
							</Avatar>
							<div>
								<p className="text-sm font-medium">{article.author.name}</p>
							</div>
						</div>
					)}

					<div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
						<Calendar className="h-3.5 w-3.5" />
						<time>
							{new Date(article.publishedAt).toLocaleDateString("fr-FR", {
								day: "numeric",
								month: "long",
								year: "numeric",
							})}
						</time>
					</div>
				</div>

				{/* Tags + tier */}
				<div className="flex flex-wrap gap-2 mb-8">
					{article.tags.map(({ tag }) => (
						<Link
							key={tag.id}
							href={`/resources?tag=${tag.slug}`}
						>
							<Badge
								variant="outline"
								className="hover:bg-muted cursor-pointer"
								style={
									tag.color
										? {
												backgroundColor: tag.color,
												color: "#fff",
												borderColor: tag.color,
											}
										: undefined
								}
							>
								{tag.name}
							</Badge>
						</Link>
					))}
					{article.requiredTier !== "FREE" && (
						<Badge
							variant={tierBadge.variant}
							className="gap-1"
						>
							{article.requiredTier === "PRIME" && <Crown className="h-3 w-3" />}
							{tierBadge.label}
						</Badge>
					)}
				</div>

				{/* Contenu */}
				<ArticleContent content={article.content} />

				{/* Footer avec lien retour */}
				<div className="mt-12 pt-6 border-t">
					<Link
						href="/resources"
						className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour aux ressources
					</Link>
				</div>
			</article>
		</DashboardLayoutRight>
	);
}
