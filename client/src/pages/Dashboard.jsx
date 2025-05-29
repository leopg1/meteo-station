import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  IconButton, 
  SimpleGrid, 
  Spinner,
  useToast
} from '@chakra-ui/react';
import { FaPlus, FaRotate } from 'react-icons/fa6';
import { useCurrentWeather, useAddTestData } from '../hooks/useWeatherData';
import { getParameterInfo, formatDateTime } from '../utils/sensorUtils';
import SensorCard from '../components/SensorCard';
import TrendsChart from '../components/TrendsChart';

function Dashboard() {
  // State pentru istoricul datelor
  const [trendsData, setTrendsData] = useState({
    timeHistory: [],
    dataHistory: {
      temperature: [],
      humidity: [],
      pressure: []
    }
  });

  // Obținere date curente cu React Query
  const { 
    data: currentData, 
    isLoading, 
    isError,
    refetch
  } = useCurrentWeather();
  
  // Mutație pentru adăugare date test
  const { mutate: addTestData, isLoading: isAddingTest } = useAddTestData();

  // Toast pentru notificări
  const toast = useToast();
  
  // Actualizare istoric date pentru graficul de tendințe cu identificare mai bună a schimbărilor
  useEffect(() => {
    if (currentData) {
      // Folosim timestamp-ul ca identificator unic pentru a detecta schimbările
      const timestamp = currentData.timestamp;
      
      setTrendsData(prevData => {
        // Verificăm dacă ultimul timestamp este deja în istoric
        if (prevData.timeHistory.includes(timestamp)) {
          return prevData; // Dacă deja există, nu facem actualizare
        }
        
        // Limităm istoricul la 12 puncte
        const newTimeHistory = [...prevData.timeHistory, timestamp].slice(-12);
        
        // Actualizăm valorile pentru fiecare parametru
        const newTempHistory = [...prevData.dataHistory.temperature, currentData.temperature].slice(-12);
        const newHumidityHistory = [...prevData.dataHistory.humidity, currentData.humidity].slice(-12);
        const newPressureHistory = [...prevData.dataHistory.pressure, currentData.pressure].slice(-12);
        
        // Log pentru debugging în consolă (opțional)
        console.log("Actualizare grafic de tendințe", { timestamp });
        
        return {
          timeHistory: newTimeHistory,
          dataHistory: {
            temperature: newTempHistory,
            humidity: newHumidityHistory,
            pressure: newPressureHistory
          }
        };
      });
    }
  }, [currentData]);
  
  // Handler pentru butonul de adăugare date test
  const handleAddTestData = () => {
    addTestData(undefined, {
      onSuccess: () => {
        toast({
          title: 'Date adăugate',
          description: 'Datele de test au fost adăugate cu succes.',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
      },
      onError: (error) => {
        toast({
          title: 'Eroare',
          description: `Nu s-au putut adăuga datele de test: ${error.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      }
    });
  };
  
  // Conținut pentru starea de loading
  if (isLoading) {
    return (
      <Flex direction="column" align="center" justify="center" h="100%" py="10">
        <Spinner 
          size="xl" 
          thickness="4px" 
          speed="0.65s" 
          color="primary.500" 
          mb="4"
        />
        <Text color="gray.300">Se încarcă datele...</Text>
      </Flex>
    );
  }
  
  // Conținut pentru starea de eroare
  if (isError) {
    return (
      <Flex direction="column" align="center" justify="center" h="100%" py="10">
        <Box 
          mb="4" 
          p="4" 
          borderRadius="md" 
          bg="red.900" 
          color="red.100"
          textAlign="center"
        >
          <Text fontSize="lg" fontWeight="bold" mb="2">
            Eroare la obținerea datelor!
          </Text>
          <Text>Verificați conexiunea la server sau reîncercați mai târziu.</Text>
        </Box>
        <Button 
          leftIcon={<FaRotate />} 
          colorScheme="blue" 
          onClick={() => refetch()}
        >
          Reîncercați
        </Button>
      </Flex>
    );
  }
  
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
          justifyContent="space-between" 
          alignItems="center" 
          h="16" 
          px={{ base: "4", md: "6", lg: "8" }}
        >
          <Text fontSize="2xl" fontWeight="semibold" color="gray.100">
            Dashboard
          </Text>
          <Flex alignItems="center" gap={3}>
            <Text 
              display={{ base: 'none', md: 'block' }}
              fontSize="sm" 
              color="gray.400" 
              mr="3"
            >
              Ultima actualizare: <Text as="span" fontWeight="medium" color="gray.300" ml={1}>
                {currentData ? formatDateTime(currentData.timestamp) : 'Necunoscut'}
              </Text>
            </Text>
            <Button
              leftIcon={<FaPlus />}
              size="sm"
              colorScheme="gray"
              mr="2"
              isLoading={isAddingTest}
              onClick={handleAddTestData}
            >
              Date test
            </Button>
            <IconButton
              aria-label="Reîmprospătare date"
              icon={<FaRotate />}
              variant="ghost"
              colorScheme="gray"
              onClick={() => refetch()}
              title="Reîmprospătare date"
            />
          </Flex>
        </Flex>
      </Box>
      
      {/* Dashboard Content */}
      <Box p={{ base: "4", md: "6", lg: "8" }} pb="24">
        {/* Sensor Cards Grid */}
        <SimpleGrid 
          columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} 
          spacing="6"
        >
          {/* Card Temperatură */}
          <SensorCard 
            paramInfo={getParameterInfo('temperature')} 
            value={currentData.temperature} 
          />
          
          {/* Card Umiditate */}
          <SensorCard 
            paramInfo={getParameterInfo('humidity')} 
            value={currentData.humidity} 
          />
          
          {/* Card Presiune */}
          <SensorCard 
            paramInfo={getParameterInfo('pressure')} 
            value={currentData.pressure} 
          />
          
          {/* Card Lumină */}
          <SensorCard 
            paramInfo={getParameterInfo('light')} 
            value={currentData.light}
          />
          
          {/* Card Radiație */}
          <SensorCard 
            paramInfo={getParameterInfo('radiation')} 
            value={currentData.radiation}
          />
          
          {/* Card Viteză vânt */}
          <SensorCard 
            paramInfo={getParameterInfo('wind_speed')} 
            value={currentData.wind_speed}
          />
          
          {/* Card Direcție vânt */}
          <SensorCard 
            paramInfo={getParameterInfo('wind_direction')} 
            value={currentData.wind_direction}
          />
        </SimpleGrid>
        
        {/* Trends Chart */}
        <Box mt="8">
          <TrendsChart data={trendsData} />
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
