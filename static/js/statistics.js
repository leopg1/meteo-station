// Statistics JavaScript
let statsData = null;
let statsChart = null;

// Inițializare la încărcarea paginii
document.addEventListener('DOMContentLoaded', function() {
    // Inițializare datepicker-uri cu valorile implicite
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    document.getElementById('stats-start-date').valueAsDate = oneMonthAgo;
    document.getElementById('stats-end-date').valueAsDate = today;
    
    // Inițializare meniu mobil
    initMobileMenu();
    
    // Adăugare handler pentru formularul de filtrare
    document.getElementById('stats-filter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        fetchStats();
    });
    
    // Setare an curent în footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Inițializare statistici
    fetchStatisticsData();
});

// Funcție pentru a inițializa meniul mobil
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMenuButton = document.getElementById('close-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && closeMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.remove('hidden');
        });
        
        closeMenuButton.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
        });
    }
}

// Funcție pentru obținerea statisticilor
function fetchStatisticsData() {
    // Obținere valori filtre
    const startDate = document.getElementById('stats-start-date').value;
    const endDate = document.getElementById('stats-end-date').value;
    
    // Construire URL cu parametri
    let url = '/api/stats';
    if (startDate || endDate) url += '?';
    if (startDate) url += `start_date=${startDate}`;
    if (startDate && endDate) url += '&';
    if (endDate) url += `end_date=${endDate}`;
    
    // Afișare indicator de încărcare
    document.getElementById('stats-cards').innerHTML = `
        <div class="col-span-full flex justify-center py-10">
            <div class="flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                <p class="mt-4 text-gray-600">Se calculează statisticile...</p>
            </div>
        </div>
    `;
    
    // Efectuare request
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayStats(data);
            createStatsChart(data);
        })
        .catch(error => {
            console.error('Eroare la obținerea statisticilor:', error);
            document.getElementById('stats-cards').innerHTML = `
                <div class="col-span-full">
                    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm">
                        <div class="flex items-center">
                            <i class="fa-solid fa-circle-exclamation mr-3 text-red-500 text-lg"></i>
                            <p>Eroare la obținerea statisticilor. Verificați conexiunea la server.</p>
                        </div>
                    </div>
                </div>
            `;
        });
}

// Funcție pentru afișarea statisticilor utilizând Tailwind CSS cu tema dark mode
function displayStats(statsData) {
    if (!statsData) return;
    
    const statsCardsContainer = document.getElementById('stats-cards');
    statsCardsContainer.innerHTML = '';
    
    // Parametrii pentru care vom afișa carduri
    const parameters = [
        'temperature',
        'humidity',
        'pressure',
        'light',
        'radiation',
        'wind_speed'
    ];
    
    // Creare card pentru fiecare parametru
    parameters.forEach(param => {
        const paramInfo = getParameterInfo(param);
        const stats = statsData[param];
        
        // Creare coloană pentru card
        const card = document.createElement('div');
        card.className = 'bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-700';
        
        // Setare HTML pentru card
        card.innerHTML = `
            <div class="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white flex items-center">
                <i class="fa-solid ${paramInfo.icon} mr-2"></i>
                <h3 class="text-base font-medium">${paramInfo.label}</h3>
            </div>
            <div class="p-5 relative">
                <div class="absolute top-0 right-0 -mt-7 mr-4 bg-gray-700 rounded-full p-3 shadow-md border border-gray-600">
                    <i class="fa-solid ${paramInfo.icon} text-2xl" style="color: ${paramInfo.color}"></i>
                </div>
                <div class="mt-3">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col items-center p-3 bg-gray-700 rounded-lg">
                            <span class="text-sm text-gray-300">Minim</span>
                            <div class="text-xl font-bold text-gray-100 mt-1">
                                ${stats.min.toFixed(param === 'radiation' ? 2 : 1)}
                            </div>
                            <span class="text-xs text-gray-600">${paramInfo.unit}</span>
                        </div>
                        <div class="flex flex-col items-center p-3 bg-gray-700 rounded-lg">
                            <span class="text-sm text-gray-300">Maxim</span>
                            <div class="text-xl font-bold text-gray-100 mt-1">
                                ${stats.max.toFixed(param === 'radiation' ? 2 : 1)}
                            </div>
                            <span class="text-xs text-gray-600">${paramInfo.unit}</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-center p-3 bg-gray-700 rounded-lg mt-4">
                        <span class="text-sm text-gray-300">Medie</span>
                        <div class="text-2xl font-bold text-gray-100 mt-1" style="color: ${paramInfo.color}">
                            ${stats.avg.toFixed(param === 'radiation' ? 2 : 1)}
                        </div>
                        <span class="text-xs text-gray-600">${paramInfo.unit}</span>
                    </div>
                </div>
            </div>
        `;
        
        statsCardsContainer.appendChild(card);
    });
}

