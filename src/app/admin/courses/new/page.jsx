import { CourseForm } from "@/components/admin/course-form";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { Card } from "@/components/ui/card";

const metadata = {
	title: "Création d'un Nouveau Cours",
	subtitle: "",
};

export default function NewCoursePage() {
	return (
		<DashboardLayoutRight
			title={metadata.title}
			subtitle={metadata.subtitle}
		>
			<CourseForm />
		</DashboardLayoutRight>
	);
}
