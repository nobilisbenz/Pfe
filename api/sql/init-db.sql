CREATE DATABASE `schoolmanagementsystem`;

USE schoolmanagementsystem;

-- ACADEMIC RELATED TABLES

CREATE TABLE academic_terms (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  duration VARCHAR(50) NOT NULL DEFAULT '3 months',
  created_by VARCHAR(36) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE academic_years (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  from_year DATETIME NOT NULL,
  to_year DATETIME NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT 0,
  created_by VARCHAR(36) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE academic_year_students (
  id VARCHAR(36) PRIMARY KEY,
  academic_year_id VARCHAR(36) NOT NULL,
  item_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

CREATE TABLE academic_year_teachers (
  id VARCHAR(36) PRIMARY KEY,
  academic_year_id VARCHAR(36) NOT NULL,
  item_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

CREATE TABLE class_levels (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by VARCHAR(36) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE class_level_students (
  class_level_id VARCHAR(36) NOT NULL,
  student_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (class_level_id, student_id),
  FOREIGN KEY (class_level_id) REFERENCES class_levels(id) ON DELETE CASCADE
);

CREATE TABLE class_level_subjects (
  class_level_id VARCHAR(36) NOT NULL,
  subject_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (class_level_id, subject_id),
  FOREIGN KEY (class_level_id) REFERENCES class_levels(id) ON DELETE CASCADE
);

CREATE TABLE class_level_teachers (
  class_level_id VARCHAR(36) NOT NULL,
  teacher_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (class_level_id, teacher_id),
  FOREIGN KEY (class_level_id) REFERENCES class_levels(id) ON DELETE CASCADE
);

CREATE TABLE courses (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  duration VARCHAR(50) NOT NULL,
  level ENUM('Débutant', 'Intermédiaire', 'Avancé') NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(255) DEFAULT '📚',
  program VARCHAR(36) NOT NULL,
  status ENUM('En cours', 'À venir', 'Terminé') NOT NULL DEFAULT 'À venir',
  maxStudents INT NOT NULL DEFAULT 30,
  enrolledStudents JSON,
  teacher VARCHAR(36),
  createdBy VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE exams (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  subject_id VARCHAR(36) NOT NULL,
  program_id VARCHAR(36) NOT NULL,
  pass_mark FLOAT NOT NULL DEFAULT 50,
  total_mark FLOAT NOT NULL DEFAULT 100,
  academic_term_id VARCHAR(36) NOT NULL,
  duration VARCHAR(50) NOT NULL DEFAULT '30 minutes',
  exam_date DATE NOT NULL,
  exam_time TIME NOT NULL,
  exam_type VARCHAR(50) NOT NULL DEFAULT 'Quiz',
  exam_status ENUM('pending', 'live', 'completed') NOT NULL DEFAULT 'pending',
  class_level_id VARCHAR(36) NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  academic_year_id VARCHAR(36) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (academic_term_id) REFERENCES academic_terms(id),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  FOREIGN KEY (class_level_id) REFERENCES class_levels(id)
);

CREATE TABLE exam_questions (
  exam_id VARCHAR(36) NOT NULL,
  question_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (exam_id, question_id),
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE TABLE exam_results (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  exam_id VARCHAR(36) NOT NULL,
  grade VARCHAR(10) NOT NULL,
  score FLOAT NOT NULL,
  pass_mark FLOAT NOT NULL DEFAULT 50,
  answered_questions JSON,
  status VARCHAR(10) NOT NULL DEFAULT 'Fail',
  remarks VARCHAR(50) NOT NULL DEFAULT 'Poor',
  class_level_id VARCHAR(36),
  academic_term_id VARCHAR(36) NOT NULL,
  academic_year_id VARCHAR(36) NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (academic_term_id) REFERENCES academic_terms(id),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  FOREIGN KEY (class_level_id) REFERENCES class_levels(id)
);

CREATE TABLE programs (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  duration VARCHAR(50) NOT NULL,
  code VARCHAR(20) NOT NULL,
  academic_year_id VARCHAR(36) NOT NULL,
  class_level_id VARCHAR(36) NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  status ENUM('En cours', 'Terminé', 'Planifié') NOT NULL DEFAULT 'Planifié',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  FOREIGN KEY (class_level_id) REFERENCES class_levels(id)
);

CREATE TABLE program_schedules (
  id VARCHAR(36) PRIMARY KEY,
  program_id VARCHAR(36) NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

CREATE TABLE schedule_days (
  id VARCHAR(36) PRIMARY KEY,
  schedule_id VARCHAR(36) NOT NULL,
  day ENUM('Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi') NOT NULL,
  FOREIGN KEY (schedule_id) REFERENCES program_schedules(id) ON DELETE CASCADE
);

CREATE TABLE schedule_slots (
  id VARCHAR(36) PRIMARY KEY,
  day_id VARCHAR(36) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject_id VARCHAR(36) NOT NULL,
  teacher_id VARCHAR(36) NOT NULL,
  room VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'Cours',
  max_students INT NOT NULL DEFAULT 30,
  FOREIGN KEY (day_id) REFERENCES schedule_days(id) ON DELETE CASCADE
);

CREATE TABLE program_teachers (
  id VARCHAR(36) PRIMARY KEY,
  program_id VARCHAR(36) NOT NULL,
  item_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

CREATE TABLE program_students (
  id VARCHAR(36) PRIMARY KEY,
  program_id VARCHAR(36) NOT NULL,
  item_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

CREATE TABLE program_subjects (
  id VARCHAR(36) PRIMARY KEY,
  program_id VARCHAR(36) NOT NULL,
  item_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

CREATE TABLE program_courses (
  id VARCHAR(36) PRIMARY KEY,
  program_id VARCHAR(36) NOT NULL,
  item_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

CREATE TABLE questions (
  id VARCHAR(36) PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT 0,
  created_by VARCHAR(36) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE schedules (
  id VARCHAR(36) PRIMARY KEY,
  program VARCHAR(36) NOT NULL,
  weekNumber INT NOT NULL,
  year INT NOT NULL,
  slots JSON NOT NULL,
  classLevel VARCHAR(36) NOT NULL,
  academicYear VARCHAR(36) NOT NULL,
  createdBy VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  UNIQUE KEY (program, weekNumber, year)
);

CREATE TABLE students (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  student_id VARCHAR(50) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'student',
  current_class_level VARCHAR(36),
  academic_year_id VARCHAR(36),
  date_admitted DATETIME NOT NULL,
  program_id VARCHAR(36),
  is_promoted_to_level200 BOOLEAN NOT NULL DEFAULT 0,
  is_promoted_to_level300 BOOLEAN NOT NULL DEFAULT 0,
  is_promoted_to_level400 BOOLEAN NOT NULL DEFAULT 0,
  is_graduated BOOLEAN NOT NULL DEFAULT 0,
  is_withdrawn BOOLEAN NOT NULL DEFAULT 0,
  is_suspended BOOLEAN NOT NULL DEFAULT 0,
  prefect_name VARCHAR(100),
  year_graduated DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE student_class_levels (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  class_level VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE student_exam_results (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  exam_result_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_result_id) REFERENCES exam_results(id) ON DELETE CASCADE
);

CREATE TABLE subjects (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  teacher_id VARCHAR(36),
  academic_term_id VARCHAR(36) NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  duration VARCHAR(50) NOT NULL DEFAULT '3 months',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (academic_term_id) REFERENCES academic_terms(id)
);

CREATE TABLE year_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  academic_year VARCHAR(36) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE year_group_students (
  year_group_id INT NOT NULL,
  student_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (year_group_id, student_id),
  FOREIGN KEY (year_group_id) REFERENCES year_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- PUBLIC INFORMATION TABLES

CREATE TABLE faqs (
  id VARCHAR(36) PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category ENUM('Admission', 'Formation', 'Financement', 'Technique', 'Général') NOT NULL,
  ordre INT NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT 1,
  createdBy VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE news (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  image VARCHAR(255) DEFAULT '📰',
  category ENUM('Formation', 'Événement', 'Annonce', 'Actualité') NOT NULL,
  createdBy VARCHAR(36) NOT NULL,
  isPublished BOOLEAN NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

-- STAFF TABLES

CREATE TABLE admins (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'superadmin') NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE teachers (
  id VARCHAR(36) PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  dateEmployed DATETIME NOT NULL,
  teacherId VARCHAR(50) NOT NULL UNIQUE,
  program VARCHAR(36),
  classLevel VARCHAR(36),
  academicYear VARCHAR(36),
  academicTerm VARCHAR(36),
  role VARCHAR(20) NOT NULL DEFAULT 'teacher',
  isWitdrawn BOOLEAN NOT NULL DEFAULT 0,
  isSuspended BOOLEAN NOT NULL DEFAULT 0,
  applicationStatus ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'
);

-- Add foreign key constraints
ALTER TABLE academic_year_students ADD CONSTRAINT fk_academic_year_student 
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id);

ALTER TABLE academic_year_teachers ADD CONSTRAINT fk_academic_year_teacher 
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id);

ALTER TABLE courses ADD CONSTRAINT fk_course_program 
  FOREIGN KEY (program) REFERENCES programs(id);

ALTER TABLE subjects ADD CONSTRAINT fk_subject_academic_term 
  FOREIGN KEY (academic_term_id) REFERENCES academic_terms(id);

ALTER TABLE students ADD CONSTRAINT fk_student_program 
  FOREIGN KEY (program_id) REFERENCES programs(id);
