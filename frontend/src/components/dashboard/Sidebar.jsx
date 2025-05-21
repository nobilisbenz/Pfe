import {
  FiHome,
  FiUsers,
  FiBook,
  FiMail,
  FiBookOpen,
  FiEdit,
  FiHelpCircle,
  FiCalendar,
} from "react-icons/fi";
import PropTypes from "prop-types";
import { useLocation, Link } from "react-router-dom";

const Sidebar = ({ isOpen, activeTab, setActiveTab, userRole }) => {
  const location = useLocation();

  const getMenuItems = () => {
    switch (userRole) {
      case "admin":
        return [
          { id: "overview", icon: FiHome, label: "Vue d'ensemble" },
          { id: "students", icon: FiUsers, label: "Étudiants" },
          { id: "teachers", icon: FiUsers, label: "Enseignants" },
          { id: "schedule", icon: FiCalendar, label: "Emploi du temps" },
          { id: "academic", icon: FiBookOpen, label: "Académique" },
          { id: "courses", icon: FiBook, label: "Formations" },
          { id: "news", icon: FiBook, label: "Actualités" },
          { id: "faq", icon: FiHelpCircle, label: "FAQ" },
          { id: "messages", icon: FiMail, label: "Messages" },
        ];
      case "teacher":
        return [
          { id: "overview", icon: FiHome, label: "Vue d'ensemble" },
          { id: "schedule", icon: FiCalendar, label: "Emploi du temps" },
          { id: "exams", icon: FiEdit, label: "Exames" },
          { id: "questions", icon: FiEdit, label: "Mes Questions" },
          { id: "resultats", icon: FiEdit, label: "Resultats" },
        ];
      case "student":
        return [
          { id: "overview", icon: FiHome, label: "Vue d'ensemble" },
          { id: "schedule", icon: FiCalendar, label: "Emploi du temps" },
          { id: "exams", icon: FiEdit, label: "Mes Exames" },
          { id: "courses", icon: FiBook, label: "Mes Formations" },
          { id: "checkResult", icon: FiEdit, label: "Mes Resultats" },
        ];
      default:
        return [];
    }
  };

  return (
    <aside
      className={`fixed left-0 top-16 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out z-20 ${
        isOpen ? "w-64" : "w-0"
      }`}
    >
      <div className="h-full py-6 overflow-y-auto">
        <nav className="px-4 space-y-2">
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            return item.path ? (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 rounded-lg transition-colors
                  ${location.pathname === item.path ? "bg-mandarine-50 text-mandarine-600 dark:bg-gray-700 dark:text-white" : "hover:bg-gray-50 dark:hover:bg-gray-700"}
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 rounded-lg transition-colors
                  ${activeTab === item.id ? "bg-mandarine-50 text-mandarine-600 dark:bg-gray-700 dark:text-white" : "hover:bg-gray-50 dark:hover:bg-gray-700"}
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  userRole: PropTypes.string,
};

export default Sidebar;

