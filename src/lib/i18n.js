import { programs } from "@/lib/data/programs";
import { programsEN } from "@/lib/i18n/programs.en";
import { programsFR } from "@/lib/i18n/programs.fr";
import { hydratePrograms } from "@/lib/i18n/helpers";

import { FaBookOpen, FaHeadphones, FaTools } from "react-icons/fa";

// ════════════════════════════════════════════════════════════════════════════
//  SHARED ASSETS
//  Icon paths used across multiple sections. Update once, applied everywhere.
// ════════════════════════════════════════════════════════════════════════════
const shipIcon = "/images/ship-icon.svg";
const globeIcon = "/images/globe-icon.svg";
const mapIcon = "/images/map-icon.svg";
// const riverIcon = "/images/river-icon.svg";
// const compassIcon = "/images/compass-icon.svg";

// ════════════════════════════════════════════════════════════════════════════
//  ABOUT PAGE — ENGLISH
//  Standalone export because the about page imports it directly in places.
// ════════════════════════════════════════════════════════════════════════════
export const aboutEN = {
	// ── Hero section ────────────────────────────────────────────────────────
	heroEyebrow: "About the Academy",
	heroHeadline: "Real travel education,",
	heroHeadlineEm: "built by an agent who sells.",
	heroSub:
		"ÆRIA Voyages Academy is continuing education for travel agents who want to know their products inside out, qualify clients faster, and sell with genuine confidence.",
	heroCta: "Browse the library",
	heroSecondary: "Our story",

	// ── Why this exists ─────────────────────────────────────────────────────
	whyLabel: "Why this exists",
	whyTitle: "Not theory.",
	whyTitleEm: "Field expertise.",
	whyP1:
		"Most travel agent training is built around general concepts, not the products your clients are actually asking about. When a client says they want a luxury expedition cruise, you need to know which lines do it best, which ships to recommend, and how to close the sale. No generic training gives you that.",
	whyP2:
		"ÆRIA Voyages Academy was built from real agency experience: every module, article, and podcast episode reflects what actually works at the point of sale. Cruises, destinations, tour operators, the art of selling travel itself.",

	// ── Pillars (the three learning paths) ──────────────────────────────────
	pillarsLabel: "What you'll learn",
	pillarsTitle: "The Pillars of Travel Expertise",
	pillars: [
		{
			icon: shipIcon,
			title: "Cruises Specialist",
			desc: "Product mastery from mass market to ultra-luxury and expedition niches.",
		},
		{
			icon: globeIcon,
			title: "Destinations Expert",
			desc: "In-depth guides to recommend destinations with confidence and nuance.",
		},
		{
			icon: mapIcon,
			title: "Tours Specialist",
			desc: "Know which operators to recommend and why, before your client asks.",
		},
	],

	// ── What makes this different (4-card grid) ─────────────────────────────
	diffLabel: "What makes this different",
	diffTitle: "Built for working agents",
	differentiators: [
		{
			title: "Self-paced",
			desc: "Learn at your own rhythm, on your schedule. No cohort, no deadlines.",
			src: "/images/about-diff-1.webp",
			alt: "self-paced",
		},
		{
			title: "Agent-specific",
			desc: "Not for curious travelers. For professionals who sell travel for a living.",
			src: "/images/about-diff-2.webp",
			alt: "agent-specific",
		},
		{
			title: "Actionable",
			desc: "Concrete examples, real numbers, and takeaways you can use this week.",
			src: "/images/about-diff-3.webp",
			alt: "actionable",
		},
		{
			title: "Always growing",
			desc: "New courses, articles, and podcast episodes added on a regular basis.",
			src: "/images/about-diff-4.webp",
			alt: "always growing",
		},
	],

	// ── Formats (how you'll learn) ──────────────────────────────────────────
	formatsLabel: "How you'll learn",
	formatsTitle: "Multiple formats,",
	formatsTitleLine2: "one library.",
	formatsDescription:
		"Access a modern travel advisor learning library designed to fit the way you actually work: in-depth articles, immersive podcast lectures, and practical tools built to turn knowledge into real-world expertise. Helping you learn faster, advise clients more confidently, and sell with greater precision.",
	formats: [
		{ icon: FaBookOpen, label: "Articles & guides" },
		{ icon: FaHeadphones, label: "Podcast lectures" },
		{ icon: FaTools, label: "Toolkits & checklists" },
	],

	// ── Instructor bio ──────────────────────────────────────────────────────
	bioImage: "/images/about-bio.webp",
	bioLabel: "Your instructor",
	bioTitle: "Behind the Academy",
	bioName: "Yvan Junior Blanchette",
	bioRole: "Founder, ÆRIA Voyages · Creator, ÆRIA Voyages Academy",
	bioText:
		"A working travel agent with hands-on expertise in cruise sales, from mainstream lines to ultra-luxury, expedition, and world voyages. ÆRIA Voyages Academy is the training I wish I had when I started, built from real client conversations and real sales experience.",

	// ── Final CTA ───────────────────────────────────────────────────────────
	finalCtaLine: "Ready to sell with more confidence?",
	finalCta: "Start learning today",
};

