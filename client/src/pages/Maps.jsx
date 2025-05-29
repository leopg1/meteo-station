import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  SimpleGrid, 
  Tab, 
  Tabs, 
  TabList, 
  TabPanel, 
  TabPanels,
  Button,
  Icon,
  Select,
  Spinner,
  Heading,
  useColorModeValue,
  Badge,
  Tooltip,
  HStack,
  VStack,
  Grid,
  GridItem,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useBreakpointValue
} from '@chakra-ui/react';
import { FaRegClock, FaCalendarAlt, FaSearch, FaChartLine, FaInfoCircle, FaCog, FaSyncAlt } from 'react-icons/fa';
import { FaMap, FaTemperatureHalf, FaDroplet, FaWind, FaSatellite } from 'react-icons/fa6';
import { useCurrentWeather, useHistoryData } from '../hooks/useWeatherData';
import { getParameterInfo, formatDateTime, formatNumber } from '../utils/sensorUtils';

// Hook pentru a urmări istoricul valorilor pentru parametrii selectați
function useParameterHistory(parameter, limit = 24) {
  const [history, setHistory] = useState([]);
  const { data: histData, isLoading, isError } = useHistoryData(
    { hours: limit },
    { enabled: !!parameter }
  );
  
  useEffect(() => {
    if (histData && histData.length > 0 && parameter) {
      // Filtrează și pregătește datele pentru vizualizare
      const processedData = histData.map(entry => ({
        timestamp: new Date(entry.timestamp),
        value: entry[parameter],
        raw: entry
      })).filter(item => item.value !== undefined);
      
      setHistory(processedData);
    }
  }, [histData, parameter]);
  
  return { history, isLoading, isError };
}

