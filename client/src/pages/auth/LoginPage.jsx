import React from 'react';
import { Flex, useColorModeValue } from '@chakra-ui/react';
import LoginForm from '../../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <Flex
      minH={'calc(100vh - 60px)'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <LoginForm />
    </Flex>
  );
};

export default LoginPage;