// ════════════════════════════════════════════════════════════════════════════
//  ABOUT PAGE — FRENCH
//  Mirrors aboutEN structure exactly.
// ════════════════════════════════════════════════════════════════════════════
export const aboutFR = {
	// ── Hero section ────────────────────────────────────────────────────────
	heroEyebrow: "À propos de l'Académie",
	heroHeadline: "Une formation terrain,",
	heroHeadlineEm: "créée par un agent qui vend.",
	heroSub:
		"L'Académie ÆRIA Voyages est une formation continue pour les agents de voyages qui veulent maîtriser leurs produits, qualifier leurs clients plus rapidement et vendre avec une véritable confiance.",
	heroCta: "Explorer la bibliothèque",
	heroSecondary: "Notre histoire",

	// ── Why this exists ─────────────────────────────────────────────────────
	whyLabel: "Pourquoi ça existe",
	whyTitle: "Pas de théorie.",
	whyTitleEm: "De l'expertise terrain.",
	whyP1:
		"La plupart des formations pour agents de voyages reposent sur des concepts généraux, pas sur les produits que vos clients demandent vraiment. Quand un client veut une croisière expédition de luxe, vous devez savoir quelles compagnies sont les meilleures, quels navires recommander et comment conclure la vente. Aucune formation générique ne vous donne ça.",
	whyP2:
		"L'Académie ÆRIA Voyages est née d'une expérience réelle en agence : chaque module, article et capsule reflète ce qui fonctionne vraiment au point de vente. Croisières, destinations, voyagistes, l'art même de vendre le voyage.",

	// ── Pillars (the three learning paths) ──────────────────────────────────
	pillarsLabel: "Ce que vous apprendrez",
	pillarsTitle: "Les Piliers d'expertise en voyage",
	pillars: [
		{
			icon: shipIcon,
			title: "Spécialiste en Croisières",
			desc: "Maîtrise des produits, du marché de masse aux niches ultra-luxe et expédition.",
		},
		{
			icon: globeIcon,
			title: "Expert en Destinations",
			desc: "Guides approfondis pour vendre les destinations avec confiance et nuance.",
		},
		{
			icon: mapIcon,
			title: "Spécialiste en Circuits",
			desc: "Sachez quels voyagistes recommander, et pourquoi, avant même que votre client le demande.",
		},
	],

	// ── What makes this different (4-card grid) ─────────────────────────────
	diffLabel: "Ce qui nous distingue",
	diffTitle: "Conçu pour les agents actifs",
	differentiators: [
		{
			title: "À votre rythme",
			desc: "Apprenez selon votre horaire. Aucune cohorte, aucune échéance.",
			src: "/images/about-diff-1.webp",
			alt: "self-paced",
		},
		{
			title: "Pour les agents",
			desc: "Pas pour les voyageurs curieux. Pour les professionnels qui vivent de la vente de voyages.",
			src: "/images/about-diff-2.webp",
			alt: "agent-specific",
		},
		{
			title: "Concret et applicable",
			desc: "Des exemples réels, des chiffres précis et des apprentissages utilisables dès cette semaine.",
			src: "/images/about-diff-3.webp",
			alt: "actionable",
		},
		{
			title: "Toujours en croissance",
			desc: "De nouveaux cours, articles et capsules sont ajoutés régulièrement.",
			src: "/images/about-diff-4.webp",
			alt: "always growing",
		},
	],

	// ── Formats (how you'll learn) ──────────────────────────────────────────
	formatsLabel: "Comment vous apprendrez",
	formatsTitle: "Plusieurs formats,",
	formatsTitleLine2: "une seule bibliothèque.",
	formatsDescription:
		"Accédez à une bibliothèque de formation pensée pour les conseillers en voyages modernes : des articles approfondis, des capsules audio à écouter en déplacement, et des outils pratiques conçus pour transformer la théorie en expertise terrain. Pour vous permettre d'apprendre plus vite, mieux conseiller, et vendre avec davantage de confiance.",
	formats: [
		{ icon: FaBookOpen, label: "Articles & guides" },
		{ icon: FaHeadphones, label: "Capsules audio" },
		{ icon: FaTools, label: "Boîtes à outils & listes" },
	],

	// ── Instructor bio ──────────────────────────────────────────────────────
	bioImage: "/images/about-bio.webp",
	bioLabel: "Votre formateur",
	bioTitle: "Derrière l'Académie",
	bioName: "Yvan Junior Blanchette",
	bioRole: "Fondateur, ÆRIA Voyages · Créateur, Académie ÆRIA Voyages",
	bioText:
		"Agent de voyages actif, avec une expertise terrain en vente de croisières des grandes compagnies au ultra-luxe, en passant par l'expédition et les world cruises. L'Académie ÆRIA Voyages, c'est la formation que j'aurais voulu avoir à mes débuts, construite à partir de vraies conversations clients et d'une vraie expérience terrain.",

	// ── Final CTA ───────────────────────────────────────────────────────────
	finalCtaLine: "Prêt à vendre avec plus de confiance ?",
	finalCta: "Commencer à apprendre",
};

