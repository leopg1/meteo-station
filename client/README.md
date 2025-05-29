# Stație Meteo - Frontend React Modern

Aceasta este versiunea modernizată a interfeței pentru aplicația Stație Meteo, folosind React, Chakra UI, și alte librării moderne pentru un frontend profesional.

## Tehnologii utilizate

- **React** - Bibliotecă UI pentru construirea interfeței utilizator
- **Chakra UI** - Sistem de design pentru componente accesibile și moderne
- **React Query** - Gestionarea stării și caching pentru date API
- **React Router** - Rutare pentru aplicație
- **Chart.js cu react-chartjs-2** - Grafice interactive
- **Framer Motion** - Animații și tranziții
- **date-fns** - Manipulare date și ore
- **Vite** - Build tool rapid pentru dezvoltare

## Structura proiectului

```
client/
├── public/          # Fișiere statice
├── src/             # Codul sursă
│   ├── api/         # Servicii pentru comunicare cu API-ul
│   ├── components/  # Componente React reutilizabile
│   ├── context/     # Context API pentru state management
│   ├── hooks/       # Hooks personalizate
│   ├── pages/       # Paginile aplicației
│   ├── utils/       # Utilități și funcții helper
│   ├── App.jsx      # Componenta principală
│   ├── main.jsx     # Punctul de intrare
│   └── theme.js     # Tema Chakra UI personalizată
└── package.json     # Dependențele și scripturile proiectului
```

## Instalare

1. Asigură-te că ai Node.js instalat (v14 sau mai nou)
2. Deschide un terminal în directorul `client`
3. Rulează comanda de instalare:

```bash
npm install
```

## Rulare în modul dezvoltare

```bash
npm start
```

Aplicația va fi disponibilă la adresa: http://localhost:5173

## Build pentru producție

```bash
npm run build
```

Fișierele optimizate pentru producție vor fi generate în directorul `dist/`.

## Conectarea cu backend-ul

Aplicația este configurată să comunice cu API-ul Flask existent care rulează pe http://localhost:5000. Toate cererile API sunt făcute la rute relative care sunt proxied către serverul Flask.

## Funcționalități

- **Dashboard** - Vizualizare în timp real a datelor de la senzori
- **Istoric Date** - Filtrare și export al istoricului de măsurători
- **Statistici** - Calcule statistice și vizualizări comparative

## Extindere

Pentru a adăuga noi funcționalități:

1. Creează componente noi în directorul `components/`
2. Adaugă noi pagini în directorul `pages/`
3. Extinde serviciile API în directorul `api/`
4. Personalizează tema în fișierul `theme.js`
