import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/apiConfig';

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/validate');
        setIsAuthenticated(true);
      } catch (error) {
        console.log('Authentication failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // 또는 로딩 스피너 컴포넌트
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute; 