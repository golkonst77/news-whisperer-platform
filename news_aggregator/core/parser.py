# news_aggregator/core/parser.py
# Модуль для функций парсинга новостей

import requests
from bs4 import BeautifulSoup
import sqlite3
from datetime import datetime
from newspaper import Article
import json
import os

DB_PATH = 'aggregators.db'

def get_active_aggregator_sites():
    """Возвращает список всех активных сайтов-агрегаторов."""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            c.execute('''
                SELECT id, name, url, parsing_rules_json FROM aggregator_sites WHERE active=1
            ''')
            rows = c.fetchall()
            result = []
            for row in rows:
                result.append({
                    'id': row[0],
                    'name': row[1],
                    'url': row[2],
                    'parsing_rules': json.loads(row[3]) if row[3] else {}
                })
            return result
    except Exception as e:
        print(f"Ошибка получения сайтов: {e}")
        return []

def get_full_article_details(article_link, parsing_rules=None):
    """
    Получает полный текст, заголовок и дату публикации новости по ссылке с помощью newspaper3k.
    Возвращает словарь с ключами 'title', 'full_text' и 'publish_date'.
    """
    try:
        article = Article(article_link, language='ru')
        article.download()
        article.parse()
        full_text = article.text
        title = article.title
        publish_date = None
        if article.publish_date:
            try:
                if hasattr(article.publish_date, 'strftime'):
                    publish_date = article.publish_date.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    publish_date = str(article.publish_date)
            except Exception:
                publish_date = str(article.publish_date)
        return {'title': title, 'full_text': full_text, 'publish_date': publish_date}
    except Exception as e:
        print(f"[ERROR] newspaper3k не смог распарсить статью {article_link}: {e}")
        return {'title': None, 'full_text': None, 'publish_date': None}

def get_full_article_details_readability(article_link):
    """
    Альтернативный парсер: извлекает основной текст и заголовок через readability-lxml.
    Возвращает словарь с ключами 'title', 'full_text', 'publish_date'.
    Если модуль не установлен — сообщает об этом в консоль и возвращает None.
    """
    try:
        try:
            import requests
            from readability import Document
            from bs4 import BeautifulSoup, Tag
        except ImportError as e:
            print("[ERROR] Модуль readability-lxml не установлен! Установите командой: pip install readability-lxml")
            return {'title': None, 'full_text': None, 'publish_date': None, 'error': 'no_readability'}
        resp = requests.get(article_link, timeout=10)
        html = resp.text
        doc = Document(html)
        title = doc.title()
        summary_html = doc.summary()
        # Преобразуем HTML в чистый текст
        soup = BeautifulSoup(summary_html, 'html.parser')
        full_text = soup.get_text(separator=' ', strip=True)
        # Пытаемся найти дату публикации (по мета-тегам)
        publish_date = None
        soup_full = BeautifulSoup(html, 'html.parser')
        for meta in soup_full.find_all('meta'):
            if not isinstance(meta, Tag):
                continue
            if meta.get('property') in ('article:published_time', 'og:published_time', 'date') or meta.get('name') in ('pubdate', 'publishdate', 'date', 'DC.date.issued'):
                publish_date = meta.get('content')
                break
        return {'title': title, 'full_text': full_text, 'publish_date': publish_date}
    except Exception as e:
        print(f"[ERROR] readability-lxml не смог распарсить статью {article_link}: {e}")
        return {'title': None, 'full_text': None, 'publish_date': None}

def parse_news(parser_method='newspaper3k'):
    """Основная функция парсинга новостей"""
    # Импортируем функцию из main.py
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    from main import parse_news as main_parse_news
    return main_parse_news(parser_method) 