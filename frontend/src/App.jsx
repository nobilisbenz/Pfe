// js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MainLayout from "./components/Layout/MainLayout";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./Pages/Dashboard";
import TeacherDashboard from "./Pages/Teacher/TeacherDashboard";
import StudentDashboard from "./Pages/Student/StudentDashboard";
import Home from "./Pages/Home";
import Login from "./components/Login";
import Courses from "./Pages/Public/Courses";
import About from "./Pages/Public/About";
import News from "./Pages/Public/News";
import FAQ from "./Pages/Public/FAQ";
import Contact from "./Pages/Public/Contact";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Routes protégées avec vérification du rôle */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/profile"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherDashboard activeTab="profile" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard activeTab="profile" />
                </ProtectedRoute>
              }
            />

            {/* Route Login */}
            <Route path="/login" element={<Login />} />

            {/* Routes publiques - Avec MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/news" element={<News />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
};

export default App;

