import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/profile-form";
import { AgencySelector } from "@/components/profile/agency-selector";

export const metadata = {
	title: "Mon profil | ÆRIA Voyages Academy",
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
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-neutral-100">
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
		</div>
	);
}
