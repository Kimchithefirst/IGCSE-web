import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import theme from './theme'; // Import the custom theme
import './App.css';
import Login from './pages/Login-supabase';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Home from './pages/Home';
import Courses from './pages/Courses-supabase';
import ExamSimulation from './pages/ExamSimulation';
import ExamResults from './pages/ExamResults';
import SubjectSelection from './pages/SubjectSelection';
import Navbar from './components/Navbar';
import IgcseList from './components/IgcseList'; // Import the new component
import RoleSwitcher from './components/RoleSwitcher';
import { SupabaseAuthProvider, useSupabaseAuth } from './context/SupabaseAuthContext';

// Auto-deployment test - updated at 2025-01-31

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useSupabaseAuth();
  
  console.log('ProtectedRoute - user:', user, 'loading:', loading);
  
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
      return <Navigate to="/pdashboard" replace />;
    case 'teacher':
      return <Navigate to="/tdashboard" replace />;
    case 'admin':
      return <Navigate to="/tdashboard" replace />; // Admin uses teacher dashboard
    case 'student':
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

function AppContent() {
  // Temporary debug logging
  console.log('AppContent rendered');
  
  return (
    <Box minH="100vh">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Role-specific dashboards */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tdashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pdashboard"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Legacy dashboard route - redirects based on role */}
        <Route 
          path="/legacy-dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRouter />
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
          path="/subject-selection"
          element={
            <ProtectedRoute>
              <SubjectSelection />
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
        <Route
          path="/igcse-list"
          element={
            <ProtectedRoute>
              <IgcseList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/role-switcher"
          element={
            <ProtectedRoute>
              <RoleSwitcher />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Box>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}> {/* Apply the theme */}
      <SupabaseAuthProvider>
        <Router>
          <AppContent />
        </Router>
      </SupabaseAuthProvider>
    </ChakraProvider>
  );
}

export default App;
