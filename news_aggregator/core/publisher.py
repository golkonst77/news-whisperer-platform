# news_aggregator/core/publisher.py
# Модуль для функций публикации новостей

import os
import requests
import sqlite3
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

VK_ACCESS_TOKEN = os.getenv('VK_ACCESS_TOKEN')
VK_OWNER_ID = os.getenv('VK_OWNER_ID')
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHANNEL_ID = os.getenv('TELEGRAM_CHANNEL_ID')

DB_PATH = 'aggregators.db'

def post_to_vk(news_item, news_id):
    """Публикует новость в VK"""
    try:
        if not VK_ACCESS_TOKEN or not VK_OWNER_ID:
            print("[ERROR] Не настроены VK токены в .env файле")
            return False
        
        # Формируем сообщение
        message = f"{news_item['title']}\n\n{news_item['full_text'][:2000]}..."
        if len(news_item['full_text']) > 2000:
            message += f"\n\nЧитать полностью: {news_item['link']}"
        
        # Публикуем в VK
        url = 'https://api.vk.com/method/wall.post'
        data = {
            'owner_id': VK_OWNER_ID,
            'message': message,
            'access_token': VK_ACCESS_TOKEN,
            'v': '5.131'
        }
        
        response = requests.post(url, data=data, timeout=10)
        result = response.json()
        
        if 'response' in result:
            print(f"[OK] Новость опубликована в VK (post_id: {result['response']['post_id']})")
            # Обновляем статус в БД
            update_news_status(news_id, 'vk', True)
            return True
        else:
            print(f"[ERROR] Ошибка публикации в VK: {result}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Ошибка публикации в VK: {e}")
        return False

def post_to_telegram(news_item):
    """Публикует новость в Telegram"""
    try:
        if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHANNEL_ID:
            print("[ERROR] Не настроены Telegram токены в .env файле")
            return False
        
        # Формируем сообщение
        message = f"{news_item['title']}\n\n{news_item['full_text'][:3000]}..."
        if len(news_item['full_text']) > 3000:
            message += f"\n\nЧитать полностью: {news_item['link']}"
        
        # Публикуем в Telegram
        url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
        data = {
            'chat_id': TELEGRAM_CHANNEL_ID,
            'text': message,
            'parse_mode': 'HTML'
        }
        
        response = requests.post(url, data=data, timeout=10)
        result = response.json()
        
        if result.get('ok'):
            print(f"[OK] Новость опубликована в Telegram")
            return True
        else:
            print(f"[ERROR] Ошибка публикации в Telegram: {result}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Ошибка публикации в Telegram: {e}")
        return False

def update_news_status(news_id, platform, status):
    """Обновляет статус публикации новости"""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            if platform == 'vk':
                c.execute('UPDATE news SET published_vk = ? WHERE id = ?', (status, news_id))
            elif platform == 'tg':
                c.execute('UPDATE news SET published_tg = ? WHERE id = ?', (status, news_id))
            conn.commit()
    except Exception as e:
        print(f"[ERROR] Ошибка обновления статуса: {e}")

def publish_news(news_id, publish_vk=True, publish_tg=True):
    """Публикует новость в выбранные платформы"""
    try:
        # Получаем данные новости
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            c.execute('SELECT title, full_text, link FROM news WHERE id = ?', (news_id,))
            row = c.fetchone()
            if not row:
                return {"error": "Новость не найдена"}
            
            news_item = {
                'title': row[0],
                'full_text': row[1],
                'link': row[2]
            }
        
        results = {}
        
        if publish_vk:
            results['vk'] = post_to_vk(news_item, news_id)
        
        if publish_tg:
            results['telegram'] = post_to_telegram(news_item)
        
        return {"status": "ok", "results": results}
        
    except Exception as e:
        return {"error": f"Ошибка публикации: {e}"} 