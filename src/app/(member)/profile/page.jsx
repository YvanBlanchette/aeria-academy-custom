import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { ProfileForm } from "@/components/profile/profile-form";
import { AgencySelector } from "@/components/profile/agency-selector";

export const metadata = {
	title: "Mon profil | AERIA Voyages Academy",
};

export default async function ProfilePage() {
	const session = await auth();
	if (!session) redirect("/login?callbackUrl=/profile");

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		include: {
			profile: {
				include: { agency: true },
			},
		},
	});

	const currentAgency = user.profile?.agency || null;
	const isAgencyAdmin = currentAgency?.adminUserId === session.user.id;

	return (
		<DashboardLayoutRight
			title="Mon profil"
			subtitle="Gère tes informations personnelles et professionnelles"
		>
			<div className="space-y-6">
				<AgencySelector
					profile={user.profile}
					currentAgency={currentAgency}
					isAgencyAdmin={isAgencyAdmin}
				/>

				<ProfileForm
					profile={user.profile}
					user={user}
				/>
			</div>
		</DashboardLayoutRight>
	);
}
