"""
news_aggregator: Автоматический сбор и публикация новостей
"""

# === Конфигурация ===
# Для безопасности все секреты и важные параметры хранятся во внешнем файле .env
# Никогда не храните токены и пароли прямо в коде!
# Используйте библиотеку python-dotenv для загрузки переменных окружения
from dotenv import load_dotenv
import os

# Явно указываем путь к env-файлу
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

VK_ACCESS_TOKEN = os.getenv('VK_ACCESS_TOKEN')
VK_OWNER_ID = os.getenv('VK_OWNER_ID')  # Добавьте в .env, например: -123456789
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHANNEL_ID = os.getenv('TELEGRAM_CHANNEL_ID')
TARGET_WEBSITE_URL = os.getenv('TARGET_WEBSITE_URL')

# === Импорты ===
import requests
from bs4 import BeautifulSoup
import sqlite3
import json
from datetime import datetime
from newspaper import Article

DB_PATH = 'aggregators.db'

# === Парсинг ===
# Здесь будут функции для парсинга новостей с сайтов

# === Обработка данных ===
# Здесь будут функции для обработки и фильтрации новостей

# === Публикация в ВК ===
# Здесь будет логика публикации новостей во ВКонтакте

# === Публикация в Telegram ===
# Здесь будет логика публикации новостей в Telegram

# === Планирование ===
# Здесь будет логика для планирования и автоматизации запуска парсинга и публикаций

# === Работа с базой данных ===
def init_db():
    """Создаёт таблицу aggregator_sites, если она не существует."""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            c.execute('''
                CREATE TABLE IF NOT EXISTS aggregator_sites (
                    id INTEGER PRIMARY KEY,
                    name TEXT UNIQUE,
                    url TEXT UNIQUE,
                    active INTEGER,
                    parsing_rules_json TEXT
                )
            ''')
            conn.commit()
    except Exception as e:
        print(f"Ошибка инициализации БД: {e}")


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
                publish_date = article.publish_date.strftime('%Y-%m-%d %H:%M:%S')
            except Exception:
                publish_date = str(article.publish_date)
        return {'title': title, 'full_text': full_text, 'publish_date': publish_date}
    except Exception as e:
        print(f"[ERROR] newspaper3k не смог распарсить статью {article_link}: {e}")
        return {'title': None, 'full_text': None, 'publish_date': None}

# === Альтернативный парсер на основе readability-lxml ===
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

EXCLUDE_KEYWORDS = [
    'agreement', 'policy', 'contact', 'about', 'privacy', 'terms', 'user',
    'соглашение', 'контакт', 'о компании', 'правила', 'условия',
    'персональных данных', 'лицензия', 'лицензионное', 'согласие',
    'программа лояльности', 'лояльность', 'бонус', 'акция', 'скидка', 'промокод', 'условия участия'
]

def is_news_url(url, title):
    url = url.lower()
    title = (title or '').lower()
    for word in EXCLUDE_KEYWORDS:
        if word in url or word in title:
            return False
    return True

# === Создание таблиц ===
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
                    parsed_at TEXT NOT NULL DEFAULT (datetime('now')),
                    published_vk INTEGER DEFAULT 0,
                    published_tg INTEGER DEFAULT 0,
                    FOREIGN KEY(source_id) REFERENCES aggregator_sites(id)
                )
            ''')
            conn.commit()
    except Exception as e:
        print(f"[ERROR] Ошибка создания таблиц: {e}")

def create_aggregator_sites_table():
    import sqlite3
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS aggregator_sites (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE,
                url TEXT UNIQUE,
                active INTEGER
            )
        ''')
        conn.commit()

