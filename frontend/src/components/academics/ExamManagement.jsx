import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { academicService } from "../../services/academic.service";
import { useAuth } from "../../hooks/useAuth";

const ExamManagement = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicTerms, setAcademicTerms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    program: "",
    passMark: 50,
    totalMark: 100,
    academicTerm: "",
    academicYear: "",
    classLevel: "",
    examType: "Quiz",
    duration: "30 minutes",
    examDate: "",
    examTime: "",
  });

  useEffect(() => {
    loadExams();
    loadFormData();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await academicService.getExams();

      if (response.status === "success") {
        setExams(response.data);
      } else {
        throw new Error(
          response.message || "Erreur lors du chargement des exames",
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement des exames:", error);
      setError(
        error.message ||
          "Une erreur est survenue lors du chargement des exames",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = async () => {
    try {
      setError("");
      const [subjectsRes, programsRes, termsRes, yearsRes, levelsRes] =
        await Promise.all([
          academicService.getSubjects(),
          academicService.getPrograms(),
          academicService.getAcademicTerms(),
          academicService.getAcademicYears(),
          academicService.getClassLevels(),
        ]);

      if (
        !subjectsRes.data ||
        !programsRes.data ||
        !termsRes.data ||
        !yearsRes.data ||
        !levelsRes.data
      ) {
        throw new Error("Certaines données n'ont pas pu être chargées");
      }

      setSubjects(subjectsRes.data);
      setPrograms(programsRes.data);
      setAcademicTerms(termsRes.data);
      setAcademicYears(yearsRes.data);
      setClassLevels(levelsRes.data);
    } catch (err) {
      console.error(
        "Erreur lors du chargement des données du formulaire:",
        err,
      );
      setError(
        err.message || "Erreur lors du chargement des données du formulaire",
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        createdBy: user?._id,
        subject: formData.subject || undefined,
        program: formData.program || undefined,
        academicTerm: formData.academicTerm || undefined,
        academicYear: formData.academicYear || undefined,
        classLevel: formData.classLevel || undefined,
      };

      if (selectedExam) {
        await academicService.updateExam(selectedExam._id, dataToSubmit);
      } else {
        await academicService.createExam(dataToSubmit);
      }
      loadExams();
      handleCloseModal();
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet examen ?")) {
      try {
        await academicService.deleteExam(id);
        loadExams();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExam(null);
    setFormData({
      name: "",
      description: "",
      subject: "",
      program: "",
      passMark: 50,
      totalMark: 100,
      academicTerm: "",
      academicYear: "",
      classLevel: "",
      examType: "Quiz",
      duration: "30 minutes",
      examDate: "",
      examTime: "",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mandarine-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Exames</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-mandarine-500 text-white rounded-md hover:bg-mandarine-600"
        >
          <FiPlus className="mr-2" />
          Nouvel Examen
        </button>
      </div>

      {/* {error && ( */}
      {/*   <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"> */}
      {/*     {error} */}
      {/*   </div> */}
      {/* )} */}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matière
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Programme
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {exams.map((exam) => (
              <tr key={exam._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {exam.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {exam.subject ? exam.subject.name : "Non assigné"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {exam.program ? exam.program.name : "Non défini"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(exam.examDate).toLocaleDateString("fr-FR")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedExam(exam);
                      setFormData({
                        name: exam.name,
                        description: exam.description,
                        subject: exam.subject?._id || "",
                        program: exam.program?._id || "",
                        passMark: exam.passMark,
                        totalMark: exam.totalMark,
                        academicTerm: exam.academicTerm?._id || "",
                        academicYear: exam.academicYear?._id || "",
                        classLevel: exam.classLevel?._id || "",
                        examType: exam.examType || "Quiz",
                        duration: exam.duration,
                        examDate: exam.examDate.split("T")[0],
                        examTime: exam.examTime,
                      });
                      setIsModalOpen(true);
                    }}
                    className="text-mandarine-600 hover:text-mandarine-900 mr-3"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(exam._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedExam ? "Modifier l'examen" : "Nouvel examen"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiPlus className="w-6 h-6 transform rotate-45" />
              </button>
            </div>

            <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
              <form
                id="exam-form"
                onSubmit={handleSubmit}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l&apos;examen
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                    rows="3"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Matière
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                      required
                    >
                      <option value="">Sélectionner une matière</option>
                      {subjects?.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Programme
                    </label>
                    <select
                      value={formData.program}
                      onChange={(e) =>
                        setFormData({ ...formData, program: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                      required
                    >
                      <option value="">Sélectionner un programme</option>
                      {programs?.map((program) => (
                        <option key={program._id} value={program._id}>
                          {program.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semestre
                    </label>
                    <select
                      value={formData.academicTerm}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academicTerm: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                      required
                    >
                      <option value="">Sélectionner un semestre</option>
                      {academicTerms?.map((term) => (
                        <option key={term._id} value={term._id}>
                          {term.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Année académique
                    </label>
                    <select
                      value={formData.academicYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academicYear: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                      required
                    >
                      <option value="">Sélectionner une année</option>
                      {academicYears?.map((year) => (
                        <option key={year._id} value={year._id}>
                          {year.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Niveau
                    </label>
                    <select
                      value={formData.classLevel}
                      onChange={(e) =>
                        setFormData({ ...formData, classLevel: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                      required
                    >
                      <option value="">Sélectionner un niveau</option>
                      {classLevels?.map((level) => (
                        <option key={level._id} value={level._id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type d&apos;examen
                    </label>
                    <select
                      value={formData.examType}
                      onChange={(e) =>
                        setFormData({ ...formData, examType: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                      required
                    >
                      <option value="Quiz">Quiz</option>
                      <option value="Midterm">Mi-parcours</option>
                      <option value="Final">Final</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                    placeholder="Ex: 30 minutes"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d&apos;examen
                    </label>
                    <input
                      type="date"
                      value={formData.examDate}
                      onChange={(e) =>
                        setFormData({ ...formData, examDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure d&apos;examen
                    </label>
                    <input
                      type="time"
                      value={formData.examTime}
                      onChange={(e) =>
                        setFormData({ ...formData, examTime: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note totale
                    </label>
                    <input
                      type="number"
                      value={formData.totalMark}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalMark: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note de passage
                    </label>
                    <input
                      type="number"
                      value={formData.passMark}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passMark: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mandarine-500"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  form="exam-form"
                  className="px-4 py-2 bg-mandarine-500 text-white rounded-md hover:bg-mandarine-600"
                >
                  {selectedExam ? "Modifier" : "Créer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;

