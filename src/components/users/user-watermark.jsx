"use client";

export function UserWatermark({ user }) {
	if (!user) return null;
	const text = `${user.name || user.email} · ${user.id}`;

	return (
		<div
			className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
			style={{ opacity: 0.04 }}
		>
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `repeating-linear-gradient(
						-30deg,
						transparent,
						transparent 100px,
						currentColor 100px,
						currentColor 100px
					)`,
					backgroundSize: "300px 300px",
				}}
			>
				{Array.from({ length: 50 }).map((_, i) => (
					<div
						key={i}
						className="absolute text-xs font-mono whitespace-nowrap"
						style={{
							top: `${(i * 7) % 100}%`,
							left: `${(i * 13) % 100}%`,
							transform: "rotate(-30deg)",
						}}
					>
						{text}
					</div>
				))}
			</div>
		</div>
	);
}