# === Сохранение новости с проверкой на дубликаты ===
def save_news_item(news_item):
    """
    Сохраняет новость в БД, если такой заголовок и дата ещё не встречались. Возвращает True/ID если добавлено, False если дубликат.
    news_item: dict с ключами source_id, title, link, full_text, publish_date
    """
    try:
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            # Проверка на дубликат по заголовку и дате публикации
            c.execute('SELECT id FROM news WHERE title = ? AND publish_date = ?', (news_item['title'], news_item.get('publish_date')))
            if c.fetchone():
                print(f"[INFO] Дубликат по заголовку и дате, не добавлено: {news_item['title']} | {news_item.get('publish_date')}")
                return False
            c.execute('''
                INSERT OR IGNORE INTO news (source_id, title, link, full_text, publish_date, parsed_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                news_item['source_id'],
                news_item['title'],
                news_item['link'],
                news_item.get('full_text'),
                news_item.get('publish_date'),
                datetime.now().isoformat(sep=' ', timespec='seconds')
            ))
            conn.commit()
            if c.rowcount == 0:
                print(f"[INFO] Дубликат новости, не добавлено: {news_item['link']}")
                return False
            else:
                print(f"[OK] Новость добавлена: {news_item['title']} ({news_item['link']})")
                return True
    except sqlite3.IntegrityError:
        print(f"[INFO] Дубликат (IntegrityError), не добавлено: {news_item['link']}")
        return False
    except Exception as e:
        print(f"[ERROR] Ошибка при сохранении новости: {e}")
        return False

# === Базовый парсинг новостей (расширенный) ===
def parse_news():
    """
    Универсальный парсер: для каждого сайта-агрегатора ищет все уникальные ссылки на статьи и парсит их через newspaper3k.
    """
    import urllib.parse
    news = []
    sites = get_active_aggregator_sites()
    for site in sites:
        url = site['url']
        source_id = site['id']
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code != 200:
                print(f"[WARN] Не удалось получить {url}: {resp.status_code}")
                continue
            soup = BeautifulSoup(resp.text, 'html.parser')
            base_url = urllib.parse.urlparse(url)
            found_links = set()
            for a in soup.find_all('a', href=True):
                href = a['href']
                if isinstance(href, list):
                    href = href[0]
                link = urllib.parse.urljoin(url, href)
                parsed_link = urllib.parse.urlparse(link)
                if parsed_link.netloc == base_url.netloc and link not in found_links:
                    found_links.add(link)
            print(f"[DEBUG] Найдено {len(found_links)} уникальных ссылок на {url}")
            # --- Новое: собираем все новости, сортируем по дате, берём только 10 ---
            news_candidates = []
            for link in found_links:
                details = get_full_article_details(link)
                # Фильтрация не-новостей по ключевым словам
                if not is_news_url(link, details.get('title', '')):
                    continue
                full_text = details.get('full_text')
                if full_text and full_text.strip():
                    text_len = len(full_text.replace('\n','').replace('\r','').strip())
                    if 250 <= text_len <= 1000:
                        news_item = {
                            'source_id': source_id,
                            'source_name': site['name'],
                            'source_url': url,
                            'title': details.get('title', link),
                            'link': link,
                            'full_text': full_text,
                            'publish_date': details.get('publish_date')
                        }
                        news_candidates.append(news_item)
            # Сортируем по дате публикации (если есть), иначе по порядку
            def parse_date(item):
                from datetime import datetime
                d = item.get('publish_date')
                if d:
                    try:
                        return datetime.fromisoformat(d)
                    except Exception:
                        return datetime.min
                return datetime.min
            news_candidates.sort(key=parse_date, reverse=True)
            for news_item in news_candidates[:5]:
                added = save_news_item(news_item)
                if added:
                    news.append(news_item)
        except Exception as e:
            print(f"[ERROR] Ошибка парсинга {url}: {e}")
    return news

# === Обновление статуса публикации ===
def update_news_status(news_id, platform, status):
    """
    Обновляет статус публикации новости в БД для указанной платформы ('vk' или 'tg').
    """
    field = None
    if platform == 'vk':
        field = 'published_vk'
    elif platform == 'tg':
        field = 'published_tg'
    else:
        print(f"[ERROR] Неизвестная платформа для обновления статуса: {platform}")
        return False
    try:
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            c.execute(f"UPDATE news SET {field} = ? WHERE id = ?", (status, news_id))
            conn.commit()
        print(f"[OK] Статус публикации обновлён для новости {news_id} ({platform}={status})")
        return True
    except Exception as e:
        print(f"[ERROR] Не удалось обновить статус публикации: {e}")
        return False

# === Публикация во ВКонтакте ===
def post_to_vk(news_item, news_id):
    """
    Публикует новость во ВКонтакте через VK API. После успешной публикации обновляет статус в БД.
    news_item: dict с ключами title, link, full_text, publish_date
    news_id: id новости в БД
    """
    if not VK_ACCESS_TOKEN or not VK_OWNER_ID:
        print("[ERROR] VK_ACCESS_TOKEN или VK_OWNER_ID не заданы в .env!")
        return False
    # Проверка длины текста перед публикацией (без переносов строк)
    full_text = news_item.get('full_text', '').strip()
    text_len = len(full_text.replace('\n','').replace('\r',''))
    if text_len < 250:
        print(f"[ERROR] Длина текста новости {text_len} символов — публикация отменена (допустимо 250-1000)")
        return False
    # Обрезаем длинные новости и добавляем ссылку
    if text_len > 1000:
        short_text = full_text.replace('\n','').replace('\r','')[:1000].rstrip() + '...'
        short_text += '\nПодробнее: https://prostoburo.com'
    else:
        short_text = full_text
    api_url = 'https://api.vk.com/method/wall.post'
    # Формируем сообщение
    message = f"Новая статья по бухгалтерским услугам: {news_item['title']}\n"
    if news_item.get('publish_date'):
        message += f"Дата публикации: {news_item['publish_date']}\n"
    if short_text:
        message += f"\n{short_text}\n"
    params = {
        'owner_id': VK_OWNER_ID,
        'from_group': 1,
        'message': message,
        'access_token': VK_ACCESS_TOKEN,
        'v': '5.199'
    }
    try:
        resp = requests.post(api_url, params=params, timeout=10)
        print(f"[VK DEBUG] Статус-код: {resp.status_code}")
        print(f"[VK DEBUG] Ответ VK API (raw): {resp.text}")
        if not resp.text.strip():
            print("[ERROR] Пустой ответ от VK API!")
            return False
        data = resp.json()
        if 'error' in data:
            print(f"[ERROR] VK API error: {data['error']}")
            return False
        post_id = data.get('response', {}).get('post_id')
        if post_id:
            print(f"[OK] Новость опубликована в VK (post_id={post_id})")
            update_news_status(news_id, 'vk', 1)
            return True
        else:
            print(f"[ERROR] Не удалось получить post_id из ответа VK: {data}")
            return False
    except Exception as e:
        print(f"[ERROR] Ошибка публикации в VK: {e}")
        return False

def post_to_telegram(news_item):
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    channel_id = os.getenv('TELEGRAM_CHANNEL_ID')
    if not token or not channel_id:
        print("[ERROR] TELEGRAM_BOT_TOKEN или TELEGRAM_CHANNEL_ID не заданы!")
        return False
    message = f"<b>{news_item['title']}</b>\n\n{news_item['full_text']}"
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = {
        "chat_id": channel_id,
        "text": message,
        "parse_mode": "HTML"
    }
    try:
        resp = requests.post(url, data=data, timeout=10)
        print(f"[TG DEBUG] Ответ Telegram API: {resp.text}")
        if resp.status_code == 200:
            print("[OK] Новость опубликована в Telegram")
            return True
        else:
            print(f"[ERROR] Telegram API error: {resp.text}")
            return False
    except Exception as e:
        print(f"[ERROR] Ошибка публикации в Telegram: {e}")
        return False

if __name__ == "__main__":
    # Проверяем, что переменные окружения загружены (убрано для предотвращения ошибки)
    # print(f"VK_ACCESS_TOKEN: {VK_ACCESS_TOKEN[:5]}... (скрыто)")
    # print(f"TELEGRAM_BOT_TOKEN: {TELEGRAM_BOT_TOKEN[:5]}... (скрыто)")
    # print(f"TELEGRAM_CHANNEL_ID: {TELEGRAM_CHANNEL_ID}")
    # print(f"TARGET_WEBSITE_URL: {TARGET_WEBSITE_URL}")
    # Тестовый GET-запрос для проверки requests
    response = requests.get('https://example.com')
    print(f"Статус-код ответа: {response.status_code}")

    # === Инициализация БД и добавление тестового сайта ===
    create_tables()
    create_aggregator_sites_table()
    test_rules = {
        "news_item_selector": "div.news-item",
        "title_selector": "h2.news-title",
        "link_selector": "a.news-link",
        "full_text_selector": "div.article-body",
        "publish_date_selector": "span.post-date"
    }
    add_aggregator_site(
        name="Example News",
        url="https://example.com/news",
        active=1
    )
    # === Парсинг новостей со всех активных сайтов ===
    all_news = parse_news()
    print("\nСобранные новости (только новые):")
    for n in all_news:
        print(f"[{n['source_name']}] {n['title']} -> {n['link']}")
        print(f"  Дата: {n['publish_date']}")
        print(f"  Текст: {n['full_text'][:100] if n['full_text'] else 'Нет текста'} ...\n")

    # === Публикация новых новостей во ВКонтакте ===
    for n in all_news:
        # Получаем id новости из БД по ссылке
        try:
            with sqlite3.connect(DB_PATH) as conn:
                c = conn.cursor()
                c.execute("SELECT id, published_vk FROM news WHERE link = ?", (n['link'],))
                row = c.fetchone()
                if row and row[1] == 0:
                    post_to_vk(n, row[0])
                elif row:
                    print(f"[INFO] Новость уже опубликована в VK: {n['title']}")
                else:
                    print(f"[WARN] Не найдена новость в БД для публикации: {n['title']}")
        except Exception as e:
            print(f"[ERROR] Ошибка поиска новости для публикации: {e}") 