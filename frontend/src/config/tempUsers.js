export const tempUsers = [
  {
    email: 'admin@efgb.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin Principal',
    permissions: ['all']
  },
  {
    email: 'teacher@efgb.com',
    password: 'teacher123',
    role: 'teacher',
    name: 'Professeur Test',
    permissions: ['view_courses', 'edit_courses', 'view_students', 'grade_students']
  },
  {
    email: 'student@efgb.com',
    password: 'student123',
    role: 'student',
    name: 'Étudiant Test',
    permissions: ['view_courses', 'submit_assignments', 'view_grades']
  }
];

// Fonction utilitaire pour vérifier les identifiants
export const checkCredentials = (email, password) => {
  const user = tempUsers.find(
    user => user.email === email && user.password === password
  );
  
  if (user) {
    // On retourne une copie sans le mot de passe pour la sécurité
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
}; 