import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Flex, Spinner, Center, Alert, AlertIcon, AlertTitle } from '@chakra-ui/react';

// Componentă pentru rutele care necesită rol de administrator
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
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

  // Dacă utilizatorul nu are rol de administrator, afișăm un mesaj de acces interzis
  if (!isAdmin()) {
    return (
      <Center h="100vh">
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="md"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Acces interzis
          </AlertTitle>
          Trebuie să ai rol de administrator pentru a accesa această pagină.
        </Alert>
      </Center>
    );
  }

  // Dacă utilizatorul este admin, afișăm conținutul protejat
  return children;
};

export default AdminRoute;
