import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserSidebar } from "@/components/users/user-sidebar";

export default async function UserLayout({ children }) {
	const session = await auth();

	return (
		<div className="flex h-screen overflow-hidden">
			<UserSidebar user={session.user} />
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
