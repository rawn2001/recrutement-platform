// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

// ✅ Créer le Context
const AuthContext = createContext(null);

// ✅ Provider qui enveloppe l'app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur au mount (depuis localStorage)
  useEffect(() => {
    const stored = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (stored && storedToken) {
      try {
        setUser(JSON.parse(stored));
        setToken(storedToken);
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  // Fonction login (mock pour dev)
  const login = async (email, password, role) => {
    const mockUser = {
      id: 'user_' + Date.now(),
      email,
      role: role || (email.includes('recruteur') ? 'recruteur' : 'candidat'),
      profile: { fullName: email.split('@')[0] }
    };
    setUser(mockUser);
    setToken('mock_token_xyz');
    localStorage.setItem('token', 'mock_token_xyz');
    localStorage.setItem('user', JSON.stringify(mockUser));
    return mockUser;
  };

  // Fonction logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook personnalisé pour utiliser le context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// ✅ Export par défaut du context (pour useContext direct si besoin)
export default AuthContext;