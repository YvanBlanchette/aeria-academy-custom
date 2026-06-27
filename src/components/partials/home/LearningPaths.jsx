"use client";

import { dict } from "@/lib/i18n";
import LearningPathCard from "@/components/LearningPathCard";

export default function LearningPaths({ locale }) {
	const t = dict[locale]?.learningPaths;
	const programs = dict[locale]?.programs;

	console.log("LearningPaths debug:", {
		locale,
		hasDict: !!dict[locale],
		hasPrograms: !!dict[locale]?.programs,
		programsLength: dict[locale]?.programs?.length,
		firstProgram: dict[locale]?.programs?.[0],
	});

	console.log(programs);
	return (
		<section
			id="learning-paths"
			className="py-28 bg-gray-50"
		>
			<div className="max-w-7xl mx-auto">
				<div className="mb-12">
					<p className="eyebrow mb-3">{t.sectionLabel}</p>
					<h1 className="font-display text-4xl md:text-5xl font-medium">{t.title}</h1>
				</div>

				<h2 className="text-2xl mb-3">{t.subtitle}</h2>
				<div>
					{t.paragraphs.map((p, i) => (
						<p
							key={i}
							className="text-stone-700 leading-relaxed mb-2"
						>
							{p}
						</p>
					))}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full">
					{programs.map((program) => (
						<LearningPathCard
							key={program.id}
							program={program}
							locale="fr"
						/>
					))}
				</div>
			</div>
		</section>
	);
}
