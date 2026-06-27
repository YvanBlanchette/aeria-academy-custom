import Hero from "@/components/partials/home/Hero";
import FeaturedCourses from "@/components/partials/home/FeaturedCourses";
import About from "@/components/partials/home/About";
import LearningPaths from "@/components/partials/home/LearningPaths";

export default function HomePage() {
	return (
		<div className="space-y-12">
			<Hero locale="fr" />
			<FeaturedCourses locale="fr" />
			<About locale="fr" />
			<LearningPaths locale="fr" />
		</div>
	);
}
