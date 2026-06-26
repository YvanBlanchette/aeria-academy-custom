"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Logo from "@/components/logo";

export default function LoginPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);
		const result = await signIn("credentials", {
			email: formData.get("email"),
			password: formData.get("password"),
			redirect: false,
		});

		setLoading(false);

		if (result?.error) {
			toast.error("Email ou mot de passe incorrect");
			return;
		}

		toast.success("Connexion réussie");
		router.push("/dashboard");
		router.refresh();
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4 bg-neutral-50">
			<div className="w-full h-screen flex items-center justify-center">
				<Card className="w-full max-w-lg shadow-md px-4 py-6">
					<CardHeader className="space-y-2">
						<div className="flex items-center justify-center mb-3">
							<Logo
								locale="fr"
								scrolled
							/>
						</div>
						<CardTitle className="text-2xl">Connexion</CardTitle>
						<CardDescription>Accède à ton espace AERIA</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<Button
							variant="outline"
							className="w-full shadow-sm py-4 flex items-center justify-center gap-1"
							onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
						>
							<Image
								src="/icons/google-logo.svg"
								alt="Google Logo"
								width={20}
								height={20}
								className="w-5 h-5 object-contain"
							/>
							<span className="ml-2">Se connecter avec Google</span>
						</Button>

						<div className="relative">
							<Separator />
							<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">OU</span>
						</div>

						<form
							onSubmit={handleSubmit}
							className="space-y-4"
						>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									required
									autoComplete="email"
									placeholder="johnsmith@mail.com"
									className="bg-neutral-100 shadow-inner"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Mot de passe</Label>
								<PasswordInput
									id="password"
									name="password"
									required
									className="bg-neutral-100 shadow-inner"
									placeholder="Mot de passe"
								/>
							</div>
							<Button
								type="submit"
								className="w-full"
								disabled={loading}
							>
								{loading ? "Connexion..." : "Se connecter"}
							</Button>
						</form>

						<p className="text-center text-sm text-muted-foreground">
							Pas encore de compte ?{" "}
							<Link
								href="/register"
								className="text-primary hover:underline"
							>
								S&apos;inscrire
							</Link>
						</p>
					</CardContent>
				</Card>
			</div>
			<div className="relative w-full h-screen">
				<Image
					height={2000}
					width={2000}
					src="/images/hero.webp"
					alt="background image"
					className="absolute inset-0 object-cover w-full h-full object-right brightness-75"
				/>
			</div>
		</div>
	);
}
