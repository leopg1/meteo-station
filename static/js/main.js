// Funcții comune pentru toate paginile

// Setare an curent în footer
document.addEventListener('DOMContentLoaded', function() {
    const currentYearElements = document.querySelectorAll('#current-year');
    const currentYear = new Date().getFullYear();
    
    currentYearElements.forEach(element => {
        element.textContent = currentYear;
    });

    // Setare active class pe link-ul curent din sidebar
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// Funcție utilă pentru formatarea datei și orei
function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('ro-RO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Funcție utilă pentru formatarea doar a orei
function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('ro-RO', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Funcție pentru obținerea etichetei și unității de măsură pentru un parametru
function getParameterInfo(param) {
    switch(param) {
        case 'temperature': 
            return { label: 'Temperatură', unit: '°C', icon: 'fa-thermometer-half', color: '#FF5555' }; 
        case 'humidity': 
            return { label: 'Umiditate', unit: '%', icon: 'fa-tint', color: '#5DADE2' }; 
        case 'pressure': 
            return { label: 'Presiune', unit: 'hPa', icon: 'fa-compress-alt', color: '#C39BD3' }; 
        case 'light': 
            return { label: 'Lumină', unit: 'lux', icon: 'fa-sun', color: '#FFD700' }; 
        case 'radiation': 
            return { label: 'Radiație', unit: 'µSv/h', icon: 'fa-radiation', color: '#FFA500' }; 
        case 'wind_speed': 
            return { label: 'Viteză vânt', unit: 'km/h', icon: 'fa-wind', color: '#4ECDC4' }; 
        case 'wind_direction': 
            return { label: 'Direcție vânt', unit: '°', icon: 'fa-compass', color: '#7FB3D5' }; 
        default: 
            return { label: param, unit: '', icon: 'fa-question', color: '#BDC3C7' }; 
    }
}

// Funcție pentru determinarea direcției vântului ca text
function getWindDirectionText(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SV', 'V', 'NV'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

// Funcție pentru exportul datelor ca CSV
function exportTableToCSV(data, filename) {
    // Definire headere
    const headers = [
        'Data și ora', 
        'Temperatură (°C)', 
        'Umiditate (%)', 
        'Presiune (hPa)', 
        'Lumină (lux)', 
        'Radiație (µW/cm²)', 
        'Viteză vânt (m/s)', 
        'Direcție vânt (°)'
    ];
    
    // Creare linii CSV
    const csvContent = data.map(item => {
        return [
            formatDateTime(item.timestamp),
            item.temperature.toFixed(1),
            item.humidity.toFixed(1),
            item.pressure.toFixed(1),
            item.light.toFixed(1),
            item.radiation.toFixed(2),
            item.wind_speed.toFixed(1),
            item.wind_direction.toFixed(0)
        ].join(',');
    });
    
    // Adăugare headere și combinare linii
    const csv = [headers.join(','), ...csvContent].join('\n');
    
    // Creare și descărcare fișier
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
