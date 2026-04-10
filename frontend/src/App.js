import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ✅ IMPORTS DES PAGES (export default)
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import SignupCandidat from './pages/Auth/SignupCandidat';
import SignupRecruteur from './pages/Auth/SignupRecruteur';
import VerifyCode from './pages/Auth/VerifyCode';
import Dashboard from './pages/Dashboard/Dashboard';
import CompleteProfile from './pages/Auth/CompleteProfile';

// ✅ CSS global
import './assets/auth.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🏠 Page d'accueil */}
        <Route path="/" element={<Home />} />
        
        {/* 🔐 Authentification */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* 👤 Inscription Candidat */}
        <Route path="/signup/candidat" element={<SignupCandidat />} />
        
        {/* 🏢 Inscription Recruteur */}
        <Route path="/signup/recruteur" element={<SignupRecruteur />} />
        
        {/* 🔐 Vérification code email */}
        <Route path="/verify/:userId" element={<VerifyCode />} />
        
        {/* 📝 Complétion profil social */}
        <Route path="/complete-profile" element={<CompleteProfile />} />
        
        {/* 🎯 Dashboard (UNE SEULE FOIS) */}
        <Route path="/dashboard" element={<Dashboard />} />
        
      </Routes>
    </BrowserRouter>
  );
}