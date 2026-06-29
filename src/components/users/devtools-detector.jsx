"use client";

import { useEffect, useState } from "react";

export function DevtoolsDetector() {
	const [detected, setDetected] = useState(false);

	useEffect(() => {
		const check = () => {
			const threshold = 160;
			const widthOpen = window.outerWidth - window.innerWidth > threshold;
			const heightOpen = window.outerHeight - window.innerHeight > threshold;
			if (widthOpen || heightOpen) {
				setDetected(true);
			}
		};

		check();
		const interval = setInterval(check, 1000);
		return () => clearInterval(interval);
	}, []);

	if (!detected) return null;

	return (
		<div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-8">
			<div className="text-center text-white max-w-md">
				<h2 className="text-2xl font-bold mb-3">Accès suspendu</h2>
				<p className="text-white/80">Les outils de développement ont été détectés. Ferme-les pour continuer à accéder au contenu.</p>
			</div>
		</div>
	);
}
