// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import SignupCandidat from './pages/Auth/SignupCandidat';
import SignupRecruteur from './pages/Auth/SignupRecruteur';
import VerifyCode from './pages/Auth/VerifyCode';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import PostJob from './pages/Recruiter/PostJob';
import ManageJobs from './pages/Recruiter/ManageJobs';
import QuizPage from './pages/Candidate/QuizPage';
import FindJobs from './pages/Candidate/FindJobs';
import ApplyJob from './pages/Candidate/ApplyJob';
import MyApplications from './pages/Candidate/MyApplications';
import CompleteProfile from './pages/Auth/CompleteProfile';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import RecommendationsPage from './pages/Candidate/Recommendations/RecommendationsPage';
// Contexts ✅ Order IMPORTANT
import { AuthProvider } from './context/AuthContext';
import { SocketContextProvider } from './context/SocketContext';

// Components
import CallNotification from './components/VideoCall/CallNotification';
import GlobalVideoCall from './components/VideoCall/GlobalVideoCall';
import TalentBot from './components/ChatBot/TalentBot';

// Styles
import './assets/auth.css';

export default function App() {
  return (
    <BrowserRouter>
      {/* ✅ Order CRITIQUE : AuthProvider → SocketContextProvider → Content */}
      <AuthProvider>
        <SocketContextProvider>
          
          {/* Routes */}
          <Routes>
            {/* 🏠 Pages publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup/candidat" element={<SignupCandidat />} />
            <Route path="/signup/recruteur" element={<SignupRecruteur />} />
            <Route path="/verify/:userId" element={<VerifyCode />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/candidate/recommendations" element={<RecommendationsPage />} />
            {/* 🎯 Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* 🔹 Recruteur */}
            <Route path="/recruiter/post" element={<PostJob />} />
            <Route path="/recruiter/manage" element={<ManageJobs />} />
            
            {/* 🔹 Candidat */}
            <Route path="/candidate/jobs" element={<FindJobs />} />
            <Route path="/candidate/jobs/:id" element={<ApplyJob />} />
            <Route path="/candidate/my-applications" element={<MyApplications />} />
            <Route path="/quiz/:jobId" element={<QuizPage />} />
            
            {/* 🔄 Redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          {/* ✅ Overlays globaux (DANS les providers) */}
          <CallNotification />
          <GlobalVideoCall />
          
        </SocketContextProvider>
      </AuthProvider>
      
      {/* 🤖 ChatBot toujours visible */}
      <TalentBot />
    </BrowserRouter>
  );
}