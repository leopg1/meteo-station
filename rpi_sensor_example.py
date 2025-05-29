#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script exemplu pentru Raspberry Pi care simulează citirea senzorilor și
trimite datele către API-ul aplicației web.

În implementarea reală, aceste date ar fi citite de la senzorii fizici conectați la RPi4.
"""

import requests
import time
import random
import json
from datetime import datetime

# URL-ul API-ului - în cazul real, acesta ar fi adresa IP sau domeniul serverului
API_URL = "http://localhost:5000/api/data"

# Funcție pentru simularea citirii datelor de la senzori
def read_sensor_data():
    """
    Simulează citirea datelor de la senzori.
    În realitate, aici ar fi codul pentru citirea valorilor reale de la senzorii fizici.
    """
    # Simulăm valorile pentru senzori
    data = {
        "temperature": random.uniform(15.0, 30.0),  # Temperatură între 15°C și 30°C
        "humidity": random.uniform(30.0, 80.0),     # Umiditate între 30% și 80%
        "pressure": random.uniform(995.0, 1025.0),  # Presiune între 995 hPa și 1025 hPa
        "light": random.uniform(100.0, 1000.0),     # Intensitate luminoasă între 100 și 1000 lux
        "radiation": random.uniform(0.01, 0.5),     # Radiație UV între 0.01 și 0.5 µW/cm²
        "wind_speed": random.uniform(0.0, 15.0),    # Viteza vântului între 0 și 15 m/s
        "wind_direction": random.uniform(0.0, 359.9)  # Direcția vântului între 0° și 359.9°
    }
    
    return data

# Funcție pentru trimiterea datelor către API
def send_data_to_api(data):
    """
    Trimite datele către API-ul aplicației web folosind HTTP POST.
    
    Args:
        data (dict): Dicționar cu datele de la senzori
    
    Returns:
        bool: True dacă datele au fost trimise cu succes, False în caz contrar
    """
    try:
        headers = {
            'Content-Type': 'application/json'
        }
        
        # Convertim datele în format JSON
        json_data = json.dumps(data)
        
        # Trimitem datele către API
        response = requests.post(API_URL, headers=headers, data=json_data)
        
        # Verificăm dacă cererea a fost procesată cu succes
        if response.status_code == 201:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Date trimise cu succes: {data}")
            return True
        else:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Eroare la trimiterea datelor. Cod: {response.status_code}, Răspuns: {response.text}")
            return False
            
    except Exception as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Excepție la trimiterea datelor: {str(e)}")
        return False

def main():
    """Funcția principală care rulează la infinit, citind și trimițând date"""
    print("Începere trimitere date de la senzori către API...")
    print(f"URL API: {API_URL}")
    print("Apăsați CTRL+C pentru a opri.")
    
    # Interval de trimitere date (în secunde)
    interval = 60
    
    try:
        while True:
            # Citim datele de la senzori (simulate în acest exemplu)
            sensor_data = read_sensor_data()
            
            # Trimitem datele către API
            send_data_to_api(sensor_data)
            
            # Așteptăm până la următoarea citire
            print(f"Așteptare {interval} secunde până la următoarea citire...")
            time.sleep(interval)
            
    except KeyboardInterrupt:
        print("\nOprire script...")
    except Exception as e:
        print(f"Eroare neașteptată: {str(e)}")

if __name__ == "__main__":
    main()
