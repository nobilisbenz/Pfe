import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import StudentList from '../components/students/StudentList';
import TeacherList from '../components/teachers/TeacherList';
import NotificationsActivity from '../components/dashboard/NotificationsActivity';
import DashboardStats from '../components/dashboard/DashboardStats';
import TeacherStats from '../components/dashboard/TeacherStats';
import StudentStats from '../components/dashboard/StudentStats';
import Sidebar from '../components/dashboard/Sidebar';
import Navbar from '../components/Navbar';
import ProfilePage from '../components/profile/ProfilePage';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import CourseList from '../components/courses/CourseList';
import Messaging from '../components/messaging/Messaging';
import AcademicYearManagement from '../components/academics/AcademicYearManagement';
import AcademicTermManagement from '../components/academics/AcademicTermManagement';
import ProgramManagement from '../components/academics/ProgramManagement';
import SubjectManagement from '../components/academics/SubjectManagement';
import ClassLevelManagement from '../components/academics/ClassLevelManagement';
import ExamManagement from '../components/academics/ExamManagement';
import CourseManagement from '../components/academics/CourseManagement';
import NewsManagement from '../components/public/NewsManagement';
import FAQManagement from '../components/public/FAQManagement';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [activeAcademicTab, setActiveAcademicTab] = useState('years');

  // Initialiser l'onglet actif à partir des paramètres d'URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const renderAcademicContent = () => {
    switch (activeAcademicTab) {
      case 'years':
        return <AcademicYearManagement />;
      case 'terms':
        return <AcademicTermManagement />;
      case 'programs':
        return <ProgramManagement />;
      case 'subjects':
        return <SubjectManagement />;
      case 'levels':
        return <ClassLevelManagement />;
      default:
        return null;
    }
  };

  const renderDashboardContent = () => {
    // Afficher le profil quel que soit le rôle si l'onglet profile est actif
    if (activeTab === 'profile') {
      return <ProfilePage />;
    }

    switch (user?.role) {
      case 'admin':
        return (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <DashboardStats />
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Notifications & Activités
                  </h2>
                  <NotificationsActivity />
                </div>
              </div>
            )}
            {activeTab === 'students' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <StudentList />
              </div>
            )}
            {activeTab === 'teachers' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <TeacherList />
              </div>
            )}
            {activeTab === 'academic' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex flex-wrap gap-2 mb-6">
                    <button
                      onClick={() => setActiveAcademicTab('years')}
                      className={`px-4 py-2 rounded-lg ${
                        activeAcademicTab === 'years'
                          ? 'bg-mandarine-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Années Académiques
                    </button>
                    <button
                      onClick={() => setActiveAcademicTab('terms')}
                      className={`px-4 py-2 rounded-lg ${
                        activeAcademicTab === 'terms'
                          ? 'bg-mandarine-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Semestres
                    </button>
                    <button
                      onClick={() => setActiveAcademicTab('programs')}
                      className={`px-4 py-2 rounded-lg ${
                        activeAcademicTab === 'programs'
                          ? 'bg-mandarine-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Programmes
                    </button>
                    <button
                      onClick={() => setActiveAcademicTab('subjects')}
                      className={`px-4 py-2 rounded-lg ${
                        activeAcademicTab === 'subjects'
                          ? 'bg-mandarine-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Matières
                    </button>
                    <button
                      onClick={() => setActiveAcademicTab('levels')}
                      className={`px-4 py-2 rounded-lg ${
                        activeAcademicTab === 'levels'
                          ? 'bg-mandarine-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Niveaux
                    </button>
                  </div>
                  {renderAcademicContent()}
                </div>
              </div>
            )}
            {activeTab === 'courses' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <CourseManagement />
              </div>
            )}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-xl shadow-sm">
                <Messaging />
              </div>
            )}
            {activeTab === 'news' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <NewsManagement />
              </div>
            )}
            {activeTab === 'faq' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <FAQManagement />
              </div>
            )}
          </>
        );

      case 'teacher':
        return (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Tableau de bord Enseignant
                  </h2>
                  <TeacherStats />
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Dernières activités
                  </h2>
                  <NotificationsActivity />
                </div>
              </div>
            )}
            {activeTab === 'courses' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <CourseList />
              </div>
            )}
            {activeTab === 'exams' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <ExamManagement />
              </div>
            )}
          </>
        );

      case 'student':
        return (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Tableau de bord Étudiant
                  </h2>
                  <StudentStats />
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Dernières activités
                  </h2>
                  <NotificationsActivity />
                </div>
              </div>
            )}
            {activeTab === 'courses' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <CourseList />
              </div>
            )}
            {activeTab === 'exams' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <ExamManagement />
              </div>
            )}
          </>
        );

      default:
        return <div>Accès non autorisé</div>;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar 
            isOpen={sidebarOpen} 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userRole={user?.role}
          />
          
          <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300 ease-in-out overflow-hidden`}>
            <div className="h-full flex flex-col">
              <header className="bg-white shadow-sm py-4 px-8 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none transition-all duration-300 ease-in-out"
                      aria-label="Toggle sidebar"
                    >
                      <FiMenu className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {activeTab === 'overview' ? 'Tableau de bord' :
                       activeTab === 'students' ? 'Gestion des étudiants' :
                       activeTab === 'teachers' ? 'Gestion des enseignants' :
                       activeTab === 'academic' ? 'Gestion académique' :
                       activeTab === 'courses' ? 'Gestion des cours' :
                       activeTab === 'messages' ? 'Messagerie' :
                       activeTab === 'profile' ? 'Mon Profil' : 'Tableau de bord'}
                    </h1>
                  </div>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto px-8 py-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mandarine-500"></div>
                  </div>
                ) : (
                  renderDashboardContent()
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;