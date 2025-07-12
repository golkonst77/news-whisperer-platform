# Руководство по интеграции News Aggregator

## Обзор

News Aggregator - это Python-приложение для автоматического парсинга, обработки и публикации новостей. Данное руководство описывает, как интегрировать этот проект в ваш веб-сайт или приложение.

## Архитектура интеграции

```
Ваш сайт ←→ REST API ←→ News Aggregator
```

### Компоненты системы

1. **News Aggregator Core** - Python приложение с бизнес-логикой
2. **REST API Server** - FastAPI сервер для интеграции
3. **База данных** - SQLite для хранения данных
4. **Внешние API** - Telegram, VK, DeepSeek

## Требования к системе

### Минимальные требования
- Python 3.8+
- 512 MB RAM
- 1 GB свободного места
- Интернет-соединение

### Рекомендуемые требования
- Python 3.11+
- 2 GB RAM
- 5 GB свободного места
- Стабильное интернет-соединение

## Установка и настройка

### 1. Клонирование репозитория

```bash
git clone https://github.com/golkonst77/news-whisperer-platform.git
cd news-whisperer-platform/news_aggregator
```

### 2. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 3. Настройка переменных окружения

Создайте файл `.env` в папке `news_aggregator`:

```env
# API Keys
DEEPSEEK_API_KEY=your_deepseek_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
VK_ACCESS_TOKEN=your_vk_access_token_here

# Database Configuration
DATABASE_URL=sqlite:///aggregators.db

# API Configuration
API_HOST=localhost
API_PORT=8000

# Parsing Configuration
MIN_ARTICLE_LENGTH=1000
MAX_ARTICLE_LENGTH=50000
REQUEST_TIMEOUT=30

# Publishing Configuration
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
VK_GROUP_ID=your_vk_group_id_here

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=news_aggregator.log

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=3600
```

### 4. Инициализация базы данных

```bash
python main.py --init-db
```

### 5. Запуск API сервера

```bash
python api_server.py
```

Сервер будет доступен по адресу: `http://localhost:8000`

## REST API Endpoints

### Базовый URL
```
http://localhost:8000
```

### 1. Парсинг новостей

#### POST /parse
Парсит новости с указанного URL

**Запрос:**
```json
{
  "url": "https://example.com/news",
  "parsing_rules": {
    "title_selector": "h1.title",
    "content_selector": "div.content",
    "exclude_selectors": ["div.ads", "div.comments"]
  }
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "title": "Заголовок новости",
    "content": "Текст новости...",
    "url": "https://example.com/news",
    "publish_date": "2025-01-12T10:30:00",
    "word_count": 1500
  }
}
```

### 2. Рерайтинг текста

#### POST /paraphrase
Переписывает текст через DeepSeek API

**Запрос:**
```json
{
  "text": "Оригинальный текст для рерайтинга",
  "prompt": "Перепиши текст в деловом стиле",
  "max_length": 2000
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "original_text": "Оригинальный текст...",
    "rewritten_text": "Переписанный текст...",
    "word_count": 1200,
    "processing_time": 2.5
  }
}
```

### 3. Публикация в социальные сети

#### POST /publish
Публикует новость в выбранные социальные сети

**Запрос:**
```json
{
  "title": "Заголовок новости",
  "content": "Текст новости",
  "networks": ["telegram", "vk"],
  "tags": ["бизнес", "новости"],
  "schedule_time": "2025-01-12T15:00:00"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "telegram": {
      "published": true,
      "message_id": 12345,
      "url": "https://t.me/channel/12345"
    },
    "vk": {
      "published": true,
      "post_id": 67890,
      "url": "https://vk.com/group?w=wall-123456_67890"
    }
  }
}
```

### 4. Управление источниками

