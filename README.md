# Aplicație Stație Meteo

Aplicație web pentru monitorizarea și vizualizarea datelor de la o stație meteo bazată pe Raspberry Pi 4.

## Componente

- **Backend**: API Flask pentru primirea și servirea datelor
- **Frontend**: Interfață React cu vizualizări interactive
- **Baza de date**: SQLite pentru stocarea datelor

## Instalare și rulare

### Cerințe preliminare
- Python 3.8+
- Node.js 14+
- npm 6+

### Instalare backend (Flask)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Rulare backend

```bash
cd backend
venv\Scripts\activate
python app.py
```

Serverul va rula pe `http://localhost:5000`

### Instalare frontend (React)

```bash
cd frontend
npm install
```

### Rulare frontend

```bash
cd frontend
npm start
```

Aplicația va rula pe `http://localhost:3000`

## API Endpoints

- `POST /api/data`: Primire date de la senzori
- `GET /api/data`: Obținere istoric date
- `GET /api/data/current`: Obținere date curente
- `GET /api/stats`: Obținere statistici

## Senzori suportați

- Temperatură și umiditate
- Presiune barometrică
- Lumină și radiație
- Viteză vânt (encoder optic)
- Direcție vânt (potențiometru rotativ)
