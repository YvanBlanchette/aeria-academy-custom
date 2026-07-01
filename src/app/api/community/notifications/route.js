import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCommunityEnabled } from "@/lib/platform-settings";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 10;

function parseLimit(value) {
	const parsed = Number.parseInt(String(value || DEFAULT_LIMIT), 10);
	if (Number.isNaN(parsed) || parsed < 1) return DEFAULT_LIMIT;
	return Math.min(parsed, MAX_LIMIT);
}

function parseNotificationId(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed ? trimmed : null;
}

function parseMarkAll(value) {
	return value === true;
}

export async function GET(request) {
	const session = await auth();
	if (!session?.user?.id) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const communityEnabled = await getCommunityEnabled();
	if (!communityEnabled) {
		return Response.json({
			unreadCount: 0,
			notifications: [],
		});
	}

	const { searchParams } = new URL(request.url);
	const limit = parseLimit(searchParams.get("limit"));
	const userId = session.user.id;

	const [notifications, unreadCount] = await Promise.all([
		prisma.communityNotification.findMany({
			where: {
				recipientId: userId,
			},
			orderBy: { createdAt: "desc" },
			take: limit,
			include: {
				actor: {
					select: {
						name: true,
						email: true,
						username: true,
						profile: { select: { publicProfile: true } },
					},
				},
				post: {
					select: { id: true, content: true },
				},
				comment: {
					select: { content: true },
				},
			},
		}),
		prisma.communityNotification.count({
			where: {
				recipientId: userId,
				isRead: false,
			},
		}),
	]);

	return Response.json({
		unreadCount,
		notifications: notifications.map((item) => ({
			id: item.id,
			type: item.type,
			isRead: item.isRead,
			createdAt: item.createdAt,
			actor: item.actor,
			post: item.post,
			comment: item.comment,
			href:
				item.type === "FOLLOW" && item.actor?.username ? `/users/${item.actor.username}` : item.postId ? `/community?focusPost=${item.postId}` : "/community",
		})),
	});
}

export async function POST(request) {
	const session = await auth();
	if (!session?.user?.id) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const communityEnabled = await getCommunityEnabled();
	if (!communityEnabled) {
		return Response.json({ success: true, unreadCount: 0 });
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const notificationId = parseNotificationId(body?.notificationId);
	const markAll = parseMarkAll(body?.markAll);
	if (!markAll && !notificationId) {
		return Response.json({ error: "notificationId is required" }, { status: 400 });
	}

	const userId = session.user.id;

	await prisma.communityNotification.updateMany({
		where: markAll
			? {
					recipientId: userId,
					isRead: false,
				}
			: {
					id: notificationId,
					recipientId: userId,
					isRead: false,
				},
		data: {
			isRead: true,
			readAt: new Date(),
		},
	});

	const unreadCount = await prisma.communityNotification.count({
		where: {
			recipientId: userId,
			isRead: false,
		},
	});

	return Response.json({ success: true, unreadCount });
}
