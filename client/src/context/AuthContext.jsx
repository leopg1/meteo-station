import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Crearea contextului de autentificare
const AuthContext = createContext(null);

// Hook personalizat pentru utilizarea contextului de autentificare
export const useAuth = () => useContext(AuthContext);

// Provider pentru contextul de autentificare
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Funcție pentru verificarea dacă token-ul JWT a expirat
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  // Verificarea și reîmprospătarea token-ului la încărcarea aplicației
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Verificăm dacă token-ul de acces a expirat
        if (isTokenExpired(accessToken)) {
          // Încercăm să obținem un nou token cu refresh token-ul
          const response = await axios.post('/api/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });

          // Actualizăm token-ul de acces
          const { access_token } = response.data;
          localStorage.setItem('accessToken', access_token);

          // Obținem detaliile utilizatorului
          const userResponse = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${access_token}` }
          });

          setUser(userResponse.data);
        } else {
          // Folosim token-ul existent pentru a obține detaliile utilizatorului
          const userResponse = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          setUser(userResponse.data);
        }
      } catch (error) {
        console.error('Eroare la verificarea autentificării:', error);
        setUser(null);
        // Ștergem token-urile dacă nu mai sunt valide
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Funcție pentru autentificare
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { user, access_token, refresh_token } = response.data;

      // Salvăm token-urile în localStorage
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);

      // Actualizăm starea utilizatorului
      setUser(user);

      // Redirecționare către pagina principală
      navigate('/');
      return true;
    } catch (error) {
      setError(error.response?.data?.error || 'Eroare la autentificare');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru înregistrare
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/register', { username, email, password });
      const { user, access_token, refresh_token } = response.data;

      // Salvăm token-urile în localStorage
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);

      // Actualizăm starea utilizatorului
      setUser(user);

      // Redirecționare către pagina principală
      navigate('/');
      return true;
    } catch (error) {
      setError(error.response?.data?.error || 'Eroare la înregistrare');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru deconectare
  const logout = () => {
    // Ștergem token-urile din localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Resetăm starea utilizatorului
    setUser(null);

    // Redirecționare către pagina de autentificare
    navigate('/login');
  };

  // Verificare dacă utilizatorul este administrator
  const isAdmin = () => user?.role === 'admin';

  // Obținere token pentru cereri autorizate
  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Expunem starea și funcțiile de autentificare
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin,
    getAuthHeader
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
