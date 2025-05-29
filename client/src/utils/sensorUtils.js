// Utilitare pentru procesarea datelor de senzori

// Obținerea informațiilor despre parametrii măsurați
export const getParameterInfo = (param) => {
  switch(param) {
    case 'temperature': 
      return { 
        id: 'temperature',
        label: 'Temperatură', 
        unit: '°C', 
        icon: 'thermometer-half', 
        color: 'sensor.temperature',
        min: -30,
        max: 50
      };
    case 'humidity': 
      return { 
        id: 'humidity',
        label: 'Umiditate', 
        unit: '%', 
        icon: 'tint', 
        color: 'sensor.humidity',
        min: 0,
        max: 100
      };
    case 'pressure': 
      return { 
        id: 'pressure',
        label: 'Presiune', 
        unit: 'hPa', 
        icon: 'compress-alt', 
        color: 'sensor.pressure',
        min: 970,
        max: 1050
      };
    case 'light': 
      return { 
        id: 'light',
        label: 'Lumină', 
        unit: 'lux', 
        icon: 'sun', 
        color: 'sensor.light',
        min: 0,
        max: 100000
      };
    case 'radiation': 
      return { 
        id: 'radiation',
        label: 'Radiație', 
        unit: 'µSv/h', 
        icon: 'radiation', 
        color: 'sensor.radiation',
        min: 0,
        max: 0.5
      };
    case 'wind_speed': 
      return { 
        id: 'wind_speed',
        label: 'Viteză vânt', 
        unit: 'km/h', 
        icon: 'wind', 
        color: 'sensor.wind_speed',
        min: 0,
        max: 100
      };
    case 'wind_direction': 
      return { 
        id: 'wind_direction',
        label: 'Direcție vânt', 
        unit: '°', 
        icon: 'compass', 
        color: 'sensor.wind_direction',
        min: 0,
        max: 360
      };
    default: 
      return { 
        id: param,
        label: param, 
        unit: '', 
        icon: 'question', 
        color: 'gray.500',
        min: 0,
        max: 100
      };
  }
};

// Obținerea textului pentru direcția vântului
export const getWindDirectionText = (degrees) => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSV', 'SV', 'VSV', 'V', 'VNV', 'NV', 'NNV'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Formatare dată și oră
export const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('ro-RO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Formatare doar oră
export const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('ro-RO', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Formatare număr cu precizie
export const formatNumber = (value, precision = 1) => {
  if (value === undefined || value === null) return '-';
  return Number(value).toFixed(precision);
};

// Normalizare valoare în interval procentual (0-100)
export const normalizeValue = (value, min, max) => {
  return Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
};
