# API Reference - News Aggregator

## Обзор

News Aggregator предоставляет REST API для интеграции с веб-сайтами и приложениями. API позволяет парсить новости, обрабатывать контент и публиковать в социальные сети.

## Базовый URL

```
http://localhost:8000
```

## Аутентификация

API использует Bearer токен аутентификацию:

```http
Authorization: Bearer your-api-key
```

## Общие заголовки

```http
Content-Type: application/json
Accept: application/json
```

## Коды ответов

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Ресурс создан |
| 400 | Неверный запрос |
| 401 | Не авторизован |
| 403 | Доступ запрещен |
| 404 | Ресурс не найден |
| 429 | Слишком много запросов |
| 500 | Внутренняя ошибка сервера |

## Endpoints

### 1. Парсинг новостей

#### POST /parse

Парсит новости с указанного URL.

**Запрос:**
```json
{
  "url": "https://example.com/news",
  "parsing_rules": {
    "title_selector": "h1.title",
    "content_selector": "div.content",
    "exclude_selectors": ["div.ads", "div.comments"],
    "date_selector": "time.published",
    "date_format": "%Y-%m-%d %H:%M:%S"
  }
}
```

**Параметры:**
- `url` (string, обязательный) - URL страницы для парсинга
- `parsing_rules` (object, опциональный) - Правила парсинга

**Ответ:**
```json
{
  "success": true,
  "data": {
    "title": "Заголовок новости",
    "content": "Текст новости...",
    "url": "https://example.com/news",
    "publish_date": "2025-01-12T10:30:00",
    "word_count": 1500,
    "reading_time": "5 min",
    "language": "ru"
  }
}
```

**Ошибки:**
```json
{
  "success": false,
  "error": "Failed to parse URL",
  "details": "Connection timeout"
}
```

### 2. Рерайтинг текста

#### POST /paraphrase

Переписывает текст через DeepSeek API.

**Запрос:**
```json
{
  "text": "Оригинальный текст для рерайтинга",
  "prompt": "Перепиши текст в деловом стиле",
  "max_length": 2000,
  "tone": "professional",
  "style": "news"
}
```

**Параметры:**
- `text` (string, обязательный) - Текст для рерайтинга
- `prompt` (string, опциональный) - Инструкции для рерайтинга
- `max_length` (integer, опциональный) - Максимальная длина текста
- `tone` (string, опциональный) - Тон текста (professional, casual, formal)
- `style` (string, опциональный) - Стиль текста (news, blog, article)

**Ответ:**
```json
{
  "success": true,
  "data": {
    "original_text": "Оригинальный текст...",
    "rewritten_text": "Переписанный текст...",
    "word_count": 1200,
    "processing_time": 2.5,
    "similarity_score": 0.85
  }
}
```

### 3. Публикация в социальные сети

#### POST /publish

Публикует новость в выбранные социальные сети.

**Запрос:**
```json
{
  "title": "Заголовок новости",
  "content": "Текст новости",
  "networks": ["telegram", "vk"],
  "tags": ["бизнес", "новости"],
  "schedule_time": "2025-01-12T15:00:00",
  "image_url": "https://example.com/image.jpg",
  "link": "https://example.com/news"
}
```

**Параметры:**
- `title` (string, обязательный) - Заголовок новости
- `content` (string, обязательный) - Текст новости
- `networks` (array, обязательный) - Список сетей для публикации
- `tags` (array, опциональный) - Теги для новости
- `schedule_time` (string, опциональный) - Время публикации (ISO 8601)
- `image_url` (string, опциональный) - URL изображения
- `link` (string, опциональный) - Ссылка на оригинал

**Ответ:**
```json
{
  "success": true,
  "data": {
    "telegram": {
      "published": true,
      "message_id": 12345,
      "url": "https://t.me/channel/12345",
      "timestamp": "2025-01-12T15:00:00"
    },
    "vk": {
      "published": true,
      "post_id": 67890,
      "url": "https://vk.com/group?w=wall-123456_67890",
      "timestamp": "2025-01-12T15:00:00"
    }
  }
}
```

### 4. Управление источниками

#### GET /sources

Получает список всех источников новостей.

**Параметры запроса:**
- `active` (boolean, опциональный) - Фильтр по активности
- `limit` (integer, опциональный) - Количество записей
- `offset` (integer, опциональный) - Смещение

