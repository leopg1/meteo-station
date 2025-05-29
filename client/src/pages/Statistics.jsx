import React, { useState } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  SimpleGrid, 
  FormControl,
  FormLabel,
  Input,
  Button,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { FaCalculator, FaChartColumn } from 'react-icons/fa6';
import { useStatistics } from '../hooks/useWeatherData';
import { getParameterInfo, formatNumber } from '../utils/sensorUtils';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Înregistrăm componentele Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Definim parametrii pentru care afișăm statistici
const PARAMETERS = [
  'temperature',
  'humidity',
  'pressure',
  'light',
  'radiation',
  'wind_speed'
];

function StatCard({ title, param, stats }) {
  const paramInfo = getParameterInfo(param);
  
  return (
    <Box 
      bg="gray.800" 
      borderRadius="lg" 
      boxShadow="md" 
      overflow="hidden" 
      transition="all 0.3s" 
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
      borderWidth="1px"
      borderColor="gray.700"
    >
      <Flex 
        px="6" 
        py="3" 
        bgGradient="linear(to-r, gray.700, gray.900)"
        color="white" 
        alignItems="center"
      >
        <Box as="i" className={`fas fa-${paramInfo.icon}`} mr="2"></Box>
        <Text fontWeight="medium" fontSize="md">{paramInfo.label}</Text>
      </Flex>
      
      <Box p="5" position="relative">
        <Box 
          position="absolute" 
          top="0" 
          right="0" 
          mt="-7" 
          mr="4" 
          bg="gray.700" 
          rounded="full" 
          p="3" 
          shadow="md" 
          borderWidth="1px"
          borderColor="gray.600"
        >
          <Box as="i" className={`fas fa-${paramInfo.icon}`} fontSize="2xl" color={paramInfo.color}></Box>
        </Box>
        
        <Box mt="3">
          <SimpleGrid columns={2} spacing="4">
            <Flex 
              direction="column" 
              alignItems="center" 
              p="3" 
              bg="gray.700" 
              rounded="lg"
            >
              <Text fontSize="sm" color="gray.300">Minim</Text>
              <Text fontSize="xl" fontWeight="bold" color="gray.100" mt="1">
                {formatNumber(stats.min, param === 'radiation' ? 2 : 1)}
              </Text>
              <Text fontSize="xs" color="gray.500">{paramInfo.unit}</Text>
            </Flex>
            
            <Flex 
              direction="column" 
              alignItems="center" 
              p="3" 
              bg="gray.700" 
              rounded="lg"
            >
              <Text fontSize="sm" color="gray.300">Maxim</Text>
              <Text fontSize="xl" fontWeight="bold" color="gray.100" mt="1">
                {formatNumber(stats.max, param === 'radiation' ? 2 : 1)}
              </Text>
              <Text fontSize="xs" color="gray.500">{paramInfo.unit}</Text>
            </Flex>
          </SimpleGrid>
          
          <Flex 
            direction="column" 
            alignItems="center" 
            p="3" 
            bg="gray.700" 
            rounded="lg"
            mt="4"
          >
            <Text fontSize="sm" color="gray.300">Medie</Text>
            <Text 
              fontSize="2xl" 
              fontWeight="bold" 
              color={paramInfo.color} 
              mt="1"
            >
              {formatNumber(stats.avg, param === 'radiation' ? 2 : 1)}
            </Text>
            <Text fontSize="xs" color="gray.500">{paramInfo.unit}</Text>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

function Statistics() {
  // State pentru filtre
  const [filters, setFilters] = useState({});
  
  // State pentru formularul de filtrare
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: ''
  });
  
  // Obținere statistici cu React Query
  const { 
    data: statsData, 
    isLoading, 
    isError 
  } = useStatistics(filters);
  
  // Toast pentru notificări
  const toast = useToast();
  
  // Handler pentru modificări în formularul de filtrare
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  // Handler pentru trimiterea formularului de filtrare
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Verificăm dacă ambele date sunt completate
    if (!formData.start_date || !formData.end_date) {
      toast({
        title: 'Date incomplete',
        description: 'Te rugăm să completezi ambele date pentru a calcula statisticile.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setFilters(formData);
  };
  
  // Pregătire date pentru graficul comparativ
  const chartData = statsData ? {
    labels: PARAMETERS.map(param => getParameterInfo(param).label),
    datasets: [
      {
        label: 'Valori minime',
        data: PARAMETERS.map(param => {
          // Normalizăm valorile pentru comparație (0-100%)
          const { min, max } = getParameterInfo(param);
          const value = statsData[param].min;
          const range = max - min;
          return ((value - min) / range) * 100;
        }),
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
        borderWidth: 1
      },
      {
        label: 'Valori medii',
        data: PARAMETERS.map(param => {
          const { min, max } = getParameterInfo(param);
          const value = statsData[param].avg;
          const range = max - min;
          return ((value - min) / range) * 100;
        }),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderWidth: 1
      },
      {
        label: 'Valori maxime',
        data: PARAMETERS.map(param => {
          const { min, max } = getParameterInfo(param);
          const value = statsData[param].max;
          const range = max - min;
          return ((value - min) / range) * 100;
        }),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderWidth: 1
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
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const paramIndex = context.dataIndex;
            const datasetIndex = context.datasetIndex;
            const param = PARAMETERS[paramIndex];
            const paramInfo = getParameterInfo(param);
            
            let value;
            if (datasetIndex === 0) { // Minim
              value = statsData[param].min;
            } else if (datasetIndex === 1) { // Medie
              value = statsData[param].avg;
            } else { // Maxim
              value = statsData[param].max;
            }
            
            const formattedValue = formatNumber(value, param === 'radiation' ? 2 : 1);
            return `${context.dataset.label}: ${formattedValue} ${paramInfo.unit}`;
          }
        },
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
        min: 0,
        max: 100,
        ticks: {
          callback: function(value) {
            return `${value}%`;
          },
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          },
          color: '#D1D5DB'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        title: {
          display: true,
          text: 'Valori normalizate (%)',
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
          color: '#D1D5DB'
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
            Statistici
          </Text>
        </Flex>
      </Box>
      
      {/* Content */}
      <Box p={{ base: "4", md: "6", lg: "8" }} pb="24">
        {/* Date Range Card */}
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
            <Box as="i" className="fas fa-calendar-days" mr="2"></Box>
            <Text fontWeight="semibold" fontSize="lg">Perioada</Text>
          </Flex>
          
          <Box p="6">
            <form onSubmit={handleSubmit}>
              <Flex 
                direction={{ base: 'column', md: 'row' }} 
                gap="4"
              >
                <FormControl flex="1">
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
                
                <FormControl flex="1">
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
                
                <Box display="flex" alignItems="flex-end">
                  <Button
                    type="submit"
                    leftIcon={<FaCalculator />}
                    colorScheme="blue"
                    px="6"
                    isLoading={isLoading}
                  >
                    Calculează
                  </Button>
                </Box>
              </Flex>
            </form>
          </Box>
        </Box>
        
        {/* Comparative Chart */}
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
          >
            <FaChartColumn style={{ marginRight: '0.5rem' }} />
            <Text fontWeight="semibold" fontSize="lg">Comparație valori</Text>
          </Flex>
          
          <Box p="6">
            {isLoading ? (
              <Flex justify="center" align="center" h="80">
                <Spinner size="xl" color="blue.400" />
              </Flex>
            ) : isError ? (
              <Flex justify="center" align="center" h="80" color="red.300">
                <Text>Eroare la calcularea statisticilor. Încercați din nou.</Text>
              </Flex>
            ) : !statsData ? (
              <Flex justify="center" align="center" h="80" color="gray.400">
                <Text>Selectați o perioadă și apăsați "Calculează" pentru a vizualiza statisticile</Text>
              </Flex>
            ) : (
              <Box h="80">
                <Bar data={chartData} options={chartOptions} />
              </Box>
            )}
            
            <Text fontSize="xs" color="gray.500" textAlign="center" mt="3">
              Notă: Valorile sunt normalizate pentru a permite comparația între diferite unități de măsură
            </Text>
          </Box>
        </Box>
        
        {/* Statistics Cards */}
        <SimpleGrid 
          columns={{ base: 1, md: 2, lg: 3 }} 
          spacing="6" 
          mt="8"
          id="stats-cards"
        >
          {isLoading ? (
            <Box colSpan={{ md: 2, lg: 3 }} display="flex" justifyContent="center" py="10">
              <Flex direction="column" alignItems="center">
                <Spinner 
                  size="xl" 
                  thickness="4px" 
                  speed="0.65s" 
                  color="blue.500" 
                  mb="4"
                />
                <Text color="gray.300">Se calculează statisticile...</Text>
              </Flex>
            </Box>
          ) : isError ? (
            <Box colSpan={{ md: 2, lg: 3 }} display="flex" justifyContent="center" py="10">
              <Text color="red.300">Eroare la calcularea statisticilor. Încercați din nou.</Text>
            </Box>
          ) : !statsData ? (
            <Box colSpan={{ md: 2, lg: 3 }} display="flex" justifyContent="center" py="10">
              <Text color="gray.400">Selectați o perioadă pentru a vizualiza statisticile</Text>
            </Box>
          ) : (
            <>
              {PARAMETERS.map(param => (
                <StatCard 
                  key={param}
                  param={param}
                  stats={statsData[param]}
                />
              ))}
            </>
          )}
        </SimpleGrid>
      </Box>
    </Box>
  );
}

export default Statistics;
