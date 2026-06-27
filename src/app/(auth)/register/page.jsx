"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { registerUser } from "../actions";
import Logo from "@/components/logo";
import Image from "next/image";

function PasswordCriterion({ valid, label }) {
	return (
		<div className="flex items-center gap-1.5 text-xs">
			{valid ? <Check className="h-3.5 w-3.5 text-green-600" /> : <X className="h-3.5 w-3.5 text-muted-foreground" />}
			<span className={valid ? "text-green-600" : "text-muted-foreground"}>{label}</span>
		</div>
	);
}

export default function RegisterPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const criteria = {
		length: password.length >= 8,
		uppercase: /[A-Z]/.test(password),
		number: /[0-9]/.test(password),
		match: password.length > 0 && password === confirmPassword,
	};

	async function handleSubmit(e) {
		e.preventDefault();

		if (!criteria.length || !criteria.uppercase || !criteria.number) {
			toast.error("Le mot de passe ne respecte pas les critères");
			return;
		}
		if (!criteria.match) {
			toast.error("Les mots de passe ne correspondent pas");
			return;
		}

		setLoading(true);
		const formData = new FormData(e.currentTarget);
		const result = await registerUser(formData);

		if (result.error) {
			toast.error(result.error);
			setLoading(false);
			return;
		}

		const signInResult = await signIn("credentials", {
			email: formData.get("email"),
			password: formData.get("password"),
			redirect: false,
		});

		if (signInResult?.ok) {
			toast.success("Bienvenue à l'académie de voyages ÆRIA!");
			router.push("/dashboard");
			router.refresh();
		} else {
			router.push("/login");
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-neutral-50">
			<div className="w-full h-screen flex items-center justify-center">
				<Card className="w-full max-w-lg shadow-xl px-4 py-6">
					<CardHeader className="space-y-2">
						<div className="flex items-center justify-center mb-3">
							<Logo
								locale="fr"
								size="md"
								scrolled
							/>
						</div>
						<CardTitle className="text-2xl">Créer votre compte</CardTitle>
						<CardDescription>Rejoingnez l&apos;Académie de Voyages ÆRIA</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<Button
							variant="outline"
							className="w-full shadow-sm py-4 flex items-center justify-center gap-0.5"
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
							className="space-y-6  mt-6"
						>
							<div className="space-y-2">
								<Label htmlFor="name">Nom complet</Label>
								<Input
									id="name"
									name="name"
									required
									autoComplete="name"
									placeholder="John Smith"
									className="bg-neutral-100 shadow-inner"
								/>
							</div>

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
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="bg-neutral-100 shadow-inner"
									placeholder="Mot de passe"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
								<PasswordInput
									id="confirmPassword"
									name="confirmPassword"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									className="bg-neutral-100 shadow-inner"
									placeholder="Confirmer le mot de passe"
								/>
							</div>

							{password.length > 0 && (
								<div className="space-y-1 rounded-md bg-muted/50 p-3">
									<PasswordCriterion
										valid={criteria.length}
										label="Au moins 8 caractères"
									/>
									<PasswordCriterion
										valid={criteria.uppercase}
										label="Au moins une majuscule"
									/>
									<PasswordCriterion
										valid={criteria.number}
										label="Au moins un chiffre"
									/>
									{confirmPassword.length > 0 && (
										<PasswordCriterion
											valid={criteria.match}
											label="Les mots de passe correspondent"
										/>
									)}
								</div>
							)}

							<Button
								type="submit"
								className="w-full"
								disabled={loading}
							>
								{loading ? "Création..." : "Créer mon compte"}
							</Button>
						</form>

						<p className="text-center text-sm text-muted-foreground">
							Déjà un compte ?{" "}
							<Link
								href="/login"
								className="text-primary hover:underline"
							>
								Se connecter
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