// Funcție pentru crearea graficului de statistici cu stiluri Tailwind
function createStatsChart(statsData) {
    if (!statsData) return;
    
    const ctx = document.getElementById('stats-chart').getContext('2d');
    
    // Normalizare date pentru a permite compararea între parametri cu unități diferite
    const normalizeValue = (value, param) => {
        switch(param) {
            case 'temperature': return value / 50; // Temperatură, scară de aprox. 0-50°C
            case 'humidity': return value / 100; // Umiditate, scară de 0-100%
            case 'pressure': return (value - 950) / 100; // Presiune, scară de aprox. 950-1050 hPa
            case 'light': return value / 1000; // Lumină, scară de 0-1000 lux
            case 'radiation': return value / 0.5; // Radiație, scară de 0-0.5 µSv/h
            case 'wind_speed': return value / 20; // Viteză vânt, scară de 0-20 km/h
            default: return value;
        }
    };
    
    // Pregătire date pentru grafic
    const labels = ['Temperatură', 'Umiditate', 'Presiune', 'Lumină', 'Radiație', 'Viteză vânt'];
    const params = ['temperature', 'humidity', 'pressure', 'light', 'radiation', 'wind_speed'];
    
    const minValues = params.map(param => normalizeValue(statsData[param].min, param));
    const avgValues = params.map(param => normalizeValue(statsData[param].avg, param));
    const maxValues = params.map(param => normalizeValue(statsData[param].max, param));
    
    // Culorile adaptate pentru Tailwind
    const minColor = 'rgba(59, 130, 246, 0.7)'; // blue-500
    const avgColor = 'rgba(16, 185, 129, 0.7)'; // green-500
    const maxColor = 'rgba(239, 68, 68, 0.7)';  // red-500
    
    // Configurare date grafic
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Minim',
                data: minValues,
                backgroundColor: minColor,
                borderColor: minColor.replace('0.7', '1'),
                borderWidth: 1
            },
            {
                label: 'Medie',
                data: avgValues,
                backgroundColor: avgColor,
                borderColor: avgColor.replace('0.7', '1'),
                borderWidth: 1
            },
            {
                label: 'Maxim',
                data: maxValues,
                backgroundColor: maxColor,
                borderColor: maxColor.replace('0.7', '1'),
                borderWidth: 1
            }
        ]
    };
    
    // Configurare opțiuni grafic
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
                    usePointStyle: true,
                    padding: 15
                }
            },
            tooltip: {
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
                cornerRadius: 8,
                callbacks: {
                    label: function(context) {
                        const paramIndex = context.dataIndex;
                        const datasetIndex = context.datasetIndex;
                        
                        // Obținere valoare originală (nenormalizată)
                        const param = params[paramIndex];
                        const statType = ['min', 'avg', 'max'][datasetIndex];
                        const originalValue = statsData[param][statType];
                        const paramInfo = getParameterInfo(param);
                        
                        return `${context.dataset.label}: ${originalValue.toFixed(param === 'radiation' ? 2 : 1)} ${paramInfo.unit}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 1,
                grid: {
                    color: '#e5e7eb' // gray-200
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    },
                    callback: function(value) {
                        return (value * 100) + '%';
                    }
                },
                title: {
                    display: true,
                    text: 'Valoare normalizată (%)',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 13,
                        weight: 'medium'
                    }
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
                    }
                }
            }
        }
    };
    
    // Creare sau actualizare grafic
    if (window.statsChart) {
        window.statsChart.data = chartData;
        window.statsChart.options = chartOptions;
        window.statsChart.update();
    } else {
        window.statsChart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
    }
}