**Ответ:**
```json
{
  "success": true,
  "data": {
    "sources": [
      {
        "id": 1,
        "name": "Example News",
        "url": "https://example.com",
        "active": true,
        "parsing_rules": {
          "title_selector": "h1",
          "content_selector": "div.content"
        },
        "created_at": "2025-01-12T10:00:00",
        "last_parsed": "2025-01-12T15:30:00"
      }
    ],
    "total": 10,
    "limit": 20,
    "offset": 0
  }
}
```

#### POST /sources

Добавляет новый источник новостей.

**Запрос:**
```json
{
  "name": "New Source",
  "url": "https://newsource.com",
  "parsing_rules": {
    "title_selector": "h1.title",
    "content_selector": "div.article-content",
    "exclude_selectors": ["div.ads"]
  },
  "active": true
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "New Source",
    "url": "https://newsource.com",
    "active": true,
    "created_at": "2025-01-12T16:00:00"
  }
}
```

#### PUT /sources/{id}

Обновляет существующий источник.

**Запрос:**
```json
{
  "name": "Updated Source",
  "active": false,
  "parsing_rules": {
    "title_selector": "h1.updated-title"
  }
}
```

#### DELETE /sources/{id}

Удаляет источник новостей.

**Ответ:**
```json
{
  "success": true,
  "message": "Source deleted successfully"
}
```

### 5. Управление новостями

#### GET /news

Получает список сохраненных новостей.

**Параметры запроса:**
- `status` (string, опциональный) - Статус новости (draft, published, failed)
- `source_id` (integer, опциональный) - ID источника
- `limit` (integer, опциональный) - Количество записей
- `offset` (integer, опциональный) - Смещение
- `date_from` (string, опциональный) - Дата начала (ISO 8601)
- `date_to` (string, опциональный) - Дата окончания (ISO 8601)

**Ответ:**
```json
{
  "success": true,
  "data": {
    "news": [
      {
        "id": 1,
        "title": "Заголовок новости",
        "content": "Текст новости...",
        "url": "https://example.com/news",
        "status": "published",
        "source_id": 1,
        "word_count": 1500,
        "created_at": "2025-01-12T10:30:00",
        "published_at": "2025-01-12T11:00:00",
        "publications": [
          {
            "network": "telegram",
            "message_id": 12345,
            "url": "https://t.me/channel/12345"
          }
        ]
      }
    ],
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

#### GET /news/{id}

Получает детальную информацию о новости.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Заголовок новости",
    "content": "Полный текст новости...",
    "url": "https://example.com/news",
    "status": "published",
    "source_id": 1,
    "word_count": 1500,
    "reading_time": "5 min",
    "created_at": "2025-01-12T10:30:00",
    "published_at": "2025-01-12T11:00:00",
    "publications": [
      {
        "network": "telegram",
        "message_id": 12345,
        "url": "https://t.me/channel/12345",
        "timestamp": "2025-01-12T11:00:00"
      }
    ],
    "tags": ["бизнес", "новости"],
    "metadata": {
      "language": "ru",
      "sentiment": "positive",
      "keywords": ["бизнес", "экономика"]
    }
  }
}
```

#### PUT /news/{id}

Обновляет новость.

**Запрос:**
```json
{
  "title": "Обновленный заголовок",
  "content": "Обновленный текст...",
  "status": "draft",
  "tags": ["обновленные", "теги"]
}
```

#### DELETE /news/{id}

Удаляет новость.

**Ответ:**
```json
{
  "success": true,
  "message": "News deleted successfully"
}
```

### 6. Статистика и аналитика

#### GET /stats

Получает статистику системы.

**Параметры запроса:**
- `period` (string, опциональный) - Период (day, week, month, year)
- `date_from` (string, опциональный) - Дата начала
- `date_to` (string, опциональный) - Дата окончания

**Ответ:**
```json
{
  "success": true,
  "data": {
    "total_news": 1500,
    "published_news": 1200,
    "failed_news": 50,
    "total_sources": 25,
    "active_sources": 20,
    "publications_by_network": {
      "telegram": 800,
      "vk": 400
    },
    "average_processing_time": 2.5,
    "success_rate": 0.95,
    "period_stats": [
      {
        "date": "2025-01-12",
        "news_count": 15,
        "published_count": 12
      }
    ]
  }
}
```

#### GET /stats/sources/{id}

