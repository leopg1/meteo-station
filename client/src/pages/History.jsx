import React, { useState } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  SimpleGrid, 
  FormControl,
  FormLabel,
  Input,
  Select,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { FaSearch, FaDownload, FaChartLine } from 'react-icons/fa';
import { useHistoryData } from '../hooks/useWeatherData';
import { formatDateTime, getParameterInfo } from '../utils/sensorUtils';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Înregistrăm componentele Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function History() {
  // State pentru filtre
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    limit: 50
  });
  
  // State pentru formularul de filtrare
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    limit: 50
  });
  
  // State pentru parametrul selectat pentru grafic
  const [selectedParam, setSelectedParam] = useState('temperature');
  
  // Obținere date istorice cu React Query
  const { 
    data: historyData, 
    isLoading, 
    isError 
  } = useHistoryData(Object.keys(filters).length > 0 ? filters : null);
  
  // Toast pentru notificări
  const toast = useToast();
  
  // Handler pentru modificări în formularul de filtrare
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  // Handler pentru selectarea parametrului pentru grafic
  const handleParamChange = (e) => {
    setSelectedParam(e.target.value);
  };
  
  // Handler pentru trimiterea formularului de filtrare
  const handleSubmit = (e) => {
    e.preventDefault();
    setFilters(formData);
  };
  
  // Handler pentru exportul datelor ca CSV
  const handleExportCSV = () => {
    if (!historyData || historyData.length === 0) {
      toast({
        title: 'Nicio înregistrare',
        description: 'Nu există date pentru export.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Pregătire headere pentru CSV
    const headers = [
      'ID', 
      'Timestamp', 
      'Temperatură (°C)', 
      'Umiditate (%)', 
      'Presiune (hPa)', 
      'Lumină (lux)', 
      'Radiație (µSv/h)', 
      'Viteză vânt (km/h)', 
      'Direcție vânt (°)'
    ];
    
    // Pregătire rânduri pentru CSV
    const rows = historyData.map(record => [
      record.id,
      formatDateTime(record.timestamp),
      record.temperature,
      record.humidity,
      record.pressure,
      record.light,
      record.radiation,
      record.wind_speed,
      record.wind_direction
    ]);
    
    // Combinare headere și rânduri
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\\n');
    
    // Creare blob și descărcare
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `weather_data_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Export finalizat',
      description: 'Datele au fost exportate cu succes.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Pregătire date pentru grafic
  const chartData = historyData && historyData.length > 0 ? {
    labels: historyData.map(record => formatDateTime(record.timestamp)),
    datasets: [
      {
        label: getParameterInfo(selectedParam).label,
        data: historyData.map(record => record[selectedParam]),
        borderColor: getParameterInfo(selectedParam).color,
        backgroundColor: `${getParameterInfo(selectedParam).color}33`,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5
      }
    ]
  } : null;
  
  // Opțiuni pentru grafic
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12
          },
          color: '#E5E7EB',
          padding: 12
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1F2937',
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 14
        },
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 13
        },
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          },
          color: '#D1D5DB'
        },
        title: {
          display: true,
          text: `${getParameterInfo(selectedParam).label} (${getParameterInfo(selectedParam).unit})`,
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 13,
            weight: '500'
          },
          color: '#E5E7EB'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          },
          color: '#D1D5DB',
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };
  
  return (
    <Box>
      {/* Header */}
      <Box 
        position="sticky" 
        top="0" 
        zIndex="10" 
        bg="gray.800" 
        shadow="md" 
        borderBottom="1px" 
        borderColor="gray.700"
      >
        <Flex 
          justify="between" 
          align="center" 
          h="16" 
          px={{ base: "4", md: "6", lg: "8" }}
        >
          <Text fontSize="2xl" fontWeight="semibold" color="gray.100">
            Istoric Date
          </Text>
        </Flex>
      </Box>
      
      {/* Content */}
      <Box p={{ base: "4", md: "6", lg: "8" }} pb="24">
        {/* Filters Card */}
        <Box 
          bg="gray.800" 
          borderRadius="xl" 
          boxShadow="md" 
          overflow="hidden"
          borderWidth="1px"
          borderColor="gray.700"
        >
          <Flex 
            px="6" 
            py="4" 
            bgGradient="linear(to-r, gray.700, gray.900)"
            color="white" 
            alignItems="center"
          >
            <Box as="i" className="fas fa-filter" mr="2"></Box>
            <Text fontWeight="semibold" fontSize="lg">Filtrare date</Text>
          </Flex>
          
          <Box p="6">
            <form onSubmit={handleSubmit}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="4">
                <FormControl>
                  <FormLabel htmlFor="start_date" fontSize="sm" fontWeight="medium" color="gray.300">
                    Data început
                  </FormLabel>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="gray.200"
                    _hover={{ borderColor: 'gray.500' }}
                    _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="end_date" fontSize="sm" fontWeight="medium" color="gray.300">
                    Data sfârșit
                  </FormLabel>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="gray.200"
                    _hover={{ borderColor: 'gray.500' }}
                    _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="limit" fontSize="sm" fontWeight="medium" color="gray.300">
                    Număr înregistrări
                  </FormLabel>
                  <Select
                    id="limit"
                    value={formData.limit}
                    onChange={handleInputChange}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="gray.200"
                    _hover={{ borderColor: 'gray.500' }}
                    _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                  </Select>
                </FormControl>
                
                <Flex alignItems="flex-end" gap="2">
                  <Button
                    type="submit"
                    leftIcon={<FaSearch />}
                    colorScheme="blue"
                    flex="1"
                    isLoading={isLoading}
                  >
                    Caută
                  </Button>
                  
                  <Button
                    leftIcon={<FaDownload />}
                    colorScheme="green"
                    onClick={handleExportCSV}
                    isDisabled={!historyData || historyData.length === 0}
                  >
                    Export
                  </Button>
                </Flex>
              </SimpleGrid>
            </form>
          </Box>
        </Box>
        
        {/* Chart Card */}
        <Box 
          mt="8" 
          bg="gray.800" 
          borderRadius="xl" 
          boxShadow="md" 
          overflow="hidden"
          borderWidth="1px"
          borderColor="gray.700"
        >
          <Flex 
            px="6" 
            py="4" 
            bgGradient="linear(to-r, gray.700, gray.900)"
            color="white" 
            alignItems="center"
            justifyContent="space-between"
          >
            <Flex alignItems="center">
              <FaChartLine style={{ marginRight: '0.5rem' }} />
              <Text fontWeight="semibold" fontSize="lg">Grafic parametru</Text>
            </Flex>
            
            <Select
              maxW="xs"
              value={selectedParam}
              onChange={handleParamChange}
              bg="gray.700"
              borderColor="gray.600"
              color="gray.200"
              size="sm"
              _hover={{ borderColor: 'gray.500' }}
              _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
            >
              <option value="temperature">Temperatură</option>
              <option value="humidity">Umiditate</option>
              <option value="pressure">Presiune</option>
              <option value="light">Lumină</option>
              <option value="radiation">Radiație</option>
              <option value="wind_speed">Viteză vânt</option>
              <option value="wind_direction">Direcție vânt</option>
            </Select>
          </Flex>
          
          <Box p="6" bg="gray.800">
            {isLoading ? (
              <Flex justify="center" align="center" h="80">
                <Spinner size="xl" color="blue.400" />
              </Flex>
            ) : isError ? (
              <Flex justify="center" align="center" h="80" color="red.300">
                <Text>Eroare la încărcarea datelor. Încercați din nou.</Text>
              </Flex>
            ) : !historyData || historyData.length === 0 ? (
              <Flex justify="center" align="center" h="80" color="gray.400">
                <Text>Nu există date pentru perioada selectată</Text>
              </Flex>
            ) : (
              <Box h="80">
                <Line data={chartData} options={chartOptions} />
              </Box>
            )}
            
            <Text fontSize="xs" color="gray.500" textAlign="center" mt="3">
              Notă: Selectați parametrul dorit din dropdown pentru vizualizarea grafică
            </Text>
          </Box>
        </Box>
        
        {/* Data Table Card */}
        <Box 
          mt="8" 
          bg="gray.800" 
          borderRadius="xl" 
          boxShadow="md" 
          overflow="hidden"
          borderWidth="1px"
          borderColor="gray.700"
        >
          <Flex 
            px="6" 
            py="4" 
            bgGradient="linear(to-r, gray.700, gray.900)"
            color="white" 
            alignItems="center"
            justifyContent="space-between"
          >
            <Flex alignItems="center">
              <Box as="i" className="fas fa-table" mr="2"></Box>
              <Text fontWeight="semibold" fontSize="lg">Date istorice</Text>
            </Flex>
            
            <Text fontSize="sm" color="gray.100">
              <Text as="span" id="history-count">{historyData?.length || 0}</Text> înregistrări
            </Text>
          </Flex>
          
          <Box p={{ base: "2", md: "4" }} overflowX="auto">
            {isLoading ? (
              <Flex justify="center" align="center" py="10">
                <Spinner size="xl" color="blue.400" />
              </Flex>
            ) : isError ? (
              <Flex justify="center" align="center" py="10" color="red.300">
                <Text>Eroare la încărcarea datelor. Încercați din nou.</Text>
              </Flex>
            ) : !historyData || historyData.length === 0 ? (
              <Flex justify="center" align="center" py="10" color="gray.400">
                <Text>Nu există date pentru perioada selectată</Text>
              </Flex>
            ) : (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th color="gray.300" borderColor="gray.700">ID</Th>
                      <Th color="gray.300" borderColor="gray.700">Timestamp</Th>
                      <Th color="gray.300" borderColor="gray.700">Temp (°C)</Th>
                      <Th color="gray.300" borderColor="gray.700">Umid (%)</Th>
                      <Th color="gray.300" borderColor="gray.700">Pres (hPa)</Th>
                      <Th color="gray.300" borderColor="gray.700">Lum (lux)</Th>
                      <Th color="gray.300" borderColor="gray.700">Rad (µSv/h)</Th>
                      <Th color="gray.300" borderColor="gray.700">V.vânt (km/h)</Th>
                      <Th color="gray.300" borderColor="gray.700">D.vânt (°)</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {historyData.map(record => (
                      <Tr key={record.id} _hover={{ bg: 'gray.700' }}>
                        <Td borderColor="gray.700">{record.id}</Td>
                        <Td borderColor="gray.700">{formatDateTime(record.timestamp)}</Td>
                        <Td borderColor="gray.700" color="sensor.temperature">{record.temperature.toFixed(1)}</Td>
                        <Td borderColor="gray.700" color="sensor.humidity">{record.humidity.toFixed(1)}</Td>
                        <Td borderColor="gray.700" color="sensor.pressure">{record.pressure.toFixed(1)}</Td>
                        <Td borderColor="gray.700" color="sensor.light">{record.light.toFixed(1)}</Td>
                        <Td borderColor="gray.700" color="sensor.radiation">{record.radiation.toFixed(2)}</Td>
                        <Td borderColor="gray.700" color="sensor.wind_speed">{record.wind_speed.toFixed(1)}</Td>
                        <Td borderColor="gray.700" color="sensor.wind_direction">{record.wind_direction.toFixed(0)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default History;
