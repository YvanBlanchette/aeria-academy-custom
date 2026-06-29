import Link from "next/link";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { UserButtonClient } from "./ui/user-button-client";
import { auth } from "@/auth";

const DashboardLayoutRight = async ({ children, title, subtitle, btnLabel, btnLink }) => {
	const session = await auth();
	const user = session?.user;

	return (
		<div className="flex flex-col h-screen">
			<div className="flex items-center px-8 justify-between border-b h-[90px] bg-white shadow-md">
				<div className="flex items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold">{title}</h1>
						<p className="text-muted-foreground">{subtitle}</p>
					</div>
				</div>
				{btnLabel && (
					<Button asChild>
						<Link href={btnLink}>{btnLabel}</Link>
					</Button>
				)}
				{user && (
					<div className="flex items-center gap-4 mr-4">
						<div>
							<h2 className="text-base font-bold">{user?.name}</h2>
							<p className="text-xs text-muted-foreground">{user?.email}</p>
						</div>
						<UserButtonClient
							user={user}
							size="lg"
						/>
					</div>
				)}
			</div>
			<div className="p-8 bg-neutral-50 h-[calc(100vh-90px)] w-full overflow-auto">{children}</div>
		</div>
	);
};
export default DashboardLayoutRight;
