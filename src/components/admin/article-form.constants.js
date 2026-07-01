export const NEW_ARTICLE_DRAFT_KEY = "admin-article-new-draft-v1";
export const HISTORY_LIMIT = 80;

export const SLASH_COMMANDS = {
	"/h2": "\n## Nouveau sous-titre\n\n",
	"/h3": "\n### Nouveau titre niveau 3\n\n",
	"/list": "\n- Point 1\n- Point 2\n- Point 3\n",
	"/code": "\n```md\nVotre code ici\n```\n",
	"/callout": '\n::callout[Information importante]{type="info"}\n',
	"/quote": '\n::quote[Citation]{author="Auteur"}\n',
	"/video": "\n::video[https://youtube.com/watch?v=ID]\n",
};

export const ARTICLE_TEMPLATES = {
	guide: {
		label: "Guide pratique",
		title: "Guide: ",
		excerpt: "Guide rapide pour aider vos lecteurs a appliquer une methode claire.",
		content:
			"## Contexte\n\nExpliquez le probleme ou l'objectif en 3-4 phrases.\n\n## Etapes\n\n1. Etape 1\n2. Etape 2\n3. Etape 3\n\n## Points de vigilance\n\n::callout[Attention aux erreurs frequentes]{type=\"warning\"}\n\n## Conclusion\n\nResumer l'essentiel et proposer la prochaine action.",
		requiredTier: "FREE",
	},
	news: {
		label: "Annonce / actualite",
		title: "Annonce: ",
		excerpt: "Nouveaute importante a communiquer a la communaute.",
		content:
			"## Ce qui change\n\nDetaillez la nouveaute en termes simples.\n\n## Pourquoi c'est important\n\n- Benefice 1\n- Benefice 2\n\n## Date d'entree en vigueur\n\nPrecisez la date et les impacts.",
		requiredTier: "FREE",
	},
	caseStudy: {
		label: "Etude de cas",
		title: "Etude de cas: ",
		excerpt: "Retour d'experience detaille avec resultats concrets.",
		content:
			"## Situation initiale\n\nContexte client / equipe.\n\n## Strategie appliquee\n\nExpliquez les decisions prises.\n\n## Resultats\n\n- KPI 1\n- KPI 2\n\n## Lecons retenues\n\nCe qu'on reproduit, ce qu'on evite.",
		requiredTier: "ACADEMY",
	},
};
