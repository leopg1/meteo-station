import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  sensor: {
    temperature: '#FF5555',
    humidity: '#5DADE2',
    pressure: '#C39BD3',
    light: '#FFD700',
    radiation: '#FFA500',
    wind_speed: '#4ECDC4',
    wind_direction: '#7FB3D5',
  }
};

const components = {
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'xl',
        overflow: 'hidden',
        boxShadow: 'md',
        transition: 'all 0.3s ease',
      }
    },
    variants: {
      elevated: {
        container: {
          bg: 'gray.800',
          border: '1px solid',
          borderColor: 'gray.700',
          _hover: {
            transform: 'translateY(-4px)',
            boxShadow: 'lg',
          }
        }
      }
    },
    defaultProps: {
      variant: 'elevated',
    }
  },
  Button: {
    variants: {
      solid: {
        bg: 'gray.700',
        color: 'white',
        _hover: {
          bg: 'gray.600',
        }
      },
      outline: {
        borderColor: 'gray.600',
        color: 'gray.300',
        _hover: {
          bg: 'gray.700',
        }
      }
    }
  }
};

const theme = extendTheme({ 
  config,
  colors,
  components,
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'gray.200',
      }
    }
  }
});

export default theme;
