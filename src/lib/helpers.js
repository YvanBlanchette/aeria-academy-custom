export const renameUserRole = (role) => {
	switch (role) {
		case "STUDENT":
			return "Étudiant";
		case "TEACHER":
			return "Professeur";
		case "ADMIN":
			return "Administrateur";
		default:
			return "Inconnu";
	}
};