// Componentă pentru harta termică avansată
function HeatMap({ parameter }) {
  const paramInfo = getParameterInfo(parameter);
  const { data: currentData, isLoading: isLoadingCurrent } = useCurrentWeather();
  const { history, isLoading: isLoadingHistory } = useParameterHistory(parameter, 48);
  const [mapStyle, setMapStyle] = useState('default'); // default, satellite, dark
  const [timeSlider, setTimeSlider] = useState(100); // 0-100%, reprezintă momentul actual
  const [isLive, setIsLive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Referinte pentru elemente DOM
  const mapContainerRef = useRef(null);
  
  // Modificați starea harta (live/istoric)
  const toggleLiveMode = () => {
    setIsLive(!isLive);
    if (!isLive) setTimeSlider(100); // Resetăm la prezent când comutăm la live
  };
  
  // Calculare dată selectată din slider
  const getSelectedTimestamp = () => {
    if (isLive || !history.length) return new Date();
    
    const idx = Math.floor((history.length - 1) * (timeSlider / 100));
    return history[idx]?.timestamp || new Date();
  };
  
  // Calculare dată formatată pentru afișare
  const selectedDate = getSelectedTimestamp();
  const formattedDate = formatDateTime(selectedDate);
  
  // Valoare selectată (curentă sau istorică)
  const getValue = () => {
    if (isLive || !history.length) {
      return currentData ? currentData[parameter] : 0;
    }
    
    const idx = Math.floor((history.length - 1) * (timeSlider / 100));
    return history[idx]?.value || 0;
  };
  
  // Valoarea pentru parametrul selectat
  const currentValue = getValue();
  
  // Determina culoarea bazată pe valoarea parametrului
  const getParameterColor = (value) => {
    if (!value) return paramInfo.color;
    
    // Logică de culoare bazată pe tipul parametrului
    switch(parameter) {
      case 'temperature':
        if (value < 0) return 'blue.400';
        if (value < 10) return 'blue.300';
        if (value < 15) return 'green.300';
        if (value < 25) return 'yellow.300';
        if (value < 30) return 'orange.300';
        return 'red.500';
      
      case 'humidity':
        if (value < 30) return 'yellow.300';
        if (value < 60) return 'green.300';
        return 'blue.400';
      
      case 'pressure':
        if (value < 1000) return 'orange.300';
        if (value < 1013) return 'green.300';
        return 'blue.300';
      
      case 'wind_speed':
        if (value < 5) return 'green.200';
        if (value < 15) return 'green.400';
        if (value < 30) return 'yellow.400';
        return 'red.400';
        
      default:
        return paramInfo.color;
    }
  };
  
  // Culoarea actuală pentru valoarea parametrului
  const color = getParameterColor(currentValue);
  
  // Configurare overlay pentru hartă în funcție de parametrul selectat
  const getMapOverlay = () => {
    switch(parameter) {
      case 'temperature': return 'temp';
      case 'wind_speed': return 'wind';
      case 'humidity': return 'rh';
      case 'pressure': return 'pressure';
      default: return 'temp';
    }
  };
  
  // Configurație pentru stilul hărții
  const getMapStyle = () => {
    switch(mapStyle) {
      case 'satellite': return 'satellite';
      case 'dark': return 'dark';
      default: return 'map';
    }
  };
  
  // Construim URL-ul iframe-ului pentru hartă
  const mapUrl = `https://embed.windy.com/embed2.html?lat=45.75&lon=21.22&zoom=8&level=surface&overlay=${getMapOverlay()}&menu=&message=true&marker=&calendar=&pressure=&type=${getMapStyle()}&location=coordinates&detail=&detailLat=45.75&detailLon=21.22&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
  
  // Opțiuni pentru selectarea stilului hărții
  const mapStyles = [
    { value: 'default', label: 'Standard' },
    { value: 'satellite', label: 'Satelit' },
    { value: 'dark', label: 'Nocturn' }
  ];
  
  // Determinăm dimensiunea controalelor în funcție de viewportul utilizatorului
  const controlSize = useBreakpointValue({ base: 'sm', md: 'md' });
  
  // Loading state
  const isLoading = isLoadingCurrent || isLoadingHistory;
  
  if (isLoading) {
    return (
      <Flex direction="column" align="center" justify="center" h="500px">
        <Spinner size="xl" thickness="4px" color="blue.400" mb="4" />
        <Text>Se încarcă harta...</Text>
      </Flex>
    );
  }
  
  return (
    <Box 
      borderWidth="1px" 
      borderColor="gray.700" 
      borderRadius="xl" 
      overflow="hidden" 
      height={isFullscreen ? "calc(100vh - 150px)" : "600px"}
      position="relative"
      transition="height 0.3s ease"
    >
      {/* Overlay cu controale și informații */}
      <Box 
        position="absolute" 
        top="0" 
        left="0" 
        right="0"
        zIndex="10"
        bg="blackAlpha.700"
        p={2}
        borderBottomWidth="1px"
        borderColor="gray.700"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <HStack spacing={3}>
            <Badge colorScheme="blue" fontSize="0.9em" p={1.5} borderRadius="md">
              <HStack spacing={1}>
                <Icon as={paramInfo.icon === 'thermometer-half' ? FaTemperatureHalf : 
                      paramInfo.icon === 'tint' ? FaDroplet : 
                      paramInfo.icon === 'wind' ? FaWind : FaMap} />
                <Text>{paramInfo.label}: <strong>{formatNumber(currentValue, 1)}{paramInfo.unit}</strong></Text>
              </HStack>
            </Badge>
            
            <Badge colorScheme={isLive ? "green" : "orange"} p={1.5} borderRadius="md" cursor="pointer" onClick={toggleLiveMode}>
              <HStack spacing={1}>
                <Icon as={isLive ? FaSyncAlt : FaRegClock} />
                <Text>{isLive ? "Timp real" : "Istoric"}</Text>
              </HStack>
            </Badge>
          </HStack>
          
          <HStack spacing={3}>
            <Select 
              size="sm" 
              value={mapStyle} 
              onChange={(e) => setMapStyle(e.target.value)}
              bg="whiteAlpha.200" 
              borderColor="transparent"
              w="auto"
              _hover={{ borderColor: "blue.400" }}
            >
              {mapStyles.map(style => (
                <option key={style.value} value={style.value}>{style.label}</option>
              ))}
            </Select>
            
            <Tooltip label={isFullscreen ? "Ieșire din ecran complet" : "Ecran complet"}>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Icon as={FaSearch} />
              </Button>
            </Tooltip>
          </HStack>
        </Flex>
      </Box>
      
      {/* Container pentru iframe */}
      <Box 
        height="100%" 
        width="100%"
        ref={mapContainerRef}
      >
        <iframe 
          src={mapUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          title={`Hartă termică: ${paramInfo.label}`}
          allowFullScreen
        />
      </Box>
      
      {/* Control pentru timp istoric */}
      {!isLive && history.length > 0 && (
        <Box 
          position="absolute" 
          bottom="0" 
          left="0" 
          right="0"
          zIndex="10"
          bg="blackAlpha.700"
          p={3}
          borderTopWidth="1px"
          borderColor="gray.700"
        >
          <VStack spacing={1} width="100%">
            <Flex width="100%" justifyContent="space-between" mb={1}>
              <Text fontSize="sm" color="gray.300">{formatDateTime(history[0]?.timestamp)}</Text>
              <Text fontSize="sm" fontWeight="bold" color="white">{formattedDate}</Text>
              <Text fontSize="sm" color="gray.300">{formatDateTime(history[history.length-1]?.timestamp)}</Text>
            </Flex>
            
            <Slider 
              aria-label="slider-istoric" 
              value={timeSlider} 
              onChange={(val) => setTimeSlider(val)}
              min={0}
              max={100}
              step={1}
              colorScheme="blue"
            >
              <SliderTrack bg="gray.600">
                <SliderFilledTrack bg="blue.400" />
              </SliderTrack>
              <SliderThumb boxSize={5} bg={color} />
            </Slider>
          </VStack>
        </Box>
      )}
    </Box>
  );
}

// Componenta pentru vizualizare 3D avansată
function Visualization3D({ parameter }) {
  const paramInfo = getParameterInfo(parameter);
  const { data: currentData, isLoading: isLoadingCurrent } = useCurrentWeather();
  const { history, isLoading: isLoadingHistory } = useParameterHistory(parameter, 24);
  const [animationActive, setAnimationActive] = useState(true);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [angle, setAngle] = useState(45); // unghi de vizualizare
  const [viewMode, setViewMode] = useState('3d'); // '3d', 'wave', 'bar'
  
  // Referinta pentru animatie
  const animationRef = useRef(null);
  
  // Valoarea pentru vizualizare
  const value = currentData ? currentData[parameter] : 0;
  
  // Calculăm procentul pentru vizualizare
  const getPercentage = (val) => {
    const min = paramInfo.min || 0;
    const max = paramInfo.max || 100;
    let percent = ((val - min) / (max - min)) * 100;
    // Limităm între 5 și 95 pentru vizibilitate
    return Math.min(Math.max(percent, 5), 95);
  };
  
  const percent = getPercentage(value);
  
  // Culorile pentru vizualizare
  const getColorByValue = (val) => {
    switch(parameter) {
      case 'temperature':
        if (val < 0) return '#3182CE'; // blue.500
        if (val < 10) return '#63B3ED'; // blue.300
        if (val < 20) return '#48BB78'; // green.400
        if (val < 25) return '#ECC94B'; // yellow.400
        if (val < 30) return '#ED8936'; // orange.400
        return '#E53E3E'; // red.500
        
      case 'humidity': 
        if (val < 30) return '#ECC94B'; // yellow.400
        if (val < 60) return '#48BB78'; // green.400
        return '#3182CE'; // blue.500
        
      case 'pressure':
        if (val < 1000) return '#F56565'; // red.400
        if (val < 1013) return '#ED8936'; // orange.400
        if (val < 1025) return '#4299E1'; // blue.400
        return '#805AD5'; // purple.500
        
      case 'wind_speed':
        if (val < 5) return '#48BB78'; // green.400
        if (val < 15) return '#38B2AC'; // teal.400
        if (val < 30) return '#ECC94B'; // yellow.400
        return '#E53E3E'; // red.500
        
      default:
        return '#4299E1'; // blue.400
    }
  };
  
  const color = getColorByValue(value);
  
  // Generare gradient pentru fundalul vizualizării
  const getBgGradient = () => {
    const colorStart = getColorByValue(paramInfo.min || 0);
    const colorMiddle = getColorByValue((paramInfo.min + paramInfo.max) / 2);
    const colorEnd = getColorByValue(paramInfo.max || 100);
    
    return `linear-gradient(180deg, ${colorStart}22, ${colorMiddle}33, ${colorEnd}22)`;
  };
  
  // Efect pentru animatia de rotatie
  useEffect(() => {
    if (animationActive) {
      animationRef.current = requestAnimationFrame(animateRotation);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animationActive, rotationDegree]);
  
  // Funcția de animatie pentru rotatie
  const animateRotation = () => {
    setRotationDegree(prev => (prev + 0.2) % 360);
    animationRef.current = requestAnimationFrame(animateRotation);
  };
  
  // Toggle pentru animatie
  const toggleAnimation = () => {
    setAnimationActive(!animationActive);
  };
  
  // Generare date pentru vizualizarea de unda
  const generateWaveData = () => {
    if (!history || history.length === 0) return [];
    
    return history.map((item, index) => {
      const heightPercent = getPercentage(item.value);
      return {
        x: index,
        y: heightPercent,
        value: item.value,
        timestamp: item.timestamp,
        color: getColorByValue(item.value)
      };
    });
  };
  
  const waveData = generateWaveData();
  
  // Loading state
  const isLoading = isLoadingCurrent || isLoadingHistory;
  
  if (isLoading) {
    return (
      <Flex direction="column" align="center" justify="center" h="600px">
        <Spinner size="xl" thickness="4px" color="blue.400" mb="4" />
        <Text>Se încarcă vizualizarea...</Text>
      </Flex>
    );
  }
  
  return (
    <Box 
      borderWidth="1px" 
      borderColor="gray.700" 
      borderRadius="xl" 
      overflow="hidden" 
      height="600px"
      position="relative"
      bg="gray.900"
    >
      {/* Header cu controale */}
      <Flex 
        justifyContent="space-between" 
        alignItems="center" 
        p={4} 
        borderBottomWidth="1px" 
        borderColor="gray.700"
        bg="blackAlpha.400"
      >
        <HStack>
          <Badge fontSize="md" colorScheme="blue" p={2} borderRadius="md">
            <HStack spacing={1}>
              <Icon as={paramInfo.icon === 'thermometer-half' ? FaTemperatureHalf : 
                    paramInfo.icon === 'tint' ? FaDroplet : 
                    paramInfo.icon === 'wind' ? FaWind : FaMap} />
              <Text>{paramInfo.label}: <strong>{formatNumber(value, 1)}{paramInfo.unit}</strong></Text>
            </HStack>
          </Badge>
        </HStack>
        
        <HStack spacing={3}>
          {/* Control pentru tipul de vizualizare */}
          <Select 
            size="sm" 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            bg="whiteAlpha.200" 
            borderColor="transparent"
            w="auto"
            _hover={{ borderColor: "blue.400" }}
          >
            <option value="3d">Cub 3D</option>
            <option value="wave">Undă temporală</option>
            <option value="bar">Grafic bare</option>
          </Select>
          
          {/* Buton pentru animatie */}
          <Tooltip label={animationActive ? "Oprește animația" : "Pornește animația"}>
            <Button 
              size="sm" 
              variant="ghost" 
              colorScheme={animationActive ? "green" : "gray"}
              onClick={toggleAnimation}
            >
              <Icon as={FaSyncAlt} />
            </Button>
          </Tooltip>
        </HStack>
      </Flex>
      
      {/* Continut principal */}
      <Box 
        height="calc(100% - 70px)" 
        width="100%" 
        position="relative"
        overflow="hidden"
        bgGradient={getBgGradient()}
      >
        {viewMode === '3d' && (
          <Flex alignItems="center" justifyContent="center" height="100%">
            <Box 
              position="relative" 
              width="300px" 
              height="300px"
              style={{ 
                perspective: '1000px',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Cubul 3D cu animație */}
              <Box
                position="absolute"
                width="100%"
                height="100%"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${angle}deg) rotateY(${rotationDegree}deg)`,
                  transition: animationActive ? 'none' : 'transform 0.5s ease'
                }}
              >
                {/* Fața față */}
                <Box
                  position="absolute"
                  width="100%"
                  height="100%"
                  bg={color}
                  borderRadius="md"
                  opacity="0.9"
                  style={{
                    transform: `translateZ(${150 * percent/100}px)`,
                    boxShadow: `0 0 30px ${color}88`
                  }}
                  transition="all 0.3s ease"
                />
                
                {/* Fața spate */}
                <Box
                  position="absolute"
                  width="100%"
                  height="100%"
                  bg={color}
                  borderRadius="md"
                  opacity="0.6"
                  style={{
                    transform: `translateZ(-${150 * percent/100}px) rotateY(180deg)`,
                  }}
                  transition="all 0.3s ease"
                />
                
                {/* Fața sus */}
                <Box
                  position="absolute"
                  width="100%"
                  height={`${300 * percent/100}px`}
                  bg={color}
                  borderRadius="md"
                  opacity="0.7"
                  style={{
                    transform: `rotateX(90deg) translateZ(${150 * percent/100}px)`,
                  }}
                  transition="all 0.3s ease"
                />
                
                {/* Fața jos */}
                <Box
                  position="absolute"
                  width="100%"
                  height={`${300 * percent/100}px`}
                  bg={color}
                  borderRadius="md"
                  opacity="0.7"
                  style={{
                    transform: `rotateX(-90deg) translateZ(${150 * percent/100}px)`,
                  }}
                  transition="all 0.3s ease"
                />
                
                {/* Fața stânga */}
                <Box
                  position="absolute"
                  width={`${300 * percent/100}px`}
                  height="100%"
                  bg={color}
                  borderRadius="md"
                  opacity="0.8"
                  style={{
                    transform: `rotateY(-90deg) translateZ(${150 * percent/100}px)`,
                  }}
                  transition="all 0.3s ease"
                />
                
                {/* Fața dreapta */}
                <Box
                  position="absolute"
                  width={`${300 * percent/100}px`}
                  height="100%"
                  bg={color}
                  borderRadius="md"
                  opacity="0.8"
                  style={{
                    transform: `rotateY(90deg) translateZ(${150 * percent/100}px)`,
                  }}
                  transition="all 0.3s ease"
                />
              </Box>
            </Box>
          </Flex>
        )}
        
        {viewMode === 'wave' && waveData.length > 0 && (
          <Box p={4} height="100%">
            <Flex height="100%" width="100%" position="relative" alignItems="flex-end">
              {waveData.map((point, index) => (
                <Tooltip 
                  key={index} 
                  label={`${formatNumber(point.value, 1)}${paramInfo.unit} - ${formatDateTime(point.timestamp)}`}
                  placement="top"
                >
                  <Box
                    height={`${point.y}%`}
                    width={`${100 / waveData.length}%`}
                    bg={point.color}
                    borderTopLeftRadius="md"
                    borderTopRightRadius="md"
                    opacity="0.7"
                    transition="height 0.3s ease"
                    _hover={{ opacity: 1 }}
                  />
                </Tooltip>
              ))}
            </Flex>
          </Box>
        )}
        
        {viewMode === 'bar' && waveData.length > 0 && (
          <Box p={4} height="100%" overflow="hidden">
            <SimpleGrid columns={{ base: 3, md: 4, lg: 6 }} spacing={4} height="100%">
              {waveData.slice(-6).map((point, index) => (
                <VStack key={index} height="100%" justifyContent="flex-end">
                  <Box
                    width="100%"
                    height={`${point.y}%`}
                    bg={point.color}
                    borderRadius="md"
                    boxShadow={`0 0 20px ${point.color}88`}
                    transition="all 0.3s ease"
                    _hover={{ transform: 'scale(1.05)' }}
                  />
                  <VStack spacing={0}>
                    <Text fontSize="sm" color="white" fontWeight="bold">
                      {formatNumber(point.value, 1)}{paramInfo.unit}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      {new Date(point.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </VStack>
                </VStack>
              ))}
            </SimpleGrid>
          </Box>
        )}
        
        {/* Indicator valoare pe ecran */}
        {viewMode === '3d' && (
          <Box 
            position="absolute" 
            bottom="10px"
            left="0"
            right="0"
            textAlign="center"
          >
            <Text fontSize="3xl" fontWeight="bold" color="white" textShadow="0 0 10px rgba(0,0,0,0.5)">
              {formatNumber(value, 1)}{paramInfo.unit}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Componenta pentru imagine din satelit avansată
function SatelliteView() {
  const { data: currentData, isLoading } = useCurrentWeather();
  const [viewType, setViewType] = useState('radar'); // 'radar', 'satellite', 'combined'
  const [showInfo, setShowInfo] = useState(true); // arată/ascunde info
  const [layerOpacity, setLayerOpacity] = useState(80); // opacitate layer
  
  // Tipuri de vizualizare disponibile
  const viewTypes = [
    { id: 'radar', label: 'Radar precipitații', description: 'Arată distribuția precipitațiilor în timp real.' },
    { id: 'satellite', label: 'Imagine satelit', description: 'Imagine din satelit cu nori și relief.' },
    { id: 'combined', label: 'Combinat', description: 'Combină imaginile radar cu imagini din satelit.' }
  ];
  
  // Obține URL-ul pentru vizualizare
  const getMapUrl = () => {
    // Coordonate stație meteo (Timișoara)
    const lat = 45.7489;
    const lon = 21.2087;
    const zoom = 8;
    
    switch(viewType) {
      case 'radar':
        return `https://www.rainviewer.com/map.html?loc=${lat},${lon},${zoom}&oFa=0&oC=1&oU=0&oCS=1&oF=0&oAP=1&c=1&o=${layerOpacity}&lm=1&th=0&sm=1&sn=1`;
      case 'satellite':
        return `https://www.ventusky.com/?p=${lat};${lon};${zoom}&l=satellite`;
      case 'combined':
        return `https://www.windy.com/45.749/21.209?satellite,45.749,21.209,${zoom},p:off`;
      default:
        return `https://www.rainviewer.com/map.html?loc=${lat},${lon},${zoom}&oFa=0&oC=1&oU=0&oCS=1&oF=0&oAP=1&c=1&o=${layerOpacity}&lm=1&th=0&sm=1&sn=1`;
    }
  };
  
  // Obține culoarea pentru condițiile meteo curente
  const getWeatherColor = () => {
    if (!currentData) return 'blue.400';
    
    // Determinăm culoarea bazată pe condiții
    if (currentData.humidity > 85) return 'blue.500'; // ploaie probabilă
    if (currentData.temperature > 30) return 'orange.500'; // foarte cald
    if (currentData.temperature < 5) return 'cyan.400'; // frig
    if (currentData.wind_speed > 20) return 'yellow.500'; // vântos
    
    return 'green.400'; // condiții normale
  };
  
  const weatherColor = getWeatherColor();
  
  // Descriere a condițiilor meteo curente
  const getWeatherDescription = () => {
    if (!currentData) return 'Informații meteo nedisponibile';
    
    let desc = 'Condiții meteo: ';
    
    // Temperatura
    if (currentData.temperature < 5) desc += 'Rece';
    else if (currentData.temperature < 15) desc += 'Răcoare';
    else if (currentData.temperature < 25) desc += 'Temperatură moderată';
    else if (currentData.temperature < 30) desc += 'Cald';
    else desc += 'Foarte cald';
    
    // Umiditate și precipitații
    if (currentData.humidity > 85) desc += ', Precipitații probabile';
    else if (currentData.humidity > 70) desc += ', Umiditate ridicată';
    
    // Vânt
    if (currentData.wind_speed > 30) desc += ', Vânt puternic';
    else if (currentData.wind_speed > 15) desc += ', Vânt moderat';
    
    return desc;
  };
  
  if (isLoading) {
    return (
      <Flex direction="column" align="center" justify="center" h="600px">
        <Spinner size="xl" thickness="4px" color="blue.400" mb="4" />
        <Text>Se încarcă datele...</Text>
      </Flex>
    );
  }
  
  return (
    <Box 
      borderWidth="1px" 
      borderColor="gray.700" 
      borderRadius="xl" 
      overflow="hidden" 
      h="600px" 
      position="relative"
    >
      {/* Control panel */}
      <Flex 
        position="absolute" 
        top="0" 
        left="0" 
        right="0"
        zIndex="10"
        bg="blackAlpha.700"
        p={3}
        borderBottomWidth="1px"
        borderColor="gray.700"
        justifyContent="space-between"
        alignItems="center"
      >
        {/* Stânga: Selector tip vizualizare */}
        <HStack spacing={3}>
          <Select 
            size="sm" 
            value={viewType} 
            onChange={(e) => setViewType(e.target.value)}
            bg="whiteAlpha.200" 
            borderColor="transparent"
            _hover={{ borderColor: weatherColor }}
            w="auto"
            maxW="200px"
          >
            {viewTypes.map(type => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </Select>
          
          {/* Slider pentru opacitate - doar pentru radar */}
          {viewType === 'radar' && (
            <HStack spacing={2} width="150px">
              <Text fontSize="xs" color="gray.300">Opacitate:</Text>
              <Slider 
                value={layerOpacity} 
                onChange={(val) => setLayerOpacity(val)}
                min={30}
                max={100}
                step={5}
                size="sm"
                colorScheme="blue"
                flex="1"
              >
                <SliderTrack bg="gray.600">
                  <SliderFilledTrack bg={weatherColor} />
                </SliderTrack>
                <SliderThumb boxSize={3} bg="white" />
              </Slider>
            </HStack>
          )}
        </HStack>
        
        {/* Dreapta: Info meteo și buton toggle */}
        <HStack spacing={3}>
          {showInfo && (
            <Badge colorScheme={weatherColor.split('.')[0]} p={1.5} borderRadius="md">
              <Text fontSize="sm">{getWeatherDescription()}</Text>
            </Badge>
          )}
          
          <Tooltip label={showInfo ? "Ascunde informații" : "Arată informații"}>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowInfo(!showInfo)}
            >
              <Icon as={FaInfoCircle} />
            </Button>
          </Tooltip>
        </HStack>
      </Flex>
      
      {/* Descriere vizualizare */}
      {showInfo && (
        <Box 
          position="absolute" 
          bottom="0" 
          left="0" 
          right="0"
          zIndex="10"
          bg="blackAlpha.700"
          p={3}
          borderTopWidth="1px"
          borderColor="gray.700"
        >
          <Text fontSize="sm" color="gray.300">
            {viewTypes.find(t => t.id === viewType)?.description || 'Vizualizare imagine din satelit.'}
          </Text>
          
          {/* Datele curente */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mt={2}>
            <HStack>
              <Icon as={FaTemperatureHalf} color={weatherColor} />
              <Text fontSize="sm">{formatNumber(currentData.temperature, 1)}°C</Text>
            </HStack>
            <HStack>
              <Icon as={FaDroplet} color={weatherColor} />
              <Text fontSize="sm">{formatNumber(currentData.humidity, 0)}%</Text>
            </HStack>
            <HStack>
              <Icon as={FaWind} color={weatherColor} />
              <Text fontSize="sm">{formatNumber(currentData.wind_speed, 1)} km/h</Text>
            </HStack>
            <HStack>
              <Icon as={FaRegClock} color={weatherColor} />
              <Text fontSize="sm">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
            </HStack>
          </SimpleGrid>
        </Box>
      )}
      
      {/* Iframe cu harta */}
      <Box height="100%" width="100%" borderRadius="xl" overflow="hidden">
        <iframe 
          src={getMapUrl()}
          width="100%"
          height="100%"
          style={{ border: 'none', borderRadius: 'inherit' }}
          title="Imagine satelit meteo"
          allowFullScreen
          aria-hidden="false"
          tabIndex="0"
        />
      </Box>
    </Box>
  );
}

function Maps() {
  const [activeParameter, setActiveParameter] = useState('temperature');
  const [activeTab, setActiveTab] = useState(0);
  
  // Obținere date curente
  const { data: currentData, isLoading, isError } = useCurrentWeather();
  
  // Lista de parametri pentru selectare
  const parameters = [
    { id: 'temperature', label: 'Temperatură' },
    { id: 'humidity', label: 'Umiditate' },
    { id: 'pressure', label: 'Presiune' },
    { id: 'wind_speed', label: 'Viteză vânt' }
  ];
  
  // Handler pentru schimbarea parametrului
  const handleParameterChange = (e) => {
    setActiveParameter(e.target.value);
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
            Hărți și Vizualizări
          </Text>
        </Flex>
      </Box>
      
      {/* Content */}
      <Box p={{ base: "4", md: "6", lg: "8" }} pb="24">
        <Tabs 
          variant="soft-rounded" 
          colorScheme="blue" 
          onChange={(index) => setActiveTab(index)}
        >
          <TabList mb="6">
            <Tab _selected={{ bg: 'blue.800', color: 'white' }}>Hărți Termice</Tab>
            <Tab _selected={{ bg: 'blue.800', color: 'white' }}>Vizualizări 3D</Tab>
            <Tab _selected={{ bg: 'blue.800', color: 'white' }}>Imagini Satelit</Tab>
          </TabList>
          
          <Box mb="4">
            <Flex alignItems="center" mb="4">
              <Text mr="3" fontWeight="medium" fontSize="sm" color="gray.400">
                Parametru:
              </Text>
              <Select 
                w="auto" 
                size="sm" 
                value={activeParameter}
                onChange={handleParameterChange}
                bg="gray.700"
                borderColor="gray.600"
                _hover={{ borderColor: 'gray.500' }}
                maxW="200px"
              >
                {parameters.map(param => (
                  <option key={param.id} value={param.id}>{param.label}</option>
                ))}
              </Select>
            </Flex>
          </Box>
          
          <TabPanels>
            {/* Hărți Termice */}
            <TabPanel p="0">
              <HeatMap parameter={activeParameter} />
            </TabPanel>
            
            {/* Vizualizări 3D */}
            <TabPanel p="0">
              <Visualization3D parameter={activeParameter} />
            </TabPanel>
            
            {/* Imagini Satelit */}
            <TabPanel p="0">
              <SatelliteView />
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        {/* Descriere și info */}
        <Box mt="8" p="5" bg="gray.800" borderRadius="lg" borderWidth="1px" borderColor="gray.700">
          <Text fontSize="lg" fontWeight="semibold" mb="3">Despre Hărți și Vizualizări</Text>
          <Text fontSize="sm" color="gray.400" mb="3">
            Acest modul oferă vizualizări avansate pentru datele meteorologice locale:
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
            <Box p="4" bg="gray.700" borderRadius="md">
              <Flex alignItems="center" mb="2">
                <Icon as={FaMap} color="yellow.400" mr="2" />
                <Text fontWeight="medium">Hărți Termice</Text>
              </Flex>
              <Text fontSize="xs" color="gray.400">
                Vizualizează distribuția parametrilor meteo pe o hartă de densitate.
              </Text>
            </Box>
            <Box p="4" bg="gray.700" borderRadius="md">
              <Flex alignItems="center" mb="2">
                <Icon as={FaTemperatureHalf} color="red.400" mr="2" />
                <Text fontWeight="medium">Vizualizări 3D</Text>
              </Flex>
              <Text fontSize="xs" color="gray.400">
                Reprezentări tridimensionale ale variațiilor parametrilor în timp.
              </Text>
            </Box>
            <Box p="4" bg="gray.700" borderRadius="md">
              <Flex alignItems="center" mb="2">
                <Icon as={FaSatellite} color="blue.400" mr="2" />
                <Text fontWeight="medium">Imagini Satelit</Text>
              </Flex>
              <Text fontSize="xs" color="gray.400">
                Imagini satelitare cu suprapunere de date locale pentru context.
              </Text>
            </Box>
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
}

export default Maps;
