import os
from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup
import spacy
from openai import OpenAI
from flask_cors import CORS

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)
CORS(app)
nlp = spacy.load("en_core_web_sm")

def fetch_website_content(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.text
    else:
        return None

def extract_text_from_html(html):
    soup = BeautifulSoup(html, 'html.parser')
    return soup.get_text()

def extract_keywords(text):
    doc = nlp(text)
    keywords = [chunk.text for chunk in doc.noun_chunks]
    return list(set(keywords))  # Remove duplicates

def generate_marketing_sentences(prompt, max_length):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a marketing expert. Generate a concise marketing sentence."},
                {"role": "user", "content": f"{prompt} in approximately {max_length} characters."}
            ],
            max_tokens=max_length // 4,  # Adjust as needed
            n=1,
            stop=None,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating marketing sentence: {str(e)}")
        return f"Error: Unable to generate {max_length}-character marketing sentence"

@app.route('/scan', methods=['POST'])
def scan():
    data = request.json
    url = data.get('url')
    html_content = fetch_website_content(url)
    if html_content:
        text_content = extract_text_from_html(html_content)
        keywords = extract_keywords(text_content)
        prompt = f"Create marketing sentences for a website about: {', '.join(keywords[:5])}"
        sentence_30 = generate_marketing_sentences(prompt, 30)
        sentence_60 = generate_marketing_sentences(prompt, 60)
        sentence_90 = generate_marketing_sentences(prompt, 90)
        return jsonify({
            "keywords": keywords[:10],  # Limit to top 10 keywords
            "sentence30": sentence_30,
            "sentence60": sentence_60,
            "sentence90": sentence_90
        })
    else:
        return jsonify({"error": "Unable to fetch the website content"}), 400

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    keywords = data.get('keywords', [])
    length = data.get('length', 60)
    prompt = f"Create a marketing sentence about: {', '.join(keywords[:5])}"
    sentence = generate_marketing_sentences(prompt, length)
    return jsonify({"sentence": sentence})

if __name__ == '__main__':
    app.run(debug=True)
