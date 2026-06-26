/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			colors: {
				gold: {
					50: "#fdf9ee",
					100: "#f7edcc",
					200: "#eed896",
					300: "#e3be5e",
					400: "#d4a32a",
					500: "#b8891a",
					600: "#9a6f14",
					700: "#7a5610",
					800: "#5c3f0c",
					900: "#3d2908",
				},
				cream: "#faf8f4",
				charcoal: "#1a1a1a",
			},
			fontFamily: {
				serif: ["Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
				sans: ["Inter", "system-ui", "sans-serif"],
			},
			letterSpacing: {
				widest2: "0.25em",
			},
		},
	},
	plugins: [require("@tailwindcss/typography")],
};
