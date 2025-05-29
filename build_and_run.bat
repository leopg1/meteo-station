@echo off
echo ===== Construirea si Rularea Aplicatiei Statie Meteo =====
echo.

echo Step 1: Construirea aplicatiei React...
cd client
call npm run build
cd ..

echo.
echo Step 2: Pornirea serverului Flask...
echo.
echo Aplicatia va fi disponibila la adresa: http://localhost:5000
echo.
python app.py
