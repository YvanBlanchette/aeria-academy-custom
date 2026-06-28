import { cookies } from "next/headers";

import Hero from "@/components/partials/home/Hero";
import FeaturedCourses from "@/components/partials/home/FeaturedCourses";
import About from "@/components/partials/home/About";
import LearningPaths from "@/components/partials/home/LearningPaths";
import { getLocaleFromCookie } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function HomePage() {
	const cookieStore = await cookies();
	const locale = getLocaleFromCookie(cookieStore);

	return (
		<div className="space-y-12">
			<Hero locale={locale} />
			<FeaturedCourses locale={locale} />
			<About locale={locale} />
			<LearningPaths locale={locale} />
		</div>
	);
}
