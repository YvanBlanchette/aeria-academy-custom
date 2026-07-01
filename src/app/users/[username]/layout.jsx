import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SocialShell } from "@/components/social/social-shell";
import { buildSocialTabs } from "@/lib/data/navigation";

export default async function PublicUserLayout({ children, params }) {
	const { username } = await params;
	const targetUser = await prisma.user.findFirst({
		where: {
			OR: [{ username: { equals: username, mode: "insensitive" } }, { id: username }],
		},
		select: {
			id: true,
			username: true,
		},
	});

	if (!targetUser) {
		notFound();
	}

	const profileSlug = targetUser.username || username;

	return <SocialShell tabs={buildSocialTabs(profileSlug)}>{children}</SocialShell>;
}
