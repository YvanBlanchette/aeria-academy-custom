import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
	const isLoggedIn = !!req.auth;
	const isAdmin = req.auth?.user?.role === "ADMIN";
	const { pathname } = req.nextUrl;

	if (pathname.startsWith("/admin") && !isAdmin) {
		return Response.redirect(new URL("/", req.url));
	}
	if ((pathname.startsWith("/dashboard") || pathname.startsWith("/learn")) && !isLoggedIn) {
		return Response.redirect(new URL("/login", req.url));
	}
});

export const config = {
	matcher: ["/dashboard/:path*", "/admin/:path*", "/learn/:path*"],
};
