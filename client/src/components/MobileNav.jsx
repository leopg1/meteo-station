import React from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  IconButton,
  VStack,
  Text,
  Link,
  Icon,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  Divider,
  Button,
  Avatar
} from '@chakra-ui/react';
import { FaSignOutAlt, FaUserShield, FaTools } from 'react-icons/fa';
import { FaGaugeHigh, FaClockRotateLeft, FaChartPie, FaBars, FaMap, FaRobot } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';

function MobileNav({ isOpen, onOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  
  // Verifică dacă o rută este activă
  const isActive = (path) => location.pathname === path;
  
  // Handler pentru deconectare
  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };
  
  return (
    <>
      {/* Butonul de meniu mobil */}
      <Box
        position="absolute"
        top="4"
        left="4"
        zIndex="50"
        display={{ base: 'block', md: 'none' }}
      >
        <IconButton
          aria-label="Deschide meniu"
          icon={<FaBars />}
          onClick={onOpen}
          variant="ghost"
          color="gray.300"
          _hover={{ bg: 'gray.700', color: 'white' }}
          size="lg"
        />
      </Box>
      
      {/* Drawer pentru meniul mobil */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="gray.900">
          <DrawerCloseButton color="gray.300" />
          <DrawerBody pt="16" pb="6" px="6">
            {/* Informații utilizator */}
            {user && (
              <Flex 
                direction="column"
                align="center"
                mb="4"
                pb="4"
                borderBottom="1px"
                borderColor="gray.700"
              >
                <Avatar 
                  size="md" 
                  name={user.username} 
                  bg="brand.500"
                  mb="2"
                />
                <Text fontWeight="medium">{user.username}</Text>
                <Text fontSize="xs" color="gray.400">{user.role === 'admin' ? 'Administrator' : 'Utilizator'}</Text>
              </Flex>
            )}
            <VStack spacing="4" align="stretch">
              <Link
                as={RouterLink}
                to="/"
                py="3"
                px="4"
                rounded="lg"
                bg={isActive('/') ? 'gray.700' : 'transparent'}
                color={isActive('/') ? 'white' : 'gray.200'}
                fontWeight="medium"
                display="flex"
                alignItems="center"
                onClick={onClose}
              >
                <Icon as={FaGaugeHigh} mr="3" /> Dashboard
              </Link>
              
              <Link
                as={RouterLink}
                to="/history"
                py="3"
                px="4"
                rounded="lg"
                bg={isActive('/history') ? 'gray.700' : 'transparent'}
                color={isActive('/history') ? 'white' : 'gray.200'}
                fontWeight="medium"
                display="flex"
                alignItems="center"
                onClick={onClose}
              >
                <Icon as={FaClockRotateLeft} mr="3" /> Istoric Date
              </Link>
              
              <Link
                as={RouterLink}
                to="/statistics"
                py="3"
                px="4"
                rounded="lg"
                bg={isActive('/statistics') ? 'gray.700' : 'transparent'}
                color={isActive('/statistics') ? 'white' : 'gray.200'}
                fontWeight="medium"
                display="flex"
                alignItems="center"
                onClick={onClose}
              >
                <Icon as={FaChartPie} boxSize="5" mr="3" />
                <Text>Statistici</Text>
              </Link>
              
              <Link
                as={RouterLink}
                to="/maps"
                display="flex"
                alignItems="center"
                p="3"
                rounded="md"
                w="full"
                mb="2"
                bg={isActive('/maps') ? 'gray.700' : 'transparent'}
                color={isActive('/maps') ? 'white' : 'gray.300'}
                _hover={{ bg: 'gray.700', color: 'white' }}
                onClick={onClose}
              >
                <Icon as={FaMap} boxSize="5" mr="3" />
                <Text>Hărți</Text>
              </Link>
              
              <Link
                as={RouterLink}
                to="/assistant"
                display="flex"
                alignItems="center"
                p="3"
                rounded="md"
                w="full"
                mb="2"
                bg={isActive('/assistant') ? 'gray.700' : 'transparent'}
                color={isActive('/assistant') ? 'white' : 'gray.300'}
                _hover={{ bg: 'gray.700', color: 'white' }}
                onClick={onClose}
              >
                <Icon as={FaRobot} boxSize="5" mr="3" />
                <Text>Asistent</Text>
              </Link>
              
              {/* Secțiune Administrator - vizibilă doar pentru admini */}
              {isAdmin() && (
                <>
                  <Divider my="3" borderColor="gray.700" />
                  <Text fontSize="xs" color="gray.500" mb="2">
                    ADMINISTRARE
                  </Text>
                  
                  <Link
                    as={RouterLink}
                    to="/admin"
                    display="flex"
                    alignItems="center"
                    p="3"
                    rounded="md"
                    w="full"
                    mb="2"
                    bg={isActive('/admin') ? 'gray.700' : 'transparent'}
                    color={isActive('/admin') ? 'white' : 'gray.300'}
                    _hover={{ bg: 'gray.700', color: 'white' }}
                    onClick={onClose}
                  >
                    <Icon as={FaUserShield} boxSize="5" mr="3" />
                    <Text>Panou admin</Text>
                  </Link>
                  
                  <Link
                    as={RouterLink}
                    to="/admin/sensors"
                    display="flex"
                    alignItems="center"
                    p="3"
                    rounded="md"
                    w="full"
                    mb="2"
                    bg={isActive('/admin/sensors') ? 'gray.700' : 'transparent'}
                    color={isActive('/admin/sensors') ? 'white' : 'gray.300'}
                    _hover={{ bg: 'gray.700', color: 'white' }}
                    onClick={onClose}
                  >
                    <Icon as={FaTools} boxSize="5" mr="3" />
                    <Text>Calibrare senzori</Text>
                  </Link>
                </>
              )}
            </VStack>
            
            {/* Buton deconectare */}
            <Box mt="5">
              <Button
                leftIcon={<FaSignOutAlt />}
                colorScheme="red"
                variant="outline"
                size="sm"
                w="full"
                onClick={handleLogout}
              >
                Deconectare
              </Button>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default MobileNav;
