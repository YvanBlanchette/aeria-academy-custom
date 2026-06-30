import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserSidebar } from "@/components/users/user-sidebar";

export default async function UserLayout({ children }) {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			membership: true,
		},
	});

	if (!user) redirect("/login");

	return <UserSidebar user={user}>{children}</UserSidebar>;
}
