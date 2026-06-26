import Hero from "@/components/partials/home/Hero";
import FeaturedCourses from "@/components/partials/home/FeaturedCourses";

export default function HomePage() {
	return (
		<div className="space-y-12">
			<Hero locale="fr" />
			<FeaturedCourses locale="fr" />
		</div>
	);
}
