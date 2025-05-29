import React from 'react';
import { Flex, useColorModeValue } from '@chakra-ui/react';
import RegisterForm from '../../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <Flex
      minH={'calc(100vh - 60px)'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <RegisterForm />
    </Flex>
  );
};

export default RegisterPage;