#### GET /sources
Получает список всех источников новостей

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Example News",
      "url": "https://example.com",
      "active": true,
      "parsing_rules": {
        "title_selector": "h1",
        "content_selector": "div.content"
      }
    }
  ]
}
```

#### POST /sources
Добавляет новый источник

**Запрос:**
```json
{
  "name": "New Source",
  "url": "https://newsource.com",
  "parsing_rules": {
    "title_selector": "h1.title",
    "content_selector": "div.article-content"
  }
}
```

### 5. Получение новостей

#### GET /news
Получает список сохраненных новостей

**Параметры:**
- `limit` - количество новостей (по умолчанию 20)
- `offset` - смещение (по умолчанию 0)
- `status` - статус публикации (draft, published, failed)

**Ответ:**
```json
{
  "success": true,
  "data": {
    "news": [
      {
        "id": 1,
        "title": "Заголовок",
        "content": "Текст...",
        "url": "https://example.com/news",
        "status": "published",
        "created_at": "2025-01-12T10:30:00",
        "published_at": "2025-01-12T11:00:00"
      }
    ],
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

## Примеры интеграции

### PHP

```php
<?php
class NewsAggregator {
    private $api_url = 'http://localhost:8000';
    
    public function parseNews($url) {
        $data = json_encode(['url' => $url]);
        
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/json',
                'content' => $data
            ]
        ]);
        
        $response = file_get_contents($this->api_url . '/parse', false, $context);
        return json_decode($response, true);
    }
    
    public function publishNews($title, $content, $networks = ['telegram']) {
        $data = json_encode([
            'title' => $title,
            'content' => $content,
            'networks' => $networks
        ]);
        
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/json',
                'content' => $data
            ]
        ]);
        
        $response = file_get_contents($this->api_url . '/publish', false, $context);
        return json_decode($response, true);
    }
}

// Использование
$aggregator = new NewsAggregator();

// Парсинг новости
$news = $aggregator->parseNews('https://example.com/news');
if ($news['success']) {
    // Публикация
    $result = $aggregator->publishNews(
        $news['data']['title'],
        $news['data']['content']
    );
}
?>
```

### Node.js

```javascript
class NewsAggregator {
    constructor(apiUrl = 'http://localhost:8000') {
        this.apiUrl = apiUrl;
    }
    
    async parseNews(url, parsingRules = {}) {
        const response = await fetch(`${this.apiUrl}/parse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                parsing_rules: parsingRules
            })
        });
        
        return await response.json();
    }
    
    async publishNews(title, content, networks = ['telegram']) {
        const response = await fetch(`${this.apiUrl}/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                content,
                networks
            })
        });
        
        return await response.json();
    }
    
    async paraphraseText(text, prompt = '') {
        const response = await fetch(`${this.apiUrl}/paraphrase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                prompt
            })
        });
        
        return await response.json();
    }
}

// Использование
const aggregator = new NewsAggregator();

async function processNews() {
    try {
        // Парсинг
        const news = await aggregator.parseNews('https://example.com/news');
        if (news.success) {
            // Рерайтинг
            const rewritten = await aggregator.paraphraseText(
                news.data.content,
                'Перепиши в деловом стиле'
            );
            
            if (rewritten.success) {
                // Публикация
                const result = await aggregator.publishNews(
                    news.data.title,
                    rewritten.data.rewritten_text
                );
                
                console.log('Опубликовано:', result);
            }
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}
```

### Python

```python
import requests
import json

class NewsAggregatorClient:
    def __init__(self, api_url="http://localhost:8000"):
        self.api_url = api_url
    
    def parse_news(self, url, parsing_rules=None):
        data = {"url": url}
        if parsing_rules:
            data["parsing_rules"] = parsing_rules
        
        response = requests.post(f"{self.api_url}/parse", json=data)
        return response.json()
    
    def publish_news(self, title, content, networks=None):
        if networks is None:
            networks = ["telegram"]
        
        data = {
            "title": title,
            "content": content,
            "networks": networks
        }
        
        response = requests.post(f"{self.api_url}/publish", json=data)
        return response.json()
    
    def paraphrase_text(self, text, prompt=""):
        data = {
            "text": text,
            "prompt": prompt
        }
        
        response = requests.post(f"{self.api_url}/paraphrase", json=data)
        return response.json()

# Использование
client = NewsAggregatorClient()

# Парсинг новости
news = client.parse_news("https://example.com/news")
if news["success"]:
    # Рерайтинг
    rewritten = client.paraphrase_text(
        news["data"]["content"],
        "Перепиши в деловом стиле"
    )
    
    if rewritten["success"]:
        # Публикация
        result = client.publish_news(
            news["data"]["title"],
            rewritten["data"]["rewritten_text"]
        )
        print("Опубликовано:", result)
```

### JavaScript (Frontend)

```javascript
class NewsAggregatorFrontend {
    constructor(apiUrl = 'http://localhost:8000') {
        this.apiUrl = apiUrl;
    }
    
    async parseNews(url) {
        try {
            const response = await fetch(`${this.apiUrl}/parse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка парсинга:', error);
            return { success: false, error: error.message };
        }
    }
    
    async publishNews(title, content, networks = ['telegram']) {
        try {
            const response = await fetch(`${this.apiUrl}/publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    content,
                    networks
                })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка публикации:', error);
            return { success: false, error: error.message };
        }
    }
}

// Использование в веб-интерфейсе
const aggregator = new NewsAggregatorFrontend();

// Обработчик формы
document.getElementById('parseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('newsUrl').value;
    const result = await aggregator.parseNews(url);
    
    if (result.success) {
        document.getElementById('title').value = result.data.title;
        document.getElementById('content').value = result.data.content;
    } else {
        alert('Ошибка парсинга: ' + result.error);
    }
});

