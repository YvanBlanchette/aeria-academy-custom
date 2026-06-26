import Link from "next/link";
import { Button } from "./ui/button";

const DashboardLayoutRight = ({ children, title, subtitle, btnLabel, btnLink }) => {
	return (
		<div className="flex flex-col h-screen">
			<div className="flex items-center px-8 justify-between border-b h-[90px] bg-white shadow-md">
				<div>
					<h1 className="text-3xl font-bold">{title}</h1>
					<p className="text-muted-foreground">{subtitle}</p>
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
