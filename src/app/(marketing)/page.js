import { cookies } from "next/headers";

import Hero from "@/components/partials/home/Hero";
import FeaturedCourses from "@/components/partials/home/FeaturedCourses";
import About from "@/components/partials/home/About";
import PricingPlans from "@/components/partials/home/PricingPlans";
import { auth } from "@/auth";
import { getLocaleFromCookie } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function HomePage() {
	const cookieStore = await cookies();
	const locale = getLocaleFromCookie(cookieStore);
	const session = await auth();

	return (
		<div className="space-y-12">
			<Hero locale={locale} />
			<FeaturedCourses locale={locale} />
			<About locale={locale} />
			<PricingPlans
				locale={locale}
				session={session}
				showStripeTrust
				ctaFallbackHref="/pricing"
			/>
		</div>
	);
}