Получает статистику по конкретному источнику.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "source_id": 1,
    "source_name": "Example News",
    "total_news": 150,
    "published_news": 120,
    "failed_news": 5,
    "success_rate": 0.96,
    "average_word_count": 1200,
    "last_parsed": "2025-01-12T15:30:00",
    "parsing_frequency": "hourly"
  }
}
```

### 7. Системные endpoints

#### GET /health

Проверяет состояние системы.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-12T16:00:00",
    "version": "1.0.0",
    "uptime": 86400,
    "services": {
      "database": "connected",
      "telegram_api": "connected",
      "vk_api": "connected",
      "deepseek_api": "connected"
    }
  }
}
```

#### GET /config

Получает конфигурацию системы (без секретных данных).

**Ответ:**
```json
{
  "success": true,
  "data": {
    "api_version": "1.0",
    "max_article_length": 50000,
    "min_article_length": 1000,
    "supported_networks": ["telegram", "vk"],
    "rate_limits": {
      "requests_per_minute": 60,
      "requests_per_hour": 1000
    },
    "features": {
      "paraphrasing": true,
      "scheduling": true,
      "analytics": true
    }
  }
}
```

## Обработка ошибок

### Стандартный формат ошибки

```json
{
  "success": false,
  "error": "Error description",
  "error_code": "VALIDATION_ERROR",
  "details": {
    "field": "url",
    "message": "Invalid URL format"
  },
  "timestamp": "2025-01-12T16:00:00"
}
```

### Коды ошибок

| Код | Описание |
|-----|----------|
| `VALIDATION_ERROR` | Ошибка валидации данных |
| `PARSING_ERROR` | Ошибка парсинга URL |
| `PUBLISHING_ERROR` | Ошибка публикации |
| `API_ERROR` | Ошибка внешнего API |
| `DATABASE_ERROR` | Ошибка базы данных |
| `RATE_LIMIT_EXCEEDED` | Превышен лимит запросов |
| `AUTHENTICATION_ERROR` | Ошибка аутентификации |

## Rate Limiting

API использует ограничения запросов:

- **Парсинг**: 10 запросов в минуту
- **Публикация**: 5 запросов в минуту
- **Рерайтинг**: 20 запросов в минуту
- **Общие запросы**: 100 запросов в час

При превышении лимита возвращается ошибка 429:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60
}
```

## Webhooks

### Настройка webhook

```json
{
  "url": "https://your-site.com/webhook",
  "events": ["news_published", "parsing_failed"],
  "secret": "your-webhook-secret"
}
```

### Формат webhook события

```json
{
  "event": "news_published",
  "timestamp": "2025-01-12T16:00:00",
  "data": {
    "news_id": 123,
    "title": "Заголовок новости",
    "networks": ["telegram", "vk"]
  },
  "signature": "sha256=..."
}
```

## Примеры использования

### Полный цикл обработки новости

```javascript
// 1. Парсинг новости
const parseResponse = await fetch('/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com/news'
  })
});

const parsedNews = await parseResponse.json();

if (parsedNews.success) {
  // 2. Рерайтинг
  const paraphraseResponse = await fetch('/paraphrase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: parsedNews.data.content,
      prompt: 'Перепиши в деловом стиле'
    })
  });

  const rewritten = await paraphraseResponse.json();

  if (rewritten.success) {
    // 3. Публикация
    const publishResponse = await fetch('/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: parsedNews.data.title,
        content: rewritten.data.rewritten_text,
        networks: ['telegram', 'vk']
      })
    });

    const result = await publishResponse.json();
    console.log('Опубликовано:', result);
  }
}
```

### Пакетная обработка

```javascript
// Парсинг нескольких URL одновременно
const urls = [
  'https://example1.com/news',
  'https://example2.com/news',
  'https://example3.com/news'
];

const promises = urls.map(url => 
  fetch('/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  }).then(r => r.json())
);

const results = await Promise.all(promises);
const successful = results.filter(r => r.success);
console.log(`Успешно обработано: ${successful.length}/${urls.length}`);
```

## Поддержка и обратная связь

Для получения поддержки:

1. Создайте issue в репозитории проекта
2. Обратитесь к документации проекта
3. Проверьте логи сервера для диагностики проблем

## Версионирование API

API использует семантическое версионирование. Текущая версия: `v1.0.0`

Для указания версии используйте заголовок:

```http
Accept: application/vnd.news-aggregator.v1+json
```

Или в URL:

```
http://localhost:8000/v1/parse
``` 