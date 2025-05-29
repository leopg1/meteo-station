from flask import Flask, request, jsonify
import json
import os
import requests
from datetime import datetime
from flask_cors import CORS

# Definim o rută separată pentru asistentul AI
app = Flask(__name__)
CORS(app)  # Pentru a permite cereri cross-origin

# Cheia API pentru OpenAI (preluată din variabila furnizată)
OPENAI_API_KEY = ""

@app.route('/api/assistant', methods=['POST'])
def query_assistant():
    """Endpoint pentru comunicarea cu asistentul OpenAI"""
    try:
        data = request.json
        messages = data.get('messages', [])
        context = data.get('context', '')
        
        # Adăugăm un sistem de prompt pentru a defini comportamentul asistentului meteo
        system_prompt = {
            "role": "system", 
            "content": f"""Ești un asistent specializat pentru o stație meteo. 
            Rolul tău este să oferi informații utile și explicații despre datele meteorologice.
            Iată datele meteo actuale pe care le poți folosi în răspunsurile tale:
            
            {context}
            
            Răspunde întotdeauna cu informații relevante și precise despre vreme. 
            Dacă ești întrebat despre ceva ce nu are legătură cu meteorologia, 
            încearcă să aduci conversația înapoi la datele meteo.
            Oferă explicații clare și accesibile, fără a fi prea tehnic sau științific."""
        }
        
        # Pregătim mesajele pentru API
        api_messages = [system_prompt] + messages
        
        # Cerem completare de la OpenAI
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENAI_API_KEY}"
            },
            json={
                "model": "gpt-4o-mini",
                "messages": api_messages,
                "temperature": 0.7,
                "max_tokens": 500
            }
        )
        
        # Verificăm răspunsul
        if response.status_code != 200:
            print(f"Eroare OpenAI: {response.text}")
            return jsonify({"error": "Nu s-a putut obține răspunsul de la OpenAI"}), 500
        
        # Extragem răspunsul
        result = response.json()
        assistant_response = result["choices"][0]["message"]["content"]
        
        return jsonify({"response": assistant_response})
        
    except Exception as e:
        print(f"Eroare la procesarea cererii: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
