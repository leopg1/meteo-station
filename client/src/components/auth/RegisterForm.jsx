import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  Link,
  useColorModeValue,
  FormErrorMessage,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
  const { register, error, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!username.trim()) errors.username = 'Numele de utilizator este obligatoriu';
    if (!email.trim()) errors.email = 'Adresa de email este obligatorie';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Adresa de email este invalidă';
    
    if (!password) errors.password = 'Parola este obligatorie';
    else if (password.length < 6) errors.password = 'Parola trebuie să aibă cel puțin 6 caractere';
    
    if (password !== confirmPassword) errors.confirmPassword = 'Parolele nu coincid';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    await register(username, email, password);
  };

  return (
    <Box
      rounded={'lg'}
      bg={useColorModeValue('white', 'gray.700')}
      boxShadow={'lg'}
      p={8}
      width={{ base: '90%', md: '400px' }}
    >
      <Stack spacing={4}>
        <Heading fontSize={'2xl'} textAlign="center">
          Înregistrare cont nou
        </Heading>
        
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id="username" isInvalid={formErrors.username}>
              <FormLabel>Nume de utilizator</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <FormErrorMessage>{formErrors.username}</FormErrorMessage>
            </FormControl>
            
            <FormControl id="email" isInvalid={formErrors.email}>
              <FormLabel>Adresă de email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FormErrorMessage>{formErrors.email}</FormErrorMessage>
            </FormControl>
            
            <FormControl id="password" isInvalid={formErrors.password}>
              <FormLabel>Parolă</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormErrorMessage>{formErrors.password}</FormErrorMessage>
            </FormControl>
            
            <FormControl id="confirmPassword" isInvalid={formErrors.confirmPassword}>
              <FormLabel>Confirmă parola</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <FormErrorMessage>{formErrors.confirmPassword}</FormErrorMessage>
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              fontSize="md"
              isLoading={loading}
              loadingText="Se înregistrează..."
            >
              Înregistrare
            </Button>
          </Stack>
        </form>
        
        <Text align="center">
          Ai deja un cont?{' '}
          <Link as={RouterLink} to="/login" color="blue.500">
            Autentifică-te
          </Link>
        </Text>
      </Stack>
    </Box>
  );
};

export default RegisterForm;