// Обработчик публикации
document.getElementById('publishForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const networks = Array.from(document.querySelectorAll('input[name="networks"]:checked'))
        .map(cb => cb.value);
    
    const result = await aggregator.publishNews(title, content, networks);
    
    if (result.success) {
        alert('Новость успешно опубликована!');
    } else {
        alert('Ошибка публикации: ' + result.error);
    }
});
```

## Конфигурация для продакшена

### 1. Настройка веб-сервера

#### Nginx конфигурация

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Apache конфигурация

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:8000/
    ProxyPassReverse / http://localhost:8000/
    
    <Location />
        RequestHeader set X-Forwarded-Proto "http"
        RequestHeader set X-Forwarded-Port "80"
    </Location>
</VirtualHost>
```

### 2. Системный сервис (systemd)

Создайте файл `/etc/systemd/system/news-aggregator.service`:

```ini
[Unit]
Description=News Aggregator API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/news_aggregator
Environment=PATH=/path/to/venv/bin
ExecStart=/path/to/venv/bin/python api_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Активация сервиса:

```bash
sudo systemctl daemon-reload
sudo systemctl enable news-aggregator
sudo systemctl start news-aggregator
```

### 3. Docker контейнеризация

Создайте `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "api_server.py"]
```

Создайте `docker-compose.yml`:

```yaml
version: '3.8'

services:
  news-aggregator:
    build: .
    ports:
      - "8000:8000"
    environment:
      - API_HOST=0.0.0.0
      - API_PORT=8000
    volumes:
      - ./data:/app/data
      - ./.env:/app/.env
    restart: unless-stopped
```

### 4. SSL сертификат

Для HTTPS используйте Let's Encrypt:

```bash
sudo certbot --nginx -d your-domain.com
```

## Мониторинг и логирование

### 1. Логирование

Настройте ротацию логов в `/etc/logrotate.d/news-aggregator`:

```
/path/to/news_aggregator/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 www-data www-data
}
```

### 2. Мониторинг

Создайте скрипт для проверки здоровья API:

```bash
#!/bin/bash
# /usr/local/bin/check-news-aggregator.sh

API_URL="http://localhost:8000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "OK: News Aggregator API is running"
    exit 0
else
    echo "ERROR: News Aggregator API is not responding"
    exit 1
fi
```

Добавьте в crontab:

```bash
*/5 * * * * /usr/local/bin/check-news-aggregator.sh
```

## Безопасность

### 1. Аутентификация API

Добавьте API ключи в конфигурацию:

```python
# В api_server.py
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_token(token: str = Depends(security)):
    if token.credentials != "your-api-key":
        raise HTTPException(status_code=401, detail="Invalid API key")
    return token.credentials
