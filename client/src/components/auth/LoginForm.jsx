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

const LoginForm = () => {
  const { login, error, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!username.trim()) errors.username = 'Numele de utilizator este obligatoriu';
    if (!password) errors.password = 'Parola este obligatorie';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    await login(username, password);
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
          Autentificare
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
            
            <FormControl id="password" isInvalid={formErrors.password}>
              <FormLabel>Parolă</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormErrorMessage>{formErrors.password}</FormErrorMessage>
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              fontSize="md"
              isLoading={loading}
              loadingText="Se autentifică..."
            >
              Autentificare
            </Button>
          </Stack>
        </form>
        
        <Text align="center">
          Nu ai cont?{' '}
          <Link as={RouterLink} to="/register" color="blue.500">
            Înregistrează-te
          </Link>
        </Text>
      </Stack>
    </Box>
  );
};

export default LoginForm;
