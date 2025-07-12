# news_aggregator/core/db.py
# Модуль для функций работы с базой данных

import sqlite3
import json

DB_PATH = 'aggregators.db'

def create_tables():
    """Создаёт таблицы aggregator_sites и news, если их нет."""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            # aggregator_sites
            c.execute('''
                CREATE TABLE IF NOT EXISTS aggregator_sites (
                    id INTEGER PRIMARY KEY,
                    name TEXT UNIQUE,
                    url TEXT UNIQUE,
                    active INTEGER,
                    parsing_rules_json TEXT
                )
            ''')
            # news
            c.execute('''
                CREATE TABLE IF NOT EXISTS news (
                    id INTEGER PRIMARY KEY,
                    source_id INTEGER,
                    title TEXT NOT NULL,
                    link TEXT UNIQUE NOT NULL,
                    full_text TEXT,
                    publish_date TEXT,
                    published_vk INTEGER DEFAULT 0,
                    published_tg INTEGER DEFAULT 0,
                    FOREIGN KEY (source_id) REFERENCES aggregator_sites (id)
                )
            ''')
            conn.commit()
    except Exception as e:
        print(f"Ошибка создания таблиц: {e}")

def add_aggregator_site(name, url, active=1):
    """Добавляет новый сайт-агрегатор в БД."""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            c.execute('''
                INSERT OR IGNORE INTO aggregator_sites (name, url, active)
                VALUES (?, ?, ?)
            ''', (name, url, active))
            conn.commit()
    except Exception as e:
        print(f"Ошибка добавления сайта: {e}")

def get_news_list():
    """Возвращает список новостей для API"""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            c.execute('''
                SELECT id, title, link, publish_date, published_vk, published_tg 
                FROM news 
                ORDER BY id DESC 
                LIMIT 100
            ''')
            rows = c.fetchall()
            result = []
            for row in rows:
                result.append({
                    'id': row[0],
                    'title': row[1],
                    'link': row[2],
                    'publish_date': row[3],
                    'published_vk': bool(row[4]),
                    'published_tg': bool(row[5])
                })
            return result
    except Exception as e:
        print(f"Ошибка получения новостей: {e}")
        return [] 