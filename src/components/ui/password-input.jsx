"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const PasswordInput = forwardRef(function PasswordInput({ className, ...props }, ref) {
	const [show, setShow] = useState(false);

	return (
		<div className="relative">
			<Input
				ref={ref}
				type={show ? "text" : "password"}
				className={cn("pr-10", className)}
				{...props}
			/>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
				onClick={() => setShow((s) => !s)}
				tabIndex={-1}
				aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
			>
				{show ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
			</Button>
		</div>
	);
});
