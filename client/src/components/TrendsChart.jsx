import React from 'react';
import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { FaChartLine } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { formatTime } from '../utils/sensorUtils';

// Înregistrăm componentele Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function TrendsChart({ data }) {
  if (!data || !data.timeHistory || data.timeHistory.length === 0) {
    return null;
  }

  // Formatăm etichetele de timp pentru axă
  const labels = data.timeHistory.map(time => formatTime(time));

  // Configurăm datele pentru grafic
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Temperatură (°C)',
        data: data.dataHistory.temperature,
        borderColor: '#FF5555',
        backgroundColor: 'rgba(255, 85, 85, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y-temperature',
      },
      {
        label: 'Umiditate (%)',
        data: data.dataHistory.humidity,
        borderColor: '#5DADE2',
        backgroundColor: 'rgba(93, 173, 226, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y-humidity',
      },
      {
        label: 'Presiune (hPa)',
        data: data.dataHistory.pressure,
        borderColor: '#C39BD3',
        backgroundColor: 'rgba(195, 155, 211, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y-pressure',
        hidden: true
      }
    ]
  };

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
      'y-temperature': {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Temperatură (°C)',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 13,
            weight: '500'
          },
          color: '#E5E7EB'
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          },
          color: '#D1D5DB'
        }
      },
      'y-humidity': {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Umiditate (%)',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 13,
            weight: '500'
          },
          color: '#E5E7EB'
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          },
          color: '#D1D5DB'
        }
      },
      'y-pressure': {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Presiune (hPa)',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 13,
            weight: '500'
          },
          color: '#E5E7EB'
        },
        grid: {
          drawOnChartArea: false,
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          },
          color: '#D1D5DB'
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
        <Icon as={FaChartLine} mr="2" />
        <Text fontWeight="semibold" fontSize="lg">Tendințe recente</Text>
      </Flex>
      
      <Box p="6">
        <Box h={{ base: "64", lg: "96" }}>
          <Line data={chartData} options={chartOptions} />
        </Box>
      </Box>
    </Box>
  );
}

export default TrendsChart;
