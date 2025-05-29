// Dashboard JavaScript
let currentData = null;
let trendsChart = null;
let timeHistory = [];
let dataHistory = {
    temperature: [],
    humidity: [],
    pressure: []
};

// Inițializare la încărcarea paginii
document.addEventListener('DOMContentLoaded', function() {
    // Adăugare handler pentru butonul de date test
    document.getElementById('test-data-btn').addEventListener('click', addTestData);
    
    // Încărcare date inițiale
    fetchCurrentData();
    
    // Actualizare automată la fiecare 60 secunde
    setInterval(fetchCurrentData, 60000);
});

// Funcție pentru obținerea datelor curente
function fetchCurrentData() {
    fetch('/api/data/current')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Salvare date și actualizare interfață
            currentData = data;
            updateDashboard();
            
            // Actualizare timestamp ultimă actualizare
            document.getElementById('last-update').textContent = formatDateTime(data.timestamp);
            
            // Actualizare istoric pentru grafic
            updateDataHistory();
        })
        .catch(error => {
            console.error('Eroare la obținerea datelor:', error);
            document.getElementById('sensors-container').innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        Eroare la obținerea datelor! Verificați conexiunea la server.
                    </div>
                </div>
            `;
        });
}

// Funcție pentru adăugarea unei înregistrări de test
function addTestData() {
    fetch('/api/test-data')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Reîncărcare date după adăugare
                fetchCurrentData();
            }
        })
        .catch(error => {
            console.error('Eroare la adăugarea datelor de test:', error);
        });
}

// Funcție pentru actualizarea istoricului de date pentru grafice
function updateDataHistory() {
    if (!currentData) return;
    
    const time = formatTime(currentData.timestamp);
    
    // Adăugare la istoric și menținere doar ultimele 10 valori
    timeHistory.push(time);
    if (timeHistory.length > 10) {
        timeHistory.shift();
    }
    
    dataHistory.temperature.push(currentData.temperature);
    if (dataHistory.temperature.length > 10) {
        dataHistory.temperature.shift();
    }
    
    dataHistory.humidity.push(currentData.humidity);
    if (dataHistory.humidity.length > 10) {
        dataHistory.humidity.shift();
    }
    
    dataHistory.pressure.push(currentData.pressure);
    if (dataHistory.pressure.length > 10) {
        dataHistory.pressure.shift();
    }
    
    // Actualizare grafic tendințe
    updateTrendsChart();
}

// Funcție pentru actualizarea graficului de tendințe
function updateTrendsChart() {
    const ctx = document.getElementById('trends-chart').getContext('2d');
    
    const chartData = {
        labels: timeHistory,
        datasets: [
            {
                label: 'Temperatură (°C)',
                data: dataHistory.temperature,
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y-temperature',
            },
            {
                label: 'Umiditate (%)',
                data: dataHistory.humidity,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y-humidity',
            },
            {
                label: 'Presiune (hPa)',
                data: dataHistory.pressure,
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y-pressure',
                hidden: true
            }
        ]
    };
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    },
                    color: '#e5e7eb', // gray-200
                    padding: 15
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#1f2937', // dark-800
                titleFont: {
                    family: "'Inter', sans-serif",
                    size: 14
                },
                bodyFont: {
                    family: "'Inter', sans-serif",
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
                        family: "'Inter', sans-serif",
                        size: 13,
                        weight: 'medium'
                    },
                    color: '#e5e7eb' // gray-200
                },
                grid: {
                    drawOnChartArea: false,
                    color: 'rgba(75, 85, 99, 0.3)' // gray-600 cu transparență
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    },
                    color: '#d1d5db' // gray-300
                }
            },
            'y-humidity': {
                type: 'linear',
                position: 'right',
                title: {
                    display: true,
                    text: 'Umiditate (%)',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 13,
                        weight: 'medium'
                    },
                    color: '#e5e7eb' // gray-200
                },
                min: 0,
                max: 100,
                grid: {
                    drawOnChartArea: false,
                    color: 'rgba(75, 85, 99, 0.3)' // gray-600 cu transparență
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    },
                    color: '#d1d5db' // gray-300
                }
            },
            'y-pressure': {
                type: 'linear',
                position: 'right',
                title: {
                    display: true,
                    text: 'Presiune (hPa)',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 13,
                        weight: 'medium'
                    },
                    color: '#e5e7eb' // gray-200
                },
                grid: {
                    drawOnChartArea: false,
                    color: 'rgba(75, 85, 99, 0.3)' // gray-600 cu transparență
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    },
                    color: '#d1d5db' // gray-300
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    },
                    color: '#d1d5db' // gray-300
                }
            }
        }
    };
    
    if (trendsChart) {
        trendsChart.data = chartData;
        trendsChart.update();
    } else {
        trendsChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: chartOptions
        });
    }
}

// Funcție pentru actualizarea dashboard-ului cu datele curente
function updateDashboard() {
    if (!currentData) return;
    
    // Creare carduri pentru senzori
    const sensorsContainer = document.getElementById('sensors-container');
    sensorsContainer.innerHTML = '';
    
    // Card Temperatură
    const tempCard = createSensorCard(
        'temperature',
        currentData.temperature.toFixed(1),
        '°C',
        'fa-thermometer-half',
        '#e74c3c'
    );
    sensorsContainer.appendChild(tempCard);
    
    // Card Umiditate
    const humidityCard = createSensorCard(
        'humidity',
        currentData.humidity.toFixed(1),
        '%',
        'fa-tint',
        '#3498db'
    );
    sensorsContainer.appendChild(humidityCard);
    
    // Card Presiune
    const pressureCard = createSensorCard(
        'pressure',
        currentData.pressure.toFixed(1),
        'hPa',
        'fa-compress-alt',
        '#9b59b6'
    );
    sensorsContainer.appendChild(pressureCard);
    
    // Card Lumină
    const lightCard = createSensorCard(
        'light',
        currentData.light.toFixed(1),
        'lux',
        'fa-sun',
        '#f39c12',
        Math.min(currentData.light / 1000 * 100, 100)
    );
    sensorsContainer.appendChild(lightCard);
    
    // Card Radiație
    const radiationCard = createSensorCard(
        'radiation',
        currentData.radiation.toFixed(2),
        'µW/cm²',
        'fa-radiation',
        '#e67e22',
        Math.min(currentData.radiation / 0.5 * 100, 100)
    );
    sensorsContainer.appendChild(radiationCard);
    
    // Card Viteză vânt
    const windSpeedCard = createSensorCard(
        'wind_speed',
        currentData.wind_speed.toFixed(1),
        'm/s',
        'fa-wind',
        '#1abc9c',
        Math.min(currentData.wind_speed / 20 * 100, 100)
    );
    sensorsContainer.appendChild(windSpeedCard);
    
    // Card Direcție vânt
    const windDirInfo = getParameterInfo('wind_direction');
    const direction = currentData.wind_direction.toFixed(0);
    const directionText = getWindDirectionText(currentData.wind_direction);
    
    const windDirectionCol = document.createElement('div');
    windDirectionCol.className = 'w-full sm:col-span-1';
    
    windDirectionCol.innerHTML = `
        <div class="bg-gray-800 rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-700">
            <div class="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white flex items-center">
                <i class="fa-solid fa-compass mr-2"></i>
                <h3 class="text-base font-medium">${windDirInfo.label}</h3>
            </div>
            <div class="p-6 text-center">
                <div class="flex justify-center items-center mb-4">
                    <div class="relative w-24 h-24 border-4 border-gray-700 rounded-full flex items-center justify-center">
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="text-xs text-gray-400">N</div>
                        </div>
                        <div class="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                            <div class="text-xs text-gray-400">E</div>
                        </div>
                        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                            <div class="text-xs text-gray-400">S</div>
                        </div>
                        <div class="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2">
                            <div class="text-xs text-gray-400">V</div>
                        </div>
                        <div class="h-12 w-1 bg-${windDirInfo.color.replace('#', '')} origin-bottom absolute bottom-1/2 transform -translate-x-1/2 rotate-${direction} pointer-events-none"></div>
                    </div>
                </div>
                <div class="text-4xl font-bold text-gray-100">${direction}°</div>
                <div class="text-sm text-gray-400 mb-4">${directionText}</div>
            </div>
        </div>
    `;
    
    sensorsContainer.appendChild(windDirectionCol);
}

// Funcție pentru crearea unui card de senzor utilizând Tailwind CSS cu tema dark mode
function createSensorCard(paramName, value, unit, iconClass, color, progressValue = null) {
    const col = document.createElement('div');
    col.className = 'w-full sm:col-span-1';
    
    // Obține informații despre parametru
    const paramInfo = getParameterInfo(paramName);
    
    // Construiește cardul
    col.innerHTML = `
        <div class="bg-gray-800 rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-700">
            <div class="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white flex items-center">
                <i class="fa-solid ${iconClass} mr-2"></i>
                <h3 class="text-base font-medium">${paramInfo.label}</h3>
            </div>
            <div class="p-6 text-center">
                <div class="text-${color.replace('#', '')} text-4xl mb-4">
                    <i class="fa-solid ${iconClass}"></i>
                </div>
                <div class="text-4xl font-bold text-gray-100">${value}</div>
                <div class="text-sm text-gray-600 mb-4">${unit}</div>
                ${progressValue !== null ? `
                <div class="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                    <div class="h-2.5 rounded-full" style="width: ${progressValue}%; background-color: ${color}"></div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    return col;
}
