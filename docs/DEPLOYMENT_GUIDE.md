# Руководство по деплою News Aggregator

## Обзор

Данное руководство описывает процесс деплоя News Aggregator в продакшен среду для интеграции с веб-сайтами.

## Варианты деплоя

### 1. Локальный сервер

**Подходит для:** Небольших проектов, тестирования

**Требования:**
- Linux/Windows/macOS сервер
- Python 3.8+
- 2 GB RAM
- 10 GB свободного места

### 2. VPS (Virtual Private Server)

**Подходит для:** Средних проектов, коммерческого использования

**Рекомендуемые провайдеры:**
- DigitalOcean
- Linode
- Vultr
- Hetzner

**Требования:**
- Ubuntu 20.04+ / CentOS 8+
- 2-4 GB RAM
- 20-50 GB SSD
- Статический IP

### 3. Облачные платформы

**Подходит для:** Крупных проектов, высокой доступности

**Платформы:**
- AWS EC2
- Google Cloud Platform
- Microsoft Azure
- Heroku

## Подготовка к деплою

### 1. Подготовка кода

```bash
# Клонирование репозитория
git clone https://github.com/golkonst77/news-whisperer-platform.git
cd news-whisperer-platform/news_aggregator

# Создание виртуального окружения
python -m venv venv
source venv/bin/activate  # Linux/macOS
# или
venv\Scripts\activate  # Windows

# Установка зависимостей
pip install -r requirements.txt
```

### 2. Настройка переменных окружения

Создайте файл `.env` для продакшена:

```env
# API Keys (обязательно)
DEEPSEEK_API_KEY=your_production_deepseek_key
TELEGRAM_BOT_TOKEN=your_production_telegram_token
VK_ACCESS_TOKEN=your_production_vk_token

# Database Configuration
DATABASE_URL=sqlite:///aggregators.db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Parsing Configuration
MIN_ARTICLE_LENGTH=1000
MAX_ARTICLE_LENGTH=50000
REQUEST_TIMEOUT=30

# Publishing Configuration
TELEGRAM_CHAT_ID=your_production_chat_id
VK_GROUP_ID=your_production_group_id

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=/var/log/news_aggregator.log

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=3600

# Security
API_KEY=your_production_api_key
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 3. Настройка базы данных

```bash
# Инициализация базы данных
python main.py --init-db

# Проверка подключения
python -c "from core.db import Database; db = Database(); print('Database connected')"
```

## Деплой на Ubuntu VPS

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
sudo apt install -y python3 python3-pip python3-venv nginx supervisor

# Создание пользователя для приложения
sudo useradd -m -s /bin/bash news_aggregator
sudo usermod -aG sudo news_aggregator
```

### 2. Установка приложения

```bash
# Переключение на пользователя приложения
sudo su - news_aggregator

# Клонирование репозитория
git clone https://github.com/golkonst77/news-whisperer-platform.git
cd news-whisperer-platform/news_aggregator

# Создание виртуального окружения
python3 -m venv venv
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt

# Создание директории для логов
mkdir -p logs
```

### 3. Настройка systemd сервиса

Создайте файл `/etc/systemd/system/news-aggregator.service`:

```ini
[Unit]
Description=News Aggregator API Server
After=network.target

[Service]
Type=simple
User=news_aggregator
Group=news_aggregator
WorkingDirectory=/home/news_aggregator/news-whisperer-platform/news_aggregator
Environment=PATH=/home/news_aggregator/news-whisperer-platform/news_aggregator/venv/bin
ExecStart=/home/news_aggregator/news-whisperer-platform/news_aggregator/venv/bin/python api_server.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Активация сервиса:

```bash
sudo systemctl daemon-reload
sudo systemctl enable news-aggregator
sudo systemctl start news-aggregator
sudo systemctl status news-aggregator
```

### 4. Настройка Nginx

Создайте файл `/etc/nginx/sites-available/news-aggregator`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Редирект на HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Безопасность
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Проксирование к API
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Таймауты
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Буферизация
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Статические файлы (если есть)
    location /static/ {
        alias /home/news_aggregator/news-whisperer-platform/news_aggregator/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Логи
    access_log /var/log/nginx/news-aggregator.access.log;
    error_log /var/log/nginx/news-aggregator.error.log;
}
```

