import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }) {
	const session = await auth();

	if (!session || session.user.role !== "ADMIN") {
		redirect("/");
	}

	return (
		<div className="flex h-screen overflow-hidden">
			<AdminSidebar user={session.user} />
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
