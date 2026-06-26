import Footer from "@/components/partials/Footer";
import Navigation from "@/components/partials/Navigation";

export default function DashboardLayout({ children }) {
	return (
		<div className="min-h-screen flex flex-col">
			<Navigation locale="fr" />
			<main className="flex-1 bg-neutral-50">{children}</main>
			<Footer locale="fr" />
		</div>
	);
}