// ════════════════════════════════════════════════════════════════════════════
//  MAIN DICTIONARY
//  Everything below is per-locale. Add new languages by adding a new key.
// ════════════════════════════════════════════════════════════════════════════
export const dict = {
	// ████████████████████████████████████████████████████████████████████████
	//                                ENGLISH
	// ████████████████████████████████████████████████████████████████████████
	en: {
		programs: hydratePrograms(programs, programsEN),
		// ── NAV — top navigation labels ─────────────────────────────────────
		nav: {
			academy: "Academy",
			learningPaths: "Learning Paths",
			cruises: "Cruises",
			oceanCruises: "Ocean Cruises",
			riverCruises: "River Cruises",
			expeditionCruises: "Expedition Cruises",
			destinations: "Destinations",
			tours: "Tours",
			about: "About",
			pricing: "Pricing",
			joinAcademy: "Sign In",
		},

		// ── HERO — homepage hero section ────────────────────────────────────
		hero: {
			eyebrow: "Knowledge. Experience. Mastery.",
			headline: "Master the World of Travel",
			sub: "Advanced education and insider intelligence for travel professionals and passionate explorers.",
			cta: "Join the Academy",
			ctaUpgrade: "Upgrade your access",
		},

		// ── ARTICLES — "Latest Lessons" homepage section ────────────────────
		articles: {
			sectionLabel: "Academy Lessons",
			sectionTitle: "Latest Lessons",
			viewAll: "View All Lessons",
			readMore: "Read More",
			featured: "Featured",
		},

		// ── LECTURES — "Latest Lectures" homepage section (podcast cards) ───
		lectures: {
			sectionLabel: "On-the-Go Learning",
			sectionTitle: "Latest Lectures",
			viewAll: "View All Lectures",
			listen: "Listen Now",
			read: "Read More",
		},

		// ── LEARNING PATHS TEASER — short homepage version (3 cards) ────────
		//   Note: this is the SHORT teaser. The full section is `learningPaths` below.
		learningPathsTeaser: {
			sectionLabel: "Learning Paths",
			sectionTitle: "Choose Your Path",
			explore: "Explore Path",
			items: [
				{
					icon: shipIcon,
					title: "Cruises Specialist",
					desc: "Master the full spectrum from mass market to ultra-luxury cruising.",
				},
				{
					icon: globeIcon,
					title: "Destinations Expert",
					desc: "Deepen your knowledge of the world's most sought-after regions.",
				},
				{
					icon: mapIcon,
					title: "Tours Specialist",
					desc: "Master land tour operators like Globus, G Adventures, and more.",
				},
			],
		},

		// ── PODCAST — homepage podcast hosts section ────────────────────────
		podcast: {
			sectionLabel: "Host Lecturers",
			sectionTitle: "Jake Morgan & Tina Yards",
			desc: "Jake and Tina are two dynamic lecturers who take travel advisors on an immersive journey across the globe. From luxury cruises and iconic destinations to guided tours, hidden gems, and evolving travel trends, each episode is designed to help Academy members deepen their product knowledge, sharpen their sales approach, and grow their travel business with confidence. Through engaging conversations, practical insights, and real-world advisor strategies, Jake and Tina transform travel education into an experience that feels inspiring, entertaining, and genuinely useful for today's modern travel professional.",
			disclaimer:
				"Jake and Tina are fictional AI-interpreted characters created to make the podcast more immersive, entertaining, and insightful for listeners.",
			cta: "Become a Member",
			podcastName: "Beyond the Horizons",
		},

		// ── LEARNING PATHS — full homepage section with the 3 program cards ─
		//   Each path's slug must match the corresponding /[locale]/<slug> page.
		learningPaths: {
			sectionLabel: "Learning Paths",
			title: "The Pillars of the Travel Industry",
			subtitle: "Choose the route that fits your ambition",
			paragraphs: [
				"At ÆRIA Voyages Academy, we know that no two travel careers look the same. Whether you're drawn to the open sea, captivated by far-off cultures, or excited by the art of crafting unforgettable itineraries, we've built three focused Learning Paths to help you grow into the specialist you want to be.",
				"Each path is structured, practical, and designed by people who actually work in the industry, so you graduate ready to advise, sell, and inspire with confidence.",
			],
			paths: [
				// ── Cruises Specialist Program ──
				{
					slug: "cruises",
					title: "Cruises Specialist Program",
					img: "/images/cruises-poster.webp",
					video: "/videos/cruises.webm",
					subtitle: "Become the go-to expert your clients trust when they're ready to set sail.",
					content: {
						description:
							"The cruise industry is one of the fastest-growing segments in travel, and one of the most rewarding to sell. This path takes you from the fundamentals of cruising to the nuances that turn a good recommendation into a perfect match.",
						list: {
							title: "What you'll learn:",
							items: [
								"The major cruise lines and what sets each one apart",
								"Ocean, river, expedition, and luxury cruising",
								"Ships, cabin categories, and onboard experiences",
								"Itinerary planning, ports of call, and shore excursions",
								"Booking processes, groups, and commission structures",
								"How to match the right cruise to the right client",
							],
						},
						note: "Who it's for: new advisors building their foundation, or experienced agents ready to deepen their cruise expertise and grow their bookings.",
						cta: "Start Learning",
					},
				},
				// ── Destinations Expert Program ──
				{
					slug: "destinations",
					title: "Destinations Expert Program",
					img: "/images/destinations-poster.webp",
					video: "/videos/destinations.webm",
					subtitle: "Turn the whole world into your area of expertise.",
					content: {
						description:
							"Great travel advisors don't just sell trips, they sell knowledge. This path develops the cultural fluency, geographic insight, and destination know-how that separate true experts from order-takers. You'll learn to advise clients with the kind of detail that builds trust and earns referrals.",
						list: {
							title: "What you'll learn:",
							items: [
								"Key regions of Europe, the Americas, Africa, Asia, and Oceania",
								"Must-see destinations and the best hidden gems",
								"Seasonality, climate, and the best time to travel where",
								"Cultural etiquette, local customs, and travel realities",
								"Entry requirements, visas, and safety information",
								"How to design itineraries that feel personal",
							],
						},
						note: "Who it's for: advisors who want to specialize by region or build broad global expertise that lets them confidently sell anywhere in the world.",
						cta: "Start Learning",
					},
				},
				// ── Tours Specialist Program ──
				{
					slug: "tours",
					title: "Tours Specialist Program",
					img: "/images/tours-poster.webp",
					video: "/videos/tours.webm",
					subtitle: "Master the partnerships that power exceptional trips.",
					content: {
						description:
							"Behind every great packaged journey is a tour operator, and knowing how to work with them is one of the most valuable skills in the industry. This path teaches you how to navigate the tour operator landscape, choose the right partner for each client, and structure bookings that maximize both client satisfaction and your own profitability.",
						list: {
							title: "What you'll learn:",
							items: [
								"The major tour operators and their specialties",
								"Group tours, independent packages, custom itineraries, and FIT travel",
								"How to read, compare, and customize tour operator offerings",
								"Booking processes, terms, and supplier relationships",
								"Commission structures and how to optimize your earnings",
								"Managing client expectations and objections",
							],
						},
						note: "Who it's for: advisors looking to scale their business by working efficiently with trusted suppliers, and those who want to confidently sell packaged and semi-custom travel.",
						cta: "Start Learning",
					},
				},
			],
			closingTitle: "Not sure where to start?",
			closingParagraph: [
				"That's okay, many of our students complete more than one path at a time. If you're new to the industry, we recommend starting with the path that excites you most. Passion is the best fuel for learning.",
				"Have questions about which path is right for you? Reach out to our Academy team, we'd love to help you map out your journey.",
			],
		},

		// ── PRICING — plans and access messaging ───────────────────────────
		pricing: {
			pageTitle: "Choose your plan",
			pageSubtitle: "Get access to all ÆRIA courses and progress at your own pace. No commitment.",
			canceledNotice: "Payment canceled. You can try again anytime.",
			planCard: {
				current: "Current plan",
				included: "Included with your account",
				createAccount: "Create an account",
				loginRequired: "Login required",
				changePlan: "Change plan",
				subscribe: "Subscribe",
				recommended: "Recommended",
				manageSubscription: "Manage my subscription →",
				securePayment: "Secure payment by Stripe",
				cancelAnytime: "Cancel anytime",
			},
			plans: {
				free: {
					title: "Member Discovery",
					name: "Discovery",
					description: "Discover the ÆRIA Voyages Academy with free access",
					period: "Free",
					features: ["Free courses", "Free audio capsules", "Account creation"],
				},
				academy: {
					title: "Member Academy",
					name: "Academy",
					description: "Unlimited access to every course in the ÆRIA travel academy",
					period: "/ month",
					features: ["Access to ALL courses", "All audio capsules", "Quizzes and certificates", "New courses included", "Cancel anytime"],
				},
				prime: {
					title: "Member Prime",
					name: "Prime",
					description: "Academy + personalized coaching",
					period: "/ month",
					features: ["Everything in Academy", "Monthly coaching sessions", "Priority support", "Exclusive content"],
				},
			},
		},

		access: {
			not_authenticated: {
				title: "Login required",
				message: "Log in to access this course.",
				cta: "Log in",
			},
			no_access: {
				title: "Subscription required",
				message: "This course is reserved for Academy or Prime members. You can also buy it individually.",
				cta: "View subscriptions",
			},
			default: {
				title: "Access not authorized",
				message: "You do not have access to this content.",
				cta: "Back to catalog",
			},
		},

		// ── FOOTER — site-wide footer ───────────────────────────────────────
		footer: {
			tagline: "Knowledge is the compass.\nExperience is the vessel.\nTogether, they create mastery.",
			academy: "ÆRIA Voyages Academy",
			links: {
				academy: ["Learning Paths", "Articles", "Lectures", "Resources", "Membership"],
				explore: ["Destinations", "Cruises", "Tour Operators", "Expedition Travel"],
				company: ["About Us", "The Podcast", "Work With Us", "Contact"],
			},
			copyright: `© ${new Date().getFullYear()} ÆRIA Voyages Academy. All rights reserved.`,
			privacy: "Privacy",
			terms: "Terms of Use",
		},

		// ── ABOUT PAGE ──────────────────────────────────────────────────────
		about: aboutEN,
	},

	// ████████████████████████████████████████████████████████████████████████
	//                                FRENCH
	// ████████████████████████████████████████████████████████████████████████
	fr: {
		programs: hydratePrograms(programs, programsFR),
		// ── NAV — étiquettes de la navigation principale ────────────────────
		nav: {
			academy: "Académie",
			learningPaths: "Parcours",
			cruises: "Croisières",
			oceanCruises: "Croisières Océaniques",
			riverCruises: "Croisières Fluviales",
			expeditionCruises: "Croisières Expéditions",
			destinations: "Destinations",
			tours: "Circuits",
			about: "À Propos",
			pricing: "Tarification",
			joinAcademy: "Se connecter",
		},

		// ── HERO — section d'accueil ────────────────────────────────────────
		hero: {
			eyebrow: "Connaissance. Expérience. Maîtrise.",
			headline: "Maîtrisez le Monde du Voyage",
			sub: "Formation avancée et renseignements privilégiés pour les professionnels du voyage et les explorateurs passionnés.",
			cta: "Entrer dans l'Académie",
			ctaUpgrade: "Améliorer votre accès",
		},

		// ── ARTICLES — section « Derniers Articles » de l'accueil ───────────
		articles: {
			sectionLabel: "Cours de l'Académie",
			sectionTitle: "Cours Recommandés",
			viewAll: "Voir tous les cours",
			readMore: "Lire la suite",
			featured: "À la une",
		},

		// ── LECTURES — section « Dernières Capsules » (cartes audio) ────────
		lectures: {
			sectionLabel: "Apprentissage en Déplacement",
			sectionTitle: "Dernières Capsules",
			viewAll: "Voir toutes les capsules",
			listen: "Écouter maintenant",
			read: "Lire la suite",
		},

		// ── PARCOURS — version courte de l'accueil (3 cartes) ───────────────
		//   Note : version courte pour l'accueil. La version complète est dans `learningPaths` plus bas.
		learningPathsTeaser: {
			sectionLabel: "Parcours d'apprentissage",
			sectionTitle: "Choisissez votre parcours",
			explore: "Explorer",
			items: [
				{
					icon: shipIcon,
					title: "Spécialiste en Croisières",
					desc: "Maîtrisez la gamme complète, du marché de masse à l'ultra-luxe.",
				},
				{
					icon: globeIcon,
					title: "Expert des Destinations",
					desc: "Approfondissez votre connaissance des destinations les plus prisées au monde.",
				},
				{
					icon: mapIcon,
					title: "Spécialiste en Circuits",
					desc: "Maîtrisez les voyagistes comme Globus, G Adventures, et plus encore.",
				},
			],
		},

		// ── PODCAST — section des animateurs de l'accueil ───────────────────
		podcast: {
			sectionLabel: "Animateurs des capsules",
			sectionTitle: "Jake Morgan et Tina Yards",
			desc: "Jake et Tina sont deux animateurs dynamiques qui accompagnent les conseillers en voyages dans une immersion à travers le monde. Des destinations emblématiques aux croisières de luxe, en passant par les circuits organisés, les expériences uniques et les nouvelles tendances de l'industrie, chaque épisode a été conçu pour aider les membres de l'Académie à approfondir leurs connaissances, perfectionner leurs techniques de vente, et faire grandir leur entreprise avec confiance. À travers des conversations captivantes, des conseils concrets et des stratégies directement inspirées du terrain, Jake et Tina transforment la formation en une expérience à la fois inspirante, divertissante, et réellement utile pour les professionnels du voyage d'aujourd'hui.",
			disclaimer:
				"Jake et Tina sont des personnages fictifs interprétés à l'aide de l'intelligence artificielle afin de créer une expérience d'apprentissage plus immersive, divertissante et enrichissante.",
			cta: "Devenir membre",
			podcastName: "Beyond the Horizons",
		},

		// ── PARCOURS — section complète de l'accueil (3 programmes) ─────────
		//   Le slug de chaque parcours doit correspondre à la page /[locale]/<slug>.
		learningPaths: {
			sectionLabel: "Parcours d'apprentissage",
			title: "Les Piliers de l'Industrie du Voyage",
			subtitle: "Choisissez la voie qui correspond à votre ambition",
			paragraphs: [
				"À l'Académie ÆRIA Voyages, nous savons qu'aucune carrière en voyage ne se ressemble. Que vous soyez attiré par le large, captivé par les cultures lointaines, ou passionné par l'art de concevoir des itinéraires inoubliables, nous avons créé trois parcours d'apprentissage ciblés pour vous aider à devenir le spécialiste que vous souhaitez être.",
				"Chaque parcours est structuré, pratique, et conçu par des gens qui travaillent réellement dans l'industrie, afin que vous en sortiez prêt à conseiller, vendre, et inspirer avec confiance.",
			],
			paths: [
				// ── Programme Spécialiste en Croisières ──
				{
					slug: "cruises",
					title: "Spécialiste en Croisières",
					img: "/images/cruises-poster.webp",
					video: "/videos/cruises.webm",
					subtitle: "Devenez l'expert de référence à qui vos clients font confiance quand vient le temps de prendre le large.",
					content: {
						description:
							"L'industrie de la croisière est l'un des segments les plus en croissance du voyage, et l'un des plus gratifiants à vendre. Ce parcours vous mène des fondamentaux aux nuances qui transforment une bonne recommandation en correspondance parfaite.",
						list: {
							title: "Ce que vous apprendrez :",
							items: [
								"Les principales compagnies de croisière et ce qui distingue chacune",
								"Croisières océaniques, fluviales, expéditions, et de luxe",
								"Les navires, catégories de cabines, et expériences à bord",
								"La planification d'itinéraires, les ports d'escale, et les excursions",
								"Les processus de réservation, les groupes, et les structures de commissions",
								"Comment associer la bonne croisière au bon client",
							],
						},
						note: "Pour qui : les nouveaux conseillers qui bâtissent leurs fondations, ou les agents expérimentés prêts à approfondir leur expertise en croisières et à faire croître leurs ventes.",
						cta: "Commencer l'apprentissage",
					},
				},
				// ── Programme Expert en Destinations ──
				{
					slug: "destinations",
					title: "Expert des Destinations",
					img: "/images/destinations-poster.webp",
					video: "/videos/destinations.webm",
					subtitle: "Faites du monde entier votre champ d'expertise.",
					content: {
						description:
							"Les grands conseillers en voyages ne vendent pas que des voyages, ils vendent du savoir. Ce parcours développe la fluidité culturelle, la perspicacité géographique, et la connaissance approfondie qui distinguent les véritables experts. Vous apprendrez à conseiller vos clients avec un niveau de détail qui inspire confiance et génère des références.",
						list: {
							title: "Ce que vous apprendrez :",
							items: [
								"Europe, Amériques, Afrique, Asie, Océanie, Pôles",
								"Les destinations incontournables et trésors cachés",
								"La saisonnalité et le meilleur moment pour voyager",
								"Les coutumes locales, et les réalités du voyage",
								"Les exigences d'entrée, et les informations de sécurité",
								"Comment concevoir des itinéraires personnalisés",
							],
						},
						note: "Pour qui : les conseillers qui veulent se spécialiser par région ou bâtir une expertise mondiale étendue qui leur permet de vendre n'importe où dans le monde avec confiance.",
						cta: "Commencer l'apprentissage",
					},
				},
				// ── Programme Spécialiste en Circuits ──
				{
					slug: "tours",
					title: "Spécialiste en Circuits",
					img: "/images/tours-poster.webp",
					video: "/videos/tours.webm",
					subtitle: "Maîtrisez les partenariats qui font les voyages d'exception.",
					content: {
						description:
							"Derrière chaque grand voyage organisé se trouve un voyagiste, et savoir comment travailler avec eux est l'une des compétences les plus précieuses de l'industrie. Ce parcours vous enseigne à naviguer dans le paysage des voyagistes, choisir le bon partenaire pour chaque client, et structurer des réservations qui maximisent à la fois la satisfaction du client et votre propre rentabilité.",
						list: {
							title: "Ce que vous apprendrez :",
							items: [
								"Les principaux voyagistes et leurs spécialités",
								"Les circuits de groupe, forfaits indépendants, itinéraires sur mesure, et voyages FIT",
								"Comment lire, comparer, et personnaliser les offres des voyagistes",
								"Les processus de réservation, les conditions, et les relations fournisseurs",
								"Les structures de commissions et comment optimiser vos revenus",
								"La gestion des attentes et des objections des clients",
							],
						},
						note: "Pour qui : les conseillers qui souhaitent faire croître leur entreprise en travaillant efficacement avec des fournisseurs de confiance, et ceux qui veulent vendre des voyages organisés et semi-personnalisés avec assurance.",
						cta: "Commencer l'apprentissage",
					},
				},
			],
			closingTitle: "Vous ne savez pas par où commencer ?",
			closingParagraph: [
				"C'est tout à fait normal, plusieurs de nos étudiants complètent plus d'un parcours à la fois. Si vous êtes nouveau dans l'industrie, nous vous recommandons de commencer par le parcours qui vous enthousiasme le plus. La passion est le meilleur carburant pour l'apprentissage.",
				"Vous avez des questions sur le parcours qui vous convient ? Contactez notre équipe de l'Académie, nous serons ravis de vous aider à tracer votre route.",
			],
		},

		// ── TARIFICATION — plans et messages d'accès ───────────────────────
		pricing: {
			pageTitle: "Choisis ton plan d'abonnement",
			pageSubtitle: "Accède à tous les cours ÆRIA et progresse à ton rythme. Sans engagement.",
			canceledNotice: "Paiement annulé. Tu peux réessayer à tout moment.",
			planCard: {
				current: "Plan actuel",
				included: "Inclus avec ton compte",
				createAccount: "Créer un compte",
				loginRequired: "Connexion requise",
				changePlan: "Changer de plan",
				subscribe: "S'abonner",
				recommended: "Recommandé",
				manageSubscription: "Gérer mon abonnement →",
				securePayment: "Paiement sécurisé par Stripe",
				cancelAnytime: "Annulation possible à tout moment",
			},
			plans: {
				free: {
					title: "Membre Découverte",
					name: "Découverte",
					description: "Découvre l'académie ÆRIA Voyages en libre accès",
					period: "Gratuit",
					features: ["Cours gratuits", "Capsules audio en accès libre", "Création de compte"],
				},
				academy: {
					title: "Membre Académie",
					name: "Académie",
					description: "Accès illimité à tous les cours de l'académie de voyages ÆRIA",
					period: "/ mois",
					features: ["Accès à TOUS les cours", "Toutes les capsules audio", "Tests et certificats", "Nouveaux cours inclus", "Annulable à tout moment"],
				},
				prime: {
					title: "Membre Prime",
					name: "Prime",
					description: "Académie + accompagnement personnalisé",
					period: "/ mois",
					features: ["Tout ce qui est dans Académie", "Sessions de coaching mensuelles", "Support prioritaire", "Contenus exclusifs"],
				},
			},
		},

		access: {
			not_authenticated: {
				title: "Connexion requise",
				message: "Connecte-toi pour accéder à ce cours.",
				cta: "Se connecter",
			},
			no_access: {
				title: "Abonnement requis",
				message: "Ce cours est réservé aux membres Académie ou Prime. Tu peux aussi l'acheter individuellement.",
				cta: "Voir les abonnements",
			},
			default: {
				title: "Accès non autorisé",
				message: "Tu n'as pas accès à ce contenu.",
				cta: "Retour au catalogue",
			},
		},

		// ── PIED DE PAGE — bas de page du site ──────────────────────────────
		footer: {
			tagline: "La connaissance est la boussole.\nL'expérience est le navire.\nEnsemble, ils créent la maîtrise.",
			academy: "Académie ÆRIA Voyages",
			links: {
				academy: ["Parcours", "Articles", "Capsules", "Ressources", "Adhésion"],
				explore: ["Destinations", "Croisières", "Voyagistes", "Expéditions"],
				company: ["À Propos", "Le Podcast", "Travailler avec Nous", "Contact"],
			},
			copyright: `© ${new Date().getFullYear()} Académie ÆRIA Voyages. Tous droits réservés.`,
			privacy: "Confidentialité",
			terms: "Conditions d'utilisation",
		},

		// ── PAGE À PROPOS ───────────────────────────────────────────────────
		about: aboutFR,
	},
};
