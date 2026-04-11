// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import SignupCandidat from './pages/Auth/SignupCandidat';
import SignupRecruteur from './pages/Auth/SignupRecruteur';
import VerifyCode from './pages/Auth/VerifyCode';
import Dashboard from './pages/Dashboard/Dashboard';

// 🔹 Pages Recruteur (séparées)
import PostJob from './pages/Recruiter/PostJob';
import ManageJobs from './pages/Recruiter/ManageJobs';

// 🔹 Pages Candidat (séparées)
import FindJobs from './pages/Candidate/FindJobs';
import ApplyJob from './pages/Candidate/ApplyJob';
import MyApplications from './pages/Candidate/MyApplications';

import './assets/auth.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🏠 Pages publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/candidat" element={<SignupCandidat />} />
        <Route path="/signup/recruteur" element={<SignupRecruteur />} />
        <Route path="/verify/:userId" element={<VerifyCode />} />
        
        {/* 🎯 Dashboard Hub */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* 🔹 Recruteur - Pages séparées */}
        <Route path="/recruiter/post" element={<PostJob />} />
        <Route path="/recruiter/manage" element={<ManageJobs />} />
        
        {/* 🔹 Candidat - Pages séparées */}
        <Route path="/candidate/jobs" element={<FindJobs />} />
        <Route path="/candidate/jobs/:id" element={<ApplyJob />} />
        <Route path="/candidate/my-applications" element={<MyApplications />} />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}