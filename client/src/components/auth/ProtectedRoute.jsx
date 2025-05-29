import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Flex, Spinner, Center } from '@chakra-ui/react';

// Componentă pentru rutele care necesită autentificare
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Afișăm un spinner în timpul verificării autentificării
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Center>
    );
  }

  // Dacă utilizatorul nu este autentificat, redirecționăm către pagina de login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Dacă utilizatorul este autentificat, afișăm conținutul protejat
  return children;
};

export default ProtectedRoute;