Активация конфигурации:

```bash
sudo ln -s /etc/nginx/sites-available/news-aggregator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Настройка SSL сертификата

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Автоматическое обновление
sudo crontab -e
# Добавьте строку:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 6. Настройка файрвола

```bash
# Установка UFW
sudo apt install -y ufw

# Настройка правил
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Активация файрвола
sudo ufw enable
```

## Деплой на Docker

### 1. Создание Dockerfile

```dockerfile
FROM python:3.11-slim

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Создание рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY requirements.txt .

# Установка Python зависимостей
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода приложения
COPY . .

# Создание пользователя для безопасности
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Открытие порта
EXPOSE 8000

# Команда запуска
CMD ["python", "api_server.py"]
```

### 2. Создание docker-compose.yml

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
      - DATABASE_URL=sqlite:///data/aggregators.db
    volumes:
      - ./data:/app/data
      - ./.env:/app/.env:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - news-aggregator
    restart: unless-stopped
```

### 3. Запуск Docker контейнеров

```bash
# Сборка и запуск
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f news-aggregator
```

## Деплой на Heroku

### 1. Подготовка приложения

Создайте файл `Procfile`:

```
web: python api_server.py
```

Создайте файл `runtime.txt`:

```
python-3.11.0
```

### 2. Настройка переменных окружения

```bash
# Установка Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Создание приложения
heroku create your-news-aggregator

# Настройка переменных окружения
heroku config:set DEEPSEEK_API_KEY=your_key
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set VK_ACCESS_TOKEN=your_token
heroku config:set API_HOST=0.0.0.0
heroku config:set API_PORT=$PORT
```

### 3. Деплой

```bash
# Добавление Heroku remote
heroku git:remote -a your-news-aggregator

# Деплой
git push heroku main

# Проверка статуса
heroku logs --tail
```

## Мониторинг и логирование

### 1. Настройка логирования

Создайте файл `/etc/logrotate.d/news-aggregator`:

```
/home/news_aggregator/news-whisperer-platform/news_aggregator/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 news_aggregator news_aggregator
    postrotate
        systemctl reload news-aggregator
    endscript
}
```

### 2. Мониторинг с помощью Prometheus

Создайте файл `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'news-aggregator'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
```

### 3. Настройка алертов

Создайте скрипт `/usr/local/bin/check-news-aggregator.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:8000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "OK: News Aggregator API is running"
    exit 0
else
    echo "ERROR: News Aggregator API is not responding (HTTP $RESPONSE)"
    # Отправка уведомления
    curl -X POST "https://your-notification-service.com/webhook" \
         -H "Content-Type: application/json" \
         -d '{"text": "News Aggregator API is down!"}'
    exit 1
fi
```

Добавьте в crontab:

```bash
*/5 * * * * /usr/local/bin/check-news-aggregator.sh
```

## Резервное копирование

### 1. Скрипт резервного копирования

Создайте файл `/usr/local/bin/backup-news-aggregator.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backup/news-aggregator"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/home/news_aggregator/news-whisperer-platform/news_aggregator"

# Создание директории для резервных копий
mkdir -p $BACKUP_DIR

# Резервная копия базы данных
cp $APP_DIR/aggregators.db "$BACKUP_DIR/db_$DATE.sqlite"

# Резервная копия конфигурации
cp $APP_DIR/.env "$BACKUP_DIR/env_$DATE"

# Резервная копия логов
tar -czf "$BACKUP_DIR/logs_$DATE.tar.gz" -C $APP_DIR logs/

# Удаление старых резервных копий (старше 30 дней)
find $BACKUP_DIR -name "*.sqlite" -mtime +30 -delete
find $BACKUP_DIR -name "env_*" -mtime +30 -delete
find $BACKUP_DIR -name "logs_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### 2. Автоматическое резервное копирование

```bash
# Делаем скрипт исполняемым
chmod +x /usr/local/bin/backup-news-aggregator.sh

