import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCommunityEnabled } from "@/lib/platform-settings";
import { MemberLayoutSwitcher } from "@/components/users/member-layout-switcher";

export default async function UserLayout({ children }) {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");
	const communityEnabled = await getCommunityEnabled();

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			membership: true,
			role: true,
			username: true,
		},
	});

	if (!user) redirect("/login");

	return (
		<MemberLayoutSwitcher
			user={user}
			communityEnabled={communityEnabled}
		>
			{children}
		</MemberLayoutSwitcher>
	);
}
