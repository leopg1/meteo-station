import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Icon,
  HStack,
  Button,
  Flex,
  Spinner,
  Center,
  useToast
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiCpu, FiHardDrive, FiDatabase, FiUsers, FiActivity } from 'react-icons/fi';

const AdminDashboard = () => {
  const { getAuthHeader } = useAuth();
  const [systemInfo, setSystemInfo] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Obținere informații sistem
  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const response = await axios.get('/api/admin/system-info', {
          headers: getAuthHeader()
        });
        setSystemInfo(response.data);
      } catch (error) {
        console.error('Eroare la obținerea informațiilor de sistem:', error);
        setError('Nu s-au putut încărca informațiile de sistem.');
        toast({
          title: 'Eroare',
          description: 'Nu s-au putut încărca informațiile de sistem.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/auth/admin/users', {
          headers: getAuthHeader()
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Eroare la obținerea utilizatorilor:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemInfo();
    fetchUsers();

    // Actualizare automată la fiecare 30 de secunde
    const interval = setInterval(fetchSystemInfo, 30000);
    return () => clearInterval(interval);
  }, [getAuthHeader, toast]);

  if (loading) {
    return (
      <Center h="calc(100vh - 60px)">
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

  if (error) {
    return (
      <Box p={5}>
        <Heading size="md" mb={4}>Eroare</Heading>
        <Text>{error}</Text>
      </Box>
    );
  }

  return (
    <Box p={5}>
      <Heading mb={6}>Panou de administrare</Heading>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Sistem</Tab>
          <Tab>Utilizatori</Tab>
          <Tab>Bază de date</Tab>
        </TabList>

        <TabPanels>
          {/* Panoul de sistem */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
              {/* Statistică CPU */}
              <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
                <CardHeader pb={0}>
                  <HStack>
                    <Icon as={FiCpu} boxSize={6} color="blue.500" />
                    <Heading size="md">Utilizare CPU</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Stat>
                    <StatNumber>{systemInfo?.cpu_percent}%</StatNumber>
                    <Progress 
                      value={systemInfo?.cpu_percent} 
                      colorScheme={systemInfo?.cpu_percent > 80 ? "red" : systemInfo?.cpu_percent > 60 ? "yellow" : "green"} 
                      size="sm" 
                      mt={2} 
                    />
                  </Stat>
                </CardBody>
              </Card>

              {/* Statistică Memorie */}
              <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
                <CardHeader pb={0}>
                  <HStack>
                    <Icon as={FiActivity} boxSize={6} color="purple.500" />
                    <Heading size="md">Memorie</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Stat>
                    <StatNumber>{systemInfo?.memory_percent}%</StatNumber>
                    <Progress 
                      value={systemInfo?.memory_percent} 
                      colorScheme={systemInfo?.memory_percent > 80 ? "red" : systemInfo?.memory_percent > 60 ? "yellow" : "green"} 
                      size="sm" 
                      mt={2} 
                    />
                  </Stat>
                </CardBody>
              </Card>

              {/* Statistică Spațiu Disc */}
              <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
                <CardHeader pb={0}>
                  <HStack>
                    <Icon as={FiHardDrive} boxSize={6} color="green.500" />
                    <Heading size="md">Spațiu disc</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Stat>
                    <StatNumber>{systemInfo?.disk_usage}%</StatNumber>
                    <Progress 
                      value={systemInfo?.disk_usage} 
                      colorScheme={systemInfo?.disk_usage > 80 ? "red" : systemInfo?.disk_usage > 60 ? "yellow" : "green"} 
                      size="sm" 
                      mt={2} 
                    />
                  </Stat>
                </CardBody>
              </Card>

              {/* Informații sistem */}
              <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
                <CardHeader pb={0}>
                  <HStack>
                    <Icon as={FiDatabase} boxSize={6} color="orange.500" />
                    <Heading size="md">Bază de date</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Stat>
                    <StatNumber>{systemInfo?.weather_records}</StatNumber>
                    <StatHelpText>Înregistrări</StatHelpText>
                    <Text fontSize="sm" mt={1}>
                      Dimensiune: {(systemInfo?.db_size / (1024 * 1024)).toFixed(2)} MB
                    </Text>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Card mt={6} bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
              <CardHeader>
                <Heading size="md">Informații sistem</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Sistem de operare:</Text>
                    <Text>{systemInfo?.system} {systemInfo?.release}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Versiune Python:</Text>
                    <Text>{systemInfo?.python_version}</Text>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Panoul de utilizatori */}
          <TabPanel>
            <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">Utilizatori înregistrați</Heading>
                  <Button colorScheme="blue" size="sm">
                    Adaugă utilizator
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Utilizator</Th>
                      <Th>Email</Th>
                      <Th>Rol</Th>
                      <Th>Status</Th>
                      <Th>Ultima autentificare</Th>
                      <Th>Acțiuni</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map(user => (
                      <Tr key={user.id}>
                        <Td>{user.id}</Td>
                        <Td>{user.username}</Td>
                        <Td>{user.email}</Td>
                        <Td>
                          <Badge colorScheme={user.role === 'admin' ? 'red' : 'blue'}>
                            {user.role}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={user.is_active ? 'green' : 'gray'}>
                            {user.is_active ? 'Activ' : 'Inactiv'}
                          </Badge>
                        </Td>
                        <Td>{user.last_login ? new Date(user.last_login).toLocaleString() : 'Niciodată'}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button size="xs" colorScheme="blue">Editare</Button>
                            <Button size="xs" colorScheme="red">
                              {user.is_active ? 'Dezactivare' : 'Activare'}
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Panoul de bază de date */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
                <CardHeader>
                  <Heading size="md">Operațiuni bază de date</Heading>
                </CardHeader>
                <CardBody>
                  <Button colorScheme="blue" mb={3} mr={3}>
                    Backup bază de date
                  </Button>
                  <Button colorScheme="green" mb={3} mr={3}>
                    Optimizare bază de date
                  </Button>
                  <Button colorScheme="orange" mb={3}>
                    Curățare date vechi
                  </Button>
                </CardBody>
              </Card>

              <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
                <CardHeader>
                  <Heading size="md">Import/Export</Heading>
                </CardHeader>
                <CardBody>
                  <Button colorScheme="purple" mb={3} mr={3}>
                    Export date CSV
                  </Button>
                  <Button colorScheme="teal" mb={3}>
                    Import date
                  </Button>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdminDashboard;
