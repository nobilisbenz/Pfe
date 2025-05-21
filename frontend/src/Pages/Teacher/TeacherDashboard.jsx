import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/Navbar";
import ProfilePage from "../../components/profile/ProfilePage";
import TeacherStats from "../../components/dashboard/TeacherStats";
import NotificationsActivity from "../../components/dashboard/NotificationsActivity";
import CourseList from "../../components/courses/CourseList";
import ExamManagement from "../../components/academics/ExamManagement";
import Schedule from "../../components/Schedule";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

const TeacherDashboard = ({ activeTabProp }) => {
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(activeTabProp || "overview");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const renderDashboardContent = () => {
    if (activeTab === "profile") {
      return <ProfilePage />;
    }

    return (
      <>
        {activeTab === "overview" && (
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
        {activeTab === "schedule" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* <Schedule /> */}
          </div>
        )}
        {activeTab === "courses" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <CourseList />
          </div>
        )}
        {activeTab === "exams" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <ExamManagement />
          </div>
        )}
      </>
    );
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
            userRole="teacher"
          />

          <div
            className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-0"} transition-all duration-300 ease-in-out overflow-hidden`}
          >
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
                      {activeTab === "overview"
                        ? "Tableau de bord"
                        : activeTab === "courses"
                          ? "Mes cours"
                          : activeTab === "exams"
                            ? "Gestion des exames"
                            : activeTab === "schedule"
                              ? "Emploi du temps"
                              : activeTab === "profile"
                                ? "Mon Profil"
                                : "Tableau de bord"}
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

export default TeacherDashboard;
