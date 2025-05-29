import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Text,
  VStack,
  HStack,
  Input,
  IconButton,
  Spinner,
  useToast,
  Avatar,
  Icon,
  Divider
} from '@chakra-ui/react';
import { FaPaperPlane, FaRobot, FaUser, FaCloudSun } from 'react-icons/fa';
import { useCurrentWeather } from '../hooks/useWeatherData';

// Componenta pentru un mesaj individual
function Message({ message }) {
  const isUser = message.role === 'user';
  
  return (
    <Flex 
      w="100%" 
      justify={isUser ? "flex-end" : "flex-start"}
    >
      <Flex
        maxW="80%"
        bg={isUser ? "blue.600" : "gray.700"}
        borderRadius="lg"
        px="4"
        py="3"
        mb="2"
      >
        <Avatar 
          size="sm" 
          mr="3" 
          icon={isUser ? <FaUser /> : <FaRobot />} 
          bg={isUser ? "blue.700" : "gray.800"}
        />
        <Box>
          <Text fontWeight="bold" fontSize="sm" color={isUser ? "blue.100" : "gray.300"}>
            {isUser ? "Tu" : "Asistent Meteo"}
          </Text>
          <Text color="white">{message.content}</Text>
        </Box>
      </Flex>
    </Flex>
  );
}

function Assistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bună! Sunt asistentul tău pentru stația meteo. Cum te pot ajuta azi cu informații despre vreme?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef(null);
  
  const toast = useToast();
  const { data: currentData } = useCurrentWeather();
  
  // Scroll automat la ultimul mesaj
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Generare răspuns pentru asistent
  const generateResponse = () => {
    setTimeout(() => {
      // Pregătim contextul cu datele meteo actuale
      const weatherInfo = currentData ? {
        temp: currentData.temperature,
        humidity: currentData.humidity,
        pressure: currentData.pressure
      } : null;
      
      // Răspunsuri predefinite bazate pe input
      let response;
      const lowercaseInput = input.toLowerCase();
      
      if (lowercaseInput.includes('temperatur')) {
        response = `Temperatura curentă este ${weatherInfo?.temp || '22.5'}°C. Este o temperatură ${weatherInfo?.temp > 25 ? 'destul de ridicată' : 'confortabilă'} pentru această perioadă.`;
      } 
      else if (lowercaseInput.includes('umiditate')) {
        response = `Umiditatea aerului este ${weatherInfo?.humidity || '65'}%. ${weatherInfo?.humidity > 70 ? 'Este destul de umiditate, s-ar putea să plouă în curând.' : 'Este un nivel normal pentru această perioadă.'}`;
      }
      else if (lowercaseInput.includes('presiune')) {
        response = `Presiunea atmosferică este ${weatherInfo?.pressure || '1013'} hPa, ceea ce este ${weatherInfo?.pressure > 1013 ? 'peste' : 'sub'} media normală.`;
      }
      else if (lowercaseInput.includes('vreme') || lowercaseInput.includes('meteo')) {
        response = `Condițiile meteo sunt stabile, cu o temperatură de ${weatherInfo?.temp || '22.5'}°C și umiditate ${weatherInfo?.humidity || '65'}%. Este o zi bună pentru activități în aer liber.`;
      }
      else if (lowercaseInput.includes('bună') || lowercaseInput.includes('salut') || lowercaseInput.includes('servus')) {
        response = `Bună! Cu ce te pot ajuta astăzi legat de datele meteorologice?`;
      }
      else if (lowercaseInput.includes('radia')) {
        response = `Nivelul de radiație este ${weatherInfo ? currentData.radiation : '0.15'} µSv/h, ceea ce este un nivel normal și sigur.`;
      }
      else if (lowercaseInput.includes('vânt') || lowercaseInput.includes('vant')) {
        response = `Viteza vântului este ${weatherInfo ? currentData.wind_speed : '5.2'} km/h, cu direcția ${weatherInfo ? currentData.wind_direction : '225'}°. Este un vânt ușor.`;
      }
      else {
        response = `Înteleg că vrei să afli mai multe despre "${input}". Pot să-ți ofer informații despre temperatura, umiditatea, presiunea, radiația și vântul măsurate de stația meteo.`;
      }
      
      // Adaugă răspunsul asistentului
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 800);
  };
  
  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    // Adaugă mesajul utilizatorului
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Generează răspuns local
    generateResponse();
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
          justifyContent="space-between" 
          alignItems="center" 
          h="16" 
          px={{ base: "4", md: "6", lg: "8" }}
        >
          <Flex alignItems="center">
            <Icon as={FaCloudSun} color="blue.400" boxSize="6" mr="3" />
            <Text fontSize="2xl" fontWeight="semibold" color="gray.100">
              Asistent Meteo
            </Text>
          </Flex>
        </Flex>
      </Box>
      
      {/* Chat Area */}
      <Box 
        p={{ base: "4", md: "6", lg: "8" }} 
        height="calc(100vh - 14rem)"
        display="flex"
        flexDirection="column"
      >
        <Box 
          flex="1" 
          overflowY="auto" 
          bg="gray.900" 
          borderRadius="xl" 
          p="4"
          mb="4"
        >
          <VStack spacing="4" align="stretch">
            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}
            {isLoading && (
              <Flex justify="flex-start" my="2">
                <Box bg="gray.700" borderRadius="lg" px="4" py="3">
                  <Spinner size="sm" mr="2" color="blue.400" />
                  <Text fontSize="sm" color="gray.300">Asistentul răspunde...</Text>
                </Box>
              </Flex>
            )}
            <div ref={endOfMessagesRef} />
          </VStack>
        </Box>
        
        {/* Input Area */}
        <HStack spacing="3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Întreabă ceva despre datele meteo..."
            bg="gray.800"
            borderColor="gray.600"
            _hover={{ borderColor: "gray.500" }}
            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
            size="lg"
          />
          <IconButton
            colorScheme="blue"
            aria-label="Trimite mesaj"
            icon={<FaPaperPlane />}
            isLoading={isLoading}
            onClick={handleSendMessage}
            size="lg"
          />
        </HStack>
      </Box>
    </Box>
  );
}

export default Assistant;
