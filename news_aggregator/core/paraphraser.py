# news_aggregator/core/paraphraser.py
# Модуль для функций рерайтинга текста

import os
import requests
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv(os.path.join(os.path.dirname(__file__), '../news_aggregator.env'))

def paraphrase_text(text, prompt=None):
    """Рерайтинг текста через DeepSeek API"""
    api_key = os.getenv('DEEPSEEK_API_KEY')
    url = 'https://api.deepseek.com/v1/chat/completions'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    if prompt is None:
        prompt = 'Перепиши этот текст своими словами, сохраняя смысл и структуру:\n\n'
    data = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "user", "content": f"{prompt}{text}"}
        ],
        "max_tokens": 1024,
        "temperature": 0.8
    }
    try:
        response = requests.post(url, headers=headers, json=data, timeout=20)
        response.raise_for_status()
        result = response.json()
        return result['choices'][0]['message']['content'].strip()
    except Exception as e:
        return f"[Ошибка DeepSeek: {e}]\n\n{text}" 