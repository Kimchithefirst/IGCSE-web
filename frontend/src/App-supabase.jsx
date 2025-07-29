import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import theme from './theme';
import './App.css';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Home from './pages/Home';
import Courses from './pages/Courses';
import ExamSimulation from './pages/ExamSimulation';
import ExamResults from './pages/ExamResults';
import SubjectSelection from './pages/SubjectSelection';

// Import components
import Navbar from './components/Navbar';
import IgcseList from './components/IgcseList';
import RoleSwitcher from './components/RoleSwitcher';

// Import new Supabase auth context
import { SupabaseAuthProvider, useSupabaseAuth } from './context/SupabaseAuthContext';

// Protected Route Component using Supabase auth
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useSupabaseAuth();
  
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minH="100vh"
        fontSize="lg"
      >
        Loading...
      </Box>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Dashboard router based on user role
const DashboardRouter = () => {
  const { user } = useSupabaseAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case 'parent':
      return <ParentDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'admin':
      return <TeacherDashboard />; // Admin uses teacher dashboard for now
    case 'student':
    default:
      return <StudentDashboard />;
  }
};

function AppContent() {
  return (
    <Box minH="100vh">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dynamic dashboard based on user role */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } 
        />
        
        {/* Specific role-based dashboards */}
        <Route
          path="/parent-dashboard"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Course routes */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />
        
        {/* Exam routes */}
        <Route
          path="/exam-simulation"
          element={
            <ProtectedRoute>
              <Navigate to="/subject-selection" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-simulation/:quizId"
          element={
            <ProtectedRoute>
              <ExamSimulation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-results"
          element={
            <ProtectedRoute>
              <ExamResults />
            </ProtectedRoute>
          }
        />
        
        {/* Subject routes */}
        <Route
          path="/igcse-papers"
          element={
            <ProtectedRoute>
              <IgcseList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subject-selection"
          element={
            <ProtectedRoute>
              <SubjectSelection />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Role switcher for development */}
      {import.meta.env.DEV && <RoleSwitcher />}
    </Box>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <SupabaseAuthProvider>
        <Router>
          <AppContent />
        </Router>
      </SupabaseAuthProvider>
    </ChakraProvider>
  );
}

export default App;