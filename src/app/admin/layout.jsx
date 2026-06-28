import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }) {
	const session = await auth();

	if (!session || session.user.role !== "ADMIN") {
		redirect("/");
	}

	return <AdminSidebar user={session.user}>{children}</AdminSidebar>;
}