```

### 2. Rate Limiting

Настройте ограничения запросов:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/parse")
@limiter.limit("10/minute")
async def parse_news(request: Request):
    # Ваш код
    pass
```

### 3. CORS настройки

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## Обработка ошибок

### 1. Типичные ошибки и решения

| Ошибка | Причина | Решение |
|--------|---------|---------|
| `Connection refused` | API сервер не запущен | Запустите `python api_server.py` |
| `401 Unauthorized` | Неверный API ключ | Проверьте настройки аутентификации |
| `429 Too Many Requests` | Превышен лимит запросов | Увеличьте rate limiting или подождите |
| `500 Internal Server Error` | Ошибка в коде | Проверьте логи сервера |

### 2. Логирование ошибок

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('news_aggregator.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error"}
    )
```

## Производительность

### 1. Оптимизация базы данных

```sql
-- Создайте индексы для ускорения запросов
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_created_at ON news(created_at);
CREATE INDEX idx_published_network ON published(network);
```

### 2. Кэширование

```python
from functools import lru_cache
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

@lru_cache(maxsize=1000)
def get_cached_news(news_id: int):
    return redis_client.get(f"news:{news_id}")
```

### 3. Асинхронная обработка

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)

@app.post("/parse-batch")
async def parse_batch(urls: List[str]):
    tasks = []
    for url in urls:
        task = asyncio.create_task(parse_single_url(url))
        tasks.append(task)
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return {"success": True, "data": results}
```

## Тестирование

### 1. Unit тесты

```python
import pytest
from fastapi.testclient import TestClient
from api_server import app

client = TestClient(app)

def test_parse_news():
    response = client.post("/parse", json={"url": "https://example.com"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True

def test_publish_news():
    response = client.post("/publish", json={
        "title": "Test",
        "content": "Test content",
        "networks": ["telegram"]
    })
    assert response.status_code == 200
```

### 2. Интеграционные тесты

```python
def test_full_workflow():
    # 1. Парсинг
    parse_response = client.post("/parse", json={"url": "https://example.com"})
    assert parse_response.status_code == 200
    
    # 2. Рерайтинг
    news_data = parse_response.json()["data"]
    paraphrase_response = client.post("/paraphrase", json={
        "text": news_data["content"]
    })
    assert paraphrase_response.status_code == 200
    
    # 3. Публикация
    rewritten_data = paraphrase_response.json()["data"]
    publish_response = client.post("/publish", json={
        "title": news_data["title"],
        "content": rewritten_data["rewritten_text"],
        "networks": ["telegram"]
    })
    assert publish_response.status_code == 200
```

## Поддержка и обновления

### 1. Обновление системы

```bash
# Остановка сервиса
sudo systemctl stop news-aggregator

# Обновление кода
git pull origin main

# Установка новых зависимостей
pip install -r requirements.txt

# Запуск сервиса
sudo systemctl start news-aggregator
```

### 2. Резервное копирование

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/news-aggregator"

# Создание резервной копии базы данных
sqlite3 aggregators.db ".backup '/backup/news-aggregator/db_$DATE.sqlite'"

# Создание резервной копии конфигурации
cp .env "/backup/news-aggregator/env_$DATE"

# Удаление старых резервных копий (старше 30 дней)
find $BACKUP_DIR -name "*.sqlite" -mtime +30 -delete
find $BACKUP_DIR -name "env_*" -mtime +30 -delete
```

### 3. Мониторинг производительности

```python
import time
from functools import wraps

def measure_time(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        logger.info(f"{func.__name__} took {end_time - start_time:.2f} seconds")
        return result
    return wrapper

@app.post("/parse")
@measure_time
async def parse_news(request: ParseRequest):
    # Ваш код
    pass
```

## Заключение

Данное руководство предоставляет полную информацию для интеграции News Aggregator в ваш проект. Система готова к использованию в продакшене и может быть легко масштабирована под ваши потребности.

Для получения дополнительной поддержки обратитесь к документации проекта или создайте issue в репозитории. 