import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Config "light" sans Prisma (compatible Edge Runtime)
export const authConfig = {
	pages: { signIn: "/login" },
	session: { strategy: "jwt" },
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
		// Credentials sera ré-injecté avec authorize() dans auth.js
		Credentials({}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.role = user.role;
				token.id = user.id;
				token.membership = user.membership;
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
};
