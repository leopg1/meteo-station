import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

function Layout() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex h="100vh" overflow="hidden">
      {/* Sidebar - ascuns pe dispozitive mobile */}
      <Box 
        as="aside"
        display={{ base: 'none', md: 'flex' }}
        w="64"
        bg="gray.900"
        color="white"
        boxShadow="lg"
      >
        <Sidebar />
      </Box>

      {/* Meniu mobil - afișat doar pe dispozitive mobile */}
      <MobileNav isOpen={isOpen} onClose={onClose} onOpen={onOpen} />

      {/* Conținut principal */}
      <Box flex="1" overflow="auto" bg="gray.900">
        <Outlet />
      </Box>
    </Flex>
  );
}

export default Layout;
