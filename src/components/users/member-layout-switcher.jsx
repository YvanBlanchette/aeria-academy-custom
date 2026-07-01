"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { UserSidebar } from "@/components/users/user-sidebar";
import { SocialShell } from "@/components/social/social-shell";
import { buildSocialTabs } from "@/lib/data/navigation";

const SOCIAL_ROUTES = ["/community", "/profile", "/community-disabled"];

export function MemberLayoutSwitcher({ user, children, communityEnabled = true }) {
	const pathname = usePathname();
	const isSocialRoute = SOCIAL_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
	const userSlug = user?.username || user?.id || null;

	const tabs = useMemo(() => buildSocialTabs(userSlug), [userSlug]);

	if (isSocialRoute) {
		return <SocialShell tabs={tabs}>{children}</SocialShell>;
	}

	return (
		<UserSidebar
			user={user}
			communityEnabled={communityEnabled}
		>
			{children}
		</UserSidebar>
	);
}
