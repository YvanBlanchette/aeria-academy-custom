import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
	...authConfig,
	adapter: PrismaAdapter(prisma),
	providers: [
		...authConfig.providers.filter((p) => p.id !== "credentials"),
		Credentials({
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null;

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
				});
				if (!user?.password) return null;

				const valid = await bcrypt.compare(credentials.password, user.password);
				return valid ? user : null;
			},
		}),
	],
	callbacks: {
		async jwt({ token, user, trigger }) {
			if (user) {
				token.id = user.id;
				token.role = user.role;
				token.membership = user.membership;
			}

			// Refresh demandé explicitement (après paiement Stripe)
			if (trigger === "update" || (token.id && token.membership === undefined)) {
				const dbUser = await prisma.user.findUnique({
					where: { id: token.id },
					select: { role: true, membership: true },
				});
				if (dbUser) {
					token.role = dbUser.role;
					token.membership = dbUser.membership;
				}
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id;
				session.user.role = token.role;
				session.user.membership = token.membership;
			}
			return session;
		},
	},
});
