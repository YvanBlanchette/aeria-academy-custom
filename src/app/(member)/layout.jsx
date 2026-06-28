import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserSidebar } from "@/components/users/user-sidebar";

export default async function UserLayout({ children }) {
	const session = await auth();

	return <UserSidebar user={session.user}>{children}</UserSidebar>;
}
