"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
	const { theme, resolvedTheme, setTheme } = useTheme();
	const icon = theme === "system" ? <Monitor className="h-4 w-4" /> : resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="rounded-full"
				>
					{icon}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Apparence</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => setTheme("light")}>Clair</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>Sombre</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>Système</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
