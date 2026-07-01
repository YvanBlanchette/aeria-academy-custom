import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "global";

export async function getCommunityEnabled() {
	const row = await prisma.platformSettings.findUnique({
		where: { id: SETTINGS_ID },
		select: { data: true },
	});

	// Enabled by default unless explicitly disabled in admin settings.
	return row?.data?.enableCommunity !== false;
}
