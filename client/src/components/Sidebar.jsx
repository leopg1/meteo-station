import React from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Box, Flex, VStack, Text, Icon, Link, Divider, Button, Avatar, HStack, Tooltip, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { FaUser, FaSignOutAlt, FaUserShield, FaTools } from 'react-icons/fa';
import { FaGaugeHigh, FaClockRotateLeft, FaChartPie, FaCloudBolt, FaMap, FaRobot } from 'react-icons/fa6';
import { FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const currentYear = new Date().getFullYear();
  
  // Verifică dacă o rută este activă
  const isActive = (path) => location.pathname === path;
  
  // Handler pentru deconectare
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <Flex flexDir="column" h="full" w="full">
      {/* Logo & Titlu */}
      <Flex 
        flexDir="column" 
        alignItems="center" 
        justifyContent="center" 
        h="20" 
        bg="gray.950" 
        boxShadow="md"
      >
        <Flex alignItems="center">
          <Icon as={FaCloudBolt} color="brand.500" boxSize="6" />
          <Text ml="2" fontWeight="bold" fontSize="xl">Stație Meteo</Text>
        </Flex>
        <Text fontSize="xs" color="gray.400" mt="1">Raspberry Pi 4</Text>
      </Flex>
      
      {/* Informații utilizator */}
      {user && (
        <Flex 
          direction="column"
          align="center"
          py="4"
          px="2"
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
      
      {/* Navigație */}
      <VStack spacing="1" px="2" py="5" flex="1">
        <Link
          as={RouterLink}
          to="/"
          w="full"
          px="4"
          py="3"
          rounded="lg"
          display="flex"
          alignItems="center"
          bg={isActive('/') ? 'gray.700' : 'transparent'}
          color={isActive('/') ? 'white' : 'gray.300'}
          _hover={{ bg: 'gray.800', color: 'white' }}
          transition="colors 0.2s"
        >
          <Icon as={FaGaugeHigh} mr="3" />
          <Text>Dashboard</Text>
        </Link>
        
        <Link
          as={RouterLink}
          to="/history"
          w="full"
          px="4"
          py="3"
          rounded="lg"
          display="flex"
          alignItems="center"
          bg={isActive('/history') ? 'gray.700' : 'transparent'}
          color={isActive('/history') ? 'white' : 'gray.300'}
          _hover={{ bg: 'gray.800', color: 'white' }}
          transition="colors 0.2s"
        >
          <Icon as={FaClockRotateLeft} mr="3" />
          <Text>Istoric Date</Text>
        </Link>
        
        <Link
          as={RouterLink}
          to="/statistics"
          w="full"
          px="4"
          py="3"
          rounded="lg"
          display="flex"
          alignItems="center"
          bg={isActive('/statistics') ? 'gray.700' : 'transparent'}
          color={isActive('/statistics') ? 'white' : 'gray.300'}
          _hover={{ bg: 'gray.800', color: 'white' }}
          transition="colors 0.2s"
        >
          <Icon as={FaChartPie} mr="3" />
          <Text>Statistici</Text>
        </Link>
        
        <Link
          as={RouterLink}
          to="/maps"
          w="full"
          px="4"
          py="3"
          rounded="lg"
          display="flex"
          alignItems="center"
          bg={isActive('/maps') ? 'gray.700' : 'transparent'}
          color={isActive('/maps') ? 'white' : 'gray.300'}
          _hover={{ bg: 'gray.800', color: 'white' }}
          transition="colors 0.2s"
        >
          <Icon as={FaMap} mr="3" />
          <Text>Hărți și Vizualizări</Text>
        </Link>
        
        <Link
          as={RouterLink}
          to="/assistant"
          w="full"
          px="4"
          py="3"
          rounded="lg"
          display="flex"
          alignItems="center"
          bg={isActive('/assistant') ? 'gray.700' : 'transparent'}
          color={isActive('/assistant') ? 'white' : 'gray.300'}
          _hover={{ bg: 'gray.800', color: 'white' }}
          transition="colors 0.2s"
        >
          <Icon as={FaRobot} mr="3" />
          <Text>Asistent</Text>
        </Link>
        
        {/* Secțiune Administrator - vizibilă doar pentru admini */}
        {isAdmin() && (
          <>
            <Divider my="3" borderColor="gray.700" />
            <Text px="4" fontSize="xs" color="gray.500" mb="2">
              ADMINISTRARE
            </Text>
            
            <Link
              as={RouterLink}
              to="/admin"
              w="full"
              px="4"
              py="3"
              rounded="lg"
              display="flex"
              alignItems="center"
              bg={isActive('/admin') ? 'gray.700' : 'transparent'}
              color={isActive('/admin') ? 'white' : 'gray.300'}
              _hover={{ bg: 'gray.800', color: 'white' }}
              transition="colors 0.2s"
            >
              <Icon as={FaUserShield} mr="3" />
              <Text>Panou admin</Text>
            </Link>
            
            <Link
              as={RouterLink}
              to="/admin/sensors"
              w="full"
              px="4"
              py="3"
              rounded="lg"
              display="flex"
              alignItems="center"
              bg={isActive('/admin/sensors') ? 'gray.700' : 'transparent'}
              color={isActive('/admin/sensors') ? 'white' : 'gray.300'}
              _hover={{ bg: 'gray.800', color: 'white' }}
              transition="colors 0.2s"
            >
              <Icon as={FaTools} mr="3" />
              <Text>Calibrare senzori</Text>
            </Link>
          </>
        )}
      </VStack>
      
      {/* Buton deconectare */}
      <Box p="4" w="full">
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
      
      {/* Footer */}
      <Box p="4" fontSize="xs" color="gray.500" textAlign="center">
        <Text>Copyright {currentYear} Weather Station</Text>
      </Box>
    </Flex>
  );
}

export default Sidebar;
