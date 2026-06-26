// src/hooks/useCurrentUser.js
"use client";

import { useMemo } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

export function useCurrentUser() {
	const { data: session, status } = useSession();

	return useMemo(() => {
		const signOut = () => nextAuthSignOut({ callbackUrl: "/" });

		// En cours de chargement
		if (status === "loading") {
			return {
				status: "loading",
				isLoaded: false,
				isSignedIn: false,
				user: null,
				isMember: false,
				isAdmin: false,
				signOut,
			};
		}

		// Déconnecté
		if (status === "unauthenticated" || !session?.user) {
			return {
				status: "signed-out",
				isLoaded: true,
				isSignedIn: false,
				user: null,
				isMember: false,
				isAdmin: false,
				signOut,
			};
		}

		// Connecté
		const u = session.user;
		const isAdmin = u.role === "ADMIN";

		// isMember : à toi de définir ce que ça veut dire dans ton contexte AERIA.
		// Options possibles :
		//   - tout user connecté est "membre" → true
		//   - membre = role STUDENT/INSTRUCTOR/ADMIN → true (par défaut)
		//   - membre = a au moins une inscription active → nécessite un appel API séparé
		const isMember = !!u.role;

		return {
			status: "signed-in",
			isLoaded: true,
			isSignedIn: true,
			user: {
				id: u.id,
				fullName: u.name,
				email: u.email,
				imageUrl: u.image,
				role: u.role,
			},
			isMember,
			isAdmin,
			signOut,
		};
	}, [session, status]);
}
