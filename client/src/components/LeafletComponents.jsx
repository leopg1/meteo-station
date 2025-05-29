import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corectarea iconițelor lipsă în Leaflet
// Soluție pentru iconițele din Leaflet care nu se încarcă corect
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Componenta pentru centrarea hărții
function SetViewOnDataChange({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

// Componenta pentru hartă meteorologică
function WeatherMap({ parameter, currentData, position = [45.75, 21.22], zoom = 13 }) {
  const paramInfo = parameter ? {
    name: parameter,
    value: currentData ? currentData[parameter] : 0,
    color: getParameterColor(parameter, currentData ? currentData[parameter] : 0)
  } : null;
  
  // Rază pentru zona de influență
  const radius = 1000; // 1km
  
  return (
    <Box height="500px" width="100%" borderRadius="xl" overflow="hidden">
      <MapContainer 
        center={position} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
      >
        <TileLayer
          url={useColorModeValue(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
          )}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <Marker position={position}>
          <Popup>
            <strong>Stația meteo</strong><br />
            {paramInfo && (
              <span>
                {getParameterLabel(paramInfo.name)}: {paramInfo.value} {getParameterUnit(paramInfo.name)}
              </span>
            )}
          </Popup>
        </Marker>
        
        {paramInfo && (
          <Circle 
            center={position} 
            pathOptions={{ fillColor: paramInfo.color, color: paramInfo.color, fillOpacity: 0.4 }} 
            radius={radius} 
          />
        )}
        
        <SetViewOnDataChange center={position} />
      </MapContainer>
    </Box>
  );
}

// Funcții utilitare pentru parametri meteorologici
function getParameterColor(parameter, value) {
  switch(parameter) {
    case 'temperature':
      if (value < 0) return '#9cc0ff';  // albastru deschis pentru rece
      if (value < 15) return '#43a9ff'; // albastru pentru moderat
      if (value < 25) return '#fcec03'; // galben pentru cald
      if (value < 30) return '#ffa500'; // portocaliu pentru foarte cald
      return '#ff4500';                // roșu pentru caniculă
    
    case 'humidity':
      if (value < 30) return '#ffffb2'; // galben foarte deschis pentru uscat
      if (value < 60) return '#41b6c4'; // albastru-verde pentru moderat
      return '#253494';                // albastru închis pentru umed
    
    case 'pressure':
      if (value < 1000) return '#fee090'; // portocaliu deschis pentru presiune joasă
      if (value < 1013) return '#fdae61'; // portocaliu pentru presiune normală-joasă
      if (value < 1025) return '#abd9e9'; // albastru deschis pentru presiune normală-ridicată
      return '#4575b4';                  // albastru pentru presiune ridicată
    
    case 'wind_speed':
      if (value < 5) return '#edf8e9';   // verde foarte deschis pentru calm
      if (value < 15) return '#bae4b3';  // verde deschis pentru briză ușoară
      if (value < 30) return '#74c476';  // verde pentru vânt moderat
      if (value < 50) return '#31a354';  // verde închis pentru vânt puternic
      return '#006d2c';                 // verde foarte închis pentru furtună
      
    default:
      return '#3388ff';  // albastru implicit pentru leaflet
  }
}

function getParameterLabel(parameter) {
  const labels = {
    temperature: 'Temperatură',
    humidity: 'Umiditate',
    pressure: 'Presiune',
    wind_speed: 'Viteză vânt',
    wind_direction: 'Direcție vânt',
    light: 'Lumină',
    radiation: 'Radiație'
  };
  
  return labels[parameter] || parameter;
}

function getParameterUnit(parameter) {
  const units = {
    temperature: '°C',
    humidity: '%',
    pressure: 'hPa',
    wind_speed: 'km/h',
    wind_direction: '°',
    light: 'lux',
    radiation: 'µSv/h'
  };
  
  return units[parameter] || '';
}

// Componenta pentru vizualizare 3D simplă (placeholder)
function Simple3DVisualization({ parameter, currentData }) {
  return (
    <Box 
      height="500px" 
      width="100%" 
      borderRadius="xl" 
      position="relative" 
      overflow="hidden"
      bg="gray.800"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box 
        position="absolute"
        height="70%"
        width="70%"
        bg={getParameterColor(parameter, currentData ? currentData[parameter] : 0)}
        opacity="0.7"
        borderRadius="md"
        style={{
          transform: 'perspective(500px) rotateX(30deg) rotateZ(15deg)',
          boxShadow: '0 0 20px rgba(0,0,0,0.3)'
        }}
      />
      <Box 
        position="absolute"
        top="50%"
        left="50%"
        style={{
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}
      >
        <strong style={{ fontSize: '1.5rem', color: 'white' }}>
          {getParameterLabel(parameter)}
        </strong>
        <div style={{ fontSize: '2rem', color: 'white', marginTop: '0.5rem' }}>
          {currentData ? currentData[parameter] : '0'} {getParameterUnit(parameter)}
        </div>
      </Box>
    </Box>
  );
}

export default {
  WeatherMap,
  Simple3DVisualization
};
