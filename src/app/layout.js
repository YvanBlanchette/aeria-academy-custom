import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
	title: "AERIA Voyages Academy",
	description: "Plateforme d'apprentissage ÆRIA Voyages",
};

export default function RootLayout({ children }) {
	return (
		<html
			lang="fr"
			className={cn("font-sans", inter.variable)}
		>
			<head>
				<meta
					name="apple-mobile-web-app-title"
					content="ÆRIA"
				/>
			</head>
			<body suppressHydrationWarning>
				<Providers>{children}</Providers>
				<Toaster richColors />
			</body>
		</html>
	);
}