# Добавляем в crontab (ежедневно в 2:00)
crontab -e
# Добавьте строку:
# 0 2 * * * /usr/local/bin/backup-news-aggregator.sh
```

## Обновление приложения

### 1. Скрипт обновления

Создайте файл `/usr/local/bin/update-news-aggregator.sh`:

```bash
#!/bin/bash

APP_DIR="/home/news_aggregator/news-whisperer-platform/news_aggregator"
BACKUP_DIR="/backup/news-aggregator"

echo "Starting News Aggregator update..."

# Остановка сервиса
sudo systemctl stop news-aggregator

# Создание резервной копии
DATE=$(date +%Y%m%d_%H%M%S)
cp $APP_DIR/aggregators.db "$BACKUP_DIR/db_before_update_$DATE.sqlite"

# Обновление кода
cd $APP_DIR
git pull origin main

# Обновление зависимостей
source venv/bin/activate
pip install -r requirements.txt

# Проверка конфигурации
python -c "from api_server import app; print('Configuration OK')"

# Запуск сервиса
sudo systemctl start news-aggregator

# Проверка статуса
sleep 10
if sudo systemctl is-active --quiet news-aggregator; then
    echo "Update completed successfully"
else
    echo "Update failed, rolling back..."
    cp "$BACKUP_DIR/db_before_update_$DATE.sqlite" $APP_DIR/aggregators.db
    sudo systemctl start news-aggregator
fi
```

### 2. Автоматическое обновление

```bash
# Делаем скрипт исполняемым
chmod +x /usr/local/bin/update-news-aggregator.sh

# Добавляем в crontab (еженедельно в воскресенье в 3:00)
crontab -e
# Добавьте строку:
# 0 3 * * 0 /usr/local/bin/update-news-aggregator.sh
```

## Безопасность

### 1. Настройка API ключей

```python
# В api_server.py добавьте аутентификацию
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_token(token: str = Depends(security)):
    if token.credentials != os.getenv("API_KEY"):
        raise HTTPException(status_code=401, detail="Invalid API key")
    return token.credentials
```

### 2. Настройка CORS

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### 3. Rate Limiting

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

## Тестирование деплоя

### 1. Проверка API

```bash
# Проверка здоровья API
curl -X GET https://your-domain.com/health

# Тест парсинга
curl -X POST https://your-domain.com/parse \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/news"}'

# Тест публикации
curl -X POST https://your-domain.com/publish \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "content": "Test content", "networks": ["telegram"]}'
```

### 2. Нагрузочное тестирование

```bash
# Установка Apache Bench
sudo apt install apache2-utils

# Тест производительности
ab -n 1000 -c 10 https://your-domain.com/health
```

## Устранение неполадок

### 1. Проверка логов

```bash
# Логи приложения
sudo journalctl -u news-aggregator -f

# Логи Nginx
sudo tail -f /var/log/nginx/news-aggregator.error.log

# Логи приложения
tail -f /home/news_aggregator/news-whisperer-platform/news_aggregator/news_aggregator.log
```

### 2. Проверка статуса сервисов

```bash
# Статус News Aggregator
sudo systemctl status news-aggregator

# Статус Nginx
sudo systemctl status nginx

# Проверка портов
sudo netstat -tlnp | grep :8000
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### 3. Перезапуск сервисов

```bash
# Перезапуск News Aggregator
sudo systemctl restart news-aggregator

# Перезапуск Nginx
sudo systemctl restart nginx

# Проверка конфигурации Nginx
sudo nginx -t
```

## Заключение

После выполнения всех шагов ваше приложение News Aggregator будет доступно по адресу `https://your-domain.com` и готово к интеграции с вашими веб-сайтами.

Для получения дополнительной помощи обратитесь к документации проекта или создайте issue в репозитории. 