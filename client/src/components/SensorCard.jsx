import React from 'react';
import { Box, Flex, Text, Icon, Progress } from '@chakra-ui/react';
import { FaThermometerHalf, FaTint, FaCompressAlt, FaSun, FaRadiation, FaWind, FaCompass, FaQuestion } from 'react-icons/fa';
import { formatNumber, normalizeValue } from '../utils/sensorUtils';

// Mapare pentru iconițe
const iconMap = {
  'thermometer-half': FaThermometerHalf,
  'tint': FaTint,
  'compress-alt': FaCompressAlt,
  'sun': FaSun,
  'radiation': FaRadiation,
  'wind': FaWind,
  'compass': FaCompass,
  'question': FaQuestion
};

function SensorCard({ paramInfo, value }) {
  // Obținem icona corectă
  const IconComponent = iconMap[paramInfo.icon] || FaQuestion;

  return (
    <Box 
      bg="gray.800" 
      borderRadius="xl" 
      boxShadow="md" 
      overflow="hidden" 
      borderWidth="1px"
      borderColor="gray.700"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'lg'
      }}
    >
      {/* Header */}
      <Flex 
        px="6" 
        py="3" 
        bgGradient="linear(to-r, gray.700, gray.900)"
        color="white" 
        alignItems="center"
      >
        <Icon as={IconComponent} mr="2" />
        <Text fontWeight="medium" fontSize="md">{paramInfo.label}</Text>
      </Flex>
      
      {/* Conținut */}
      <Flex direction="column" alignItems="center" p="6">
        <Box 
          color={paramInfo.color} 
          fontSize="4xl" 
          mb="4"
        >
          <Icon as={IconComponent} />
        </Box>
        
        <Text fontSize="4xl" fontWeight="bold" color="gray.100">
          {formatNumber(value, paramInfo.id === 'radiation' ? 2 : 1)}
        </Text>
        
        <Text fontSize="sm" color="gray.600" mb="4">
          {paramInfo.unit}
        </Text>
      </Flex>
      
      {/* Dunga de jos */}
      <Box 
        h="2px" 
        bgGradient={`linear(to-r, ${paramInfo.color}, gray.700)`} 
        opacity="0.8"
      />
    </Box>
  );
}

export default SensorCard;
