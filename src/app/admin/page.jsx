import Link from "next/link";
import { BookOpen, Users, GraduationCap, DollarSign } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayoutRight from "@/components/dashboard-layout-right";

export default async function AdminDashboard() {
	const [coursesCount, Count, enrollmentsCount, publishedCount] = await Promise.all([
		prisma.course.count(),
		prisma.user.count({ where: { role: "STUDENT" } }),
		prisma.enrollment.count(),
		prisma.course.count({ where: { published: true } }),
	]);

	const stats = [
		{ label: "Cours créés", value: coursesCount, icon: BookOpen },
		{ label: "Cours publiés", value: publishedCount, icon: GraduationCap },
		{ label: "Étudiants", value: Count, icon: Users },
		{ label: "Inscriptions", value: enrollmentsCount, icon: DollarSign },
	];

	const metadata = {
		title: "Tableau de bord",
		subtitle: "Vue d'ensemble d'AERIA Academy",
		btnLabel: "Créer un cours",
		btnLink: "/admin/courses/new",
	};

	return (
		<DashboardLayoutRight
			title={metadata.title}
			subtitle={metadata.subtitle}
		>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{stats.map(({ label, value, icon: Icon }) => (
					<Card key={label}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
							<Icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold">{value}</div>
						</CardContent>
					</Card>
				))}
			</div>
		</DashboardLayoutRight>
	);
}
