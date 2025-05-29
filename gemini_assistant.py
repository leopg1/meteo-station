from flask import Flask, request, jsonify
import json
import os
import google.generativeai as genai
from datetime import datetime
from flask_cors import CORS

# Definim serviciul pentru asistentul Gemini
app = Flask(__name__)
CORS(app)  # Pentru a permite cereri cross-origin

# Configurare Gemini API
GEMINI_API_KEY = "AIzaSyBPi493826QJTnD2RNLZgljejDowk57FOg"
genai.configure(api_key=GEMINI_API_KEY)

# Definim modelul
model = genai.GenerativeModel('gemini-pro')

@app.route('/api/assistant', methods=['POST'])
def query_assistant():
    """Endpoint pentru comunicarea cu asistentul Gemini"""
    try:
        data = request.json
        messages = data.get('messages', [])
        context = data.get('context', '')
        
        # Construim prompt-ul pentru Gemini
        system_prompt = f"""Ești un asistent meteorologic profesionist care oferă informații și explicații despre datele meteorologice. 
        Iată datele meteo actuale pe care le poți folosi în răspunsurile tale:
        
        {context}
        
        Răspunde întotdeauna cu informații relevante și precise despre vreme. 
        Fii concis, clar și util în răspunsurile tale.
        Dacă ești întrebat despre ceva ce nu are legătură cu meteorologia, 
        încearcă să aduci conversația înapoi la datele meteo."""
        
        # Construim conversația pentru Gemini
        # Prima, adăugăm prompt-ul de sistem
        conversation_history = [system_prompt]
        
        # Apoi adăugăm mesajele utilizatorului și ale asistentului
        for msg in messages:
            if msg['role'] == 'user':
                conversation_history.append(f"Utilizator: {msg['content']}")
            elif msg['role'] == 'assistant':
                conversation_history.append(f"Asistent: {msg['content']}")
        
        # Construim prompt-ul final
        prompt = "\n".join(conversation_history)
        
        # Obținem răspunsul de la Gemini
        response = model.generate_content(prompt)
        
        # Extragem textul răspunsului
        response_text = response.text
        
        # Dacă răspunsul începe cu "Asistent:", îl eliminăm
        if response_text.startswith("Asistent:"):
            response_text = response_text[len("Asistent:"):].strip()
        
        return jsonify({"response": response_text})
        
    except Exception as e:
        print(f"Eroare la procesarea cererii: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
