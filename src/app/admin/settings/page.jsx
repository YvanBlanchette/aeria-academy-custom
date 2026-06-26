import DashboardLayoutRight from "@/components/dashboard-layout-right";

export default function SettingsPage() {
	const metadata = {
		title: "Paramètres",
		subtitle: "Gérez les paramètres de l'Académie de Voyages ÆRIA",
	};

	return (
		<DashboardLayoutRight
			title={metadata.title}
			subtitle={metadata.subtitle}
		>
			<div>Paramètres</div>
		</DashboardLayoutRight>
	);
}
