import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('queueless_token');
    if (token) {
      authService
        .getMe()
        .then((res) => {
          const fetchedUser = res?.data?.user || res?.user || res;
          setUser(fetchedUser);
        })
        .catch(() => {
          localStorage.removeItem('queueless_token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email, password) => {
      setError(null);
      try {
        const res = await authService.login({ email, password });
        const loggedUser = res?.data?.user || res?.user || res;
        setUser(loggedUser);
        return res;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  const register = useCallback(
    async (data) => {
      setError(null);
      try {
        const res = await authService.register(data);
        const registeredUser = res?.data?.user || res?.user || res;
        setUser(registeredUser);
        return res;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
    navigate('/');
  }, [navigate]);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
