// History JavaScript
let historyData = [];
let historyChart = null;
let selectedParameter = 'temperature';

// Inițializare la încărcarea paginii
document.addEventListener('DOMContentLoaded', function() {
    // Inițializare datepicker-uri cu valorile implicite
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    
    document.getElementById('start-date').valueAsDate = oneWeekAgo;
    document.getElementById('end-date').valueAsDate = today;
    
    // Inițializare meniu mobil
    initMobileMenu();
    
    // Adăugare handler pentru formularul de filtrare
    document.getElementById('filter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        fetchHistoryData();
    });
    
    // Adăugare handler pentru exportul CSV
    document.getElementById('export-csv').addEventListener('click', function() {
        if (historyData.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            exportTableToCSV(historyData, `statie_meteo_date_${today}.csv`);
        } else {
            alert('Nu există date pentru export!');
        }
    });
    
    // Adăugare handler pentru schimbarea parametrului
    document.getElementById('parameter').addEventListener('change', function() {
        selectedParameter = this.value;
        updateHistoryChart();
    });
    
    // Setare an curent în footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Încărcare date inițiale
    fetchHistoryData();
});

// Funcție pentru obținerea datelor istorice
function fetchHistoryData() {
    // Obținere valori filtre
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const limit = document.getElementById('limit').value;
    
    // Construire URL cu parametri
    let url = `/api/data?limit=${limit}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    // Afișare indicator de încărcare
    document.getElementById('history-table-body').innerHTML = `
        <tr>
            <td colspan="8" class="px-6 py-10 text-center">
                <div class="flex justify-center items-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500 mr-3"></div>
                    <span class="text-gray-600">Se încarcă datele...</span>
                </div>
            </td>
        </tr>
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
            historyData = data;
            
            // Actualizare tabel și grafic
            updateHistoryTable();
            updateHistoryChart();
        })
        .catch(error => {
            console.error('Eroare la obținerea datelor istorice:', error);
            document.getElementById('history-table-body').innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-10 text-center">
                        <div class="text-red-500">
                            <i class="fa-solid fa-circle-exclamation mr-2"></i>
                            Eroare la obținerea datelor. Verificați conexiunea la server.
                        </div>
                    </td>
                </tr>
            `;
        });
}

// Funcție pentru actualizarea tabelului cu date istorice
function updateHistoryTable() {
    const tableBody = document.getElementById('history-table-body');
    
    if (historyData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-10 text-center text-gray-500">
                    <i class="fa-solid fa-inbox mr-2"></i>
                    Nu există date pentru perioada selectată
                </td>
            </tr>
        `;
        return;
    }
    
    // Construire rânduri tabel
    let tableRows = '';
    historyData.forEach(item => {
        tableRows += `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${formatDateTime(new Date(item.timestamp))}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.temperature !== undefined ? item.temperature.toFixed(1) + ' °C' : 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.humidity !== undefined ? item.humidity.toFixed(1) + ' %' : 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.pressure !== undefined ? item.pressure.toFixed(1) + ' hPa' : 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.light !== undefined ? item.light.toFixed(1) + ' lux' : 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.radiation !== undefined ? item.radiation.toFixed(2) + ' µSv/h' : 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.wind_speed !== undefined ? item.wind_speed.toFixed(1) + ' km/h' : 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.wind_direction !== undefined ? item.wind_direction.toFixed(0) + '°' : 'N/A'}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableRows;
}

// Funcție pentru actualizarea graficului
function updateHistoryChart() {
    if (historyData.length === 0) return;
    
    // Inversăm array-ul pentru a avea datele în ordine cronologică
    const chronologicalData = [...historyData].reverse();
    
    // Pregătire date pentru grafic
    const labels = chronologicalData.map(item => formatTime(new Date(item.timestamp)));
    const data = chronologicalData.map(item => item[selectedParameter]);
    
    // Obținere informații despre parametrul selectat
    const paramInfo = getParameterInfo(selectedParameter);
    
    // Configurare date grafic
    const chartData = {
        labels: labels,
        datasets: [{
            label: `${paramInfo.label} (${paramInfo.unit})`,
            data: data,
            borderColor: paramInfo.color,
            backgroundColor: `${paramInfo.color}33`,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5
        }]
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
                    }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#1f2937',
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
            y: {
                beginAtZero: false,
                grid: {
                    color: 'rgba(75, 85, 99, 0.3)' // gray-600 cu transparență
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    },
                    color: '#d1d5db' // gray-300
                },
                title: {
                    display: true,
                    text: `${paramInfo.label} (${paramInfo.unit})`,
                    font: {
                        family: "'Inter', sans-serif",
                        size: 13,
                        weight: 'medium'
                    },
                    color: '#e5e7eb' // gray-200
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
                    color: '#d1d5db', // gray-300
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        }
    };
    
    // Creare sau actualizare grafic
    const ctx = document.getElementById('history-chart').getContext('2d');
    
    if (historyChart) {
        historyChart.data = chartData;
        historyChart.options = chartOptions;
        historyChart.update();
    } else {
        historyChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: chartOptions
        });
    }
}

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

// Funcție pentru exportul datelor în format CSV
function exportTableToCSV(data, filename) {
    if (!data.length) return;
    
    // Definire coloane
    const columns = [
        { key: 'timestamp', label: 'Data si Ora' },
        { key: 'temperature', label: 'Temperatura (°C)' },
        { key: 'humidity', label: 'Umiditate (%)' },
        { key: 'pressure', label: 'Presiune (hPa)' },
        { key: 'light', label: 'Lumina (lux)' },
        { key: 'radiation', label: 'Radiatie (µSv/h)' },
        { key: 'wind_speed', label: 'Viteza Vant (km/h)' },
        { key: 'wind_direction', label: 'Directie Vant (°)' }
    ];
    
    // Creare header CSV
    let csvContent = columns.map(col => col.label).join(',') + '\n';
    
    // Adaugare rânduri
    data.forEach(item => {
        const row = columns.map(column => {
            let value = item[column.key];
            
            // Formatare timestamp
            if (column.key === 'timestamp') {
                value = formatDateTime(new Date(value));
            }
            // Formatare numere cu zecimale
            else if (typeof value === 'number') {
                value = column.key === 'radiation' ? value.toFixed(2) : value.toFixed(1);
            }
            
            // Asigurare ca valorile ce conțin virgule sunt încadrate în ghilimele
            return `"${value}"`;
        }).join(',');
        
        csvContent += row + '\n';
    });
    
    // Creare blob și descărcare
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) { // Pentru IE
        navigator.msSaveBlob(blob, filename);
    } else {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
