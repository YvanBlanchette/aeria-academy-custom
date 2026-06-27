import Link from "next/link";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const DashboardLayoutRight = ({ children, title, subtitle, btnLabel, btnLink, image }) => {
	return (
		<div className="flex flex-col h-screen">
			<div className="flex items-center px-8 justify-between border-b h-[90px] bg-white shadow-md">
				<div className="flex items-center gap-4">
					{image && (
						<Avatar className="h-16 w-16">
							<AvatarImage
								src={image}
								alt={title}
							/>
						</Avatar>
					)}
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
			</div>
			<div className="p-8 bg-neutral-50 h-[calc(100vh-90px)] w-full overflow-auto">{children}</div>
		</div>
	);
};
export default DashboardLayoutRight;
