"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, ThumbsUp, UserPlus } from "lucide-react";
import { FaBell } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { formatSocialRelativeTime } from "@/lib/time";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const NOTIFICATIONS_LIMIT = 8;

function NotificationIcon({ type }) {
	if (type === "POST_LIKE") return <ThumbsUp className="h-3.5 w-3.5" />;
	if (type === "POST_COMMENT") return <MessageCircle className="h-3.5 w-3.5" />;
	return <UserPlus className="h-3.5 w-3.5" />;
}

export function CommunityNotificationsMenu() {
	const router = useRouter();
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);

	async function markAsRead(notificationId) {
		try {
			const response = await fetch("/api/community/notifications", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ notificationId }),
			});
			if (!response.ok) return;
			const payload = await response.json();
			if (typeof payload.unreadCount === "number") {
				setUnreadCount(payload.unreadCount);
			}
		} catch {
			// Keep optimistic UI
		}
	}

	async function markAllAsRead() {
		try {
			const response = await fetch("/api/community/notifications", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ markAll: true }),
			});
			if (!response.ok) return;
			const payload = await response.json();
			setNotifications([]);
			if (typeof payload.unreadCount === "number") {
				setUnreadCount(payload.unreadCount);
			}
		} catch {
			// Keep current UI if request fails.
		}
	}

	async function handleNotificationSelect(item) {
		if (!item?.href) return;

		if (!item.isRead) {
			setNotifications((prev) => prev.filter((n) => n.id !== item.id));
			setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
			await markAsRead(item.id);
		}

		router.push(item.href);
	}

	useEffect(() => {
		let isMounted = true;

		async function loadNotifications() {
			try {
				const response = await fetch(`/api/community/notifications?limit=${NOTIFICATIONS_LIMIT}`, {
					cache: "no-store",
				});
				if (!response.ok) return;
				const payload = await response.json();
				if (!isMounted) return;
				setNotifications(Array.isArray(payload.notifications) ? payload.notifications : []);
				setUnreadCount(typeof payload.unreadCount === "number" ? payload.unreadCount : 0);
			} catch {
				if (!isMounted) return;
				setNotifications([]);
				setUnreadCount(0);
			}
		}

		loadNotifications();

		return () => {
			isMounted = false;
		};
	}, []);

	const unreadLabel = unreadCount > 99 ? "99+" : String(unreadCount);
	function renderNotificationItem(item) {
		const actorName = item.actor?.name || item.actor?.email || "Membre";
		const actionText = item.type === "POST_LIKE" ? "a aime ton post" : item.type === "POST_COMMENT" ? "a commente ton post" : "a commence a te suivre";
		const dateLabel = formatSocialRelativeTime(item.createdAt);

		return (
			<DropdownMenuItem
				key={item.id}
				className="bg-accent/50"
				onSelect={() => handleNotificationSelect(item)}
			>
				<div className="flex w-full flex-col items-start">
					<span className="line-clamp-1 inline-flex items-center gap-1 text-xs font-medium">
						<NotificationIcon type={item.type} />
						{actorName} {actionText}
					</span>
					{item.post?.content ? <span className="line-clamp-1 text-[11px] text-muted-foreground">{item.post.content}</span> : null}
					{dateLabel ? <span className="text-[10px] text-muted-foreground">{dateLabel}</span> : null}
				</div>
			</DropdownMenuItem>
		);
	}

	return (
		<DropdownMenu modal={false}>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="relative hover:bg-muted rounded-full p-4 w-12 h-12"
						>
							<FaBell className="h-8 w-8" />
							<span className="sr-only">Notifications</span>
							{unreadCount > 0 ? (
								<span className="absolute -right-0.5 -top-0.5 rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
									{unreadLabel}
								</span>
							) : null}
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p>Notifications</p>
				</TooltipContent>
			</Tooltip>
			<DropdownMenuContent
				align="end"
				className="w-80"
			>
				<div className="flex items-center justify-between px-2 py-1.5">
					<DropdownMenuLabel className="px-0">Notifications</DropdownMenuLabel>
					{notifications.length > 0 ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-7 rounded-full px-2 text-xs"
							onClick={markAllAsRead}
						>
							Tout marquer lu
						</Button>
					) : null}
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					{notifications.map((item) => renderNotificationItem(item))}
					{notifications.length === 0 ? <DropdownMenuLabel>Aucune notification</DropdownMenuLabel> : null}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
