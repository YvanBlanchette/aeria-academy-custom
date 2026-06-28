import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { AgencyForm } from "@/components/admin/agency-form";

export const metadata = { title: "Nouvelle agence — AERIA Admin" };

export default function NewAgencyPage() {
	return (
		<DashboardLayoutRight
			title="Créer une agence"
			subtitle="Cette agence sera approuvée automatiquement"
		>
			<div className="max-w-3xl">
				<AgencyForm />
			</div>
		</DashboardLayoutRight>
	);
}
