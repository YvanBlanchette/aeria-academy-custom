export const renameUserRole = (role) => {
	switch (role) {
		case "STUDENT":
			return "Étudiant";
		case "INSTRUCTOR":
			return "Instructeur";
		case "ADMIN":
			return "Administrateur";
		default:
			return "Inconnu";
	}
};
