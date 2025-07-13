# News Aggregator - Система агрегации и публикации новостей

## 📍 Расположение проекта

**GitHub репозиторий**: https://github.com/golkonst77/news-whisperer-platform

## Описание

News Aggregator - это система для автоматического парсинга новостей с различных сайтов, их обработки (включая рерайтинг через DeepSeek API) и публикации в социальные сети (Telegram, VK). Система включает десктопное GUI приложение и REST API для интеграции с веб-сайтами.

## Возможности

- 🔍 **Автоматический парсинг** новостей с настраиваемых источников
- 🤖 **Интеллектуальная обработка** контента через DeepSeek API
- 📱 **Публикация в соцсети** (Telegram, VK) с предварительным просмотром
- 🖥️ **Удобный GUI** для управления процессом
- 🔌 **REST API** для интеграции с веб-сайтами
- ⚙️ **Система управления** источниками и настройками

## Установка

### Требования

- Python 3.8+
- pip

### Установка зависимостей

```bash
pip install -r requirements.txt
```

### Настройка

1. Скопируйте файл `news_aggregator.env.example` в `news_aggregator.env`
2. Заполните необходимые переменные окружения:

```env
# Telegram настройки
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHANNEL_ID=@your_channel_id

# VK настройки
VK_ACCESS_TOKEN=your_vk_access_token_here
VK_OWNER_ID=your_vk_group_id

# DeepSeek API для рерайтинга
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

## Использование

### GUI приложение

```bash
cd news_aggregator
python gui.py
```

### REST API

```bash
cd news_aggregator
python api_server.py
```

API будет доступен по адресу: http://localhost:8000

## API Endpoints

### Парсинг и публикация
- `POST /parse` - Парсинг новостей с указанным методом
- `POST /publish` - Публикация новости в соцсети
- `POST /paraphrase` - Рерайтинг текста через DeepSeek
- `GET /news` - Получение списка новостей
- `GET /health` - Проверка состояния API

### Примеры использования

#### PHP
```php
$response = file_get_contents('http://localhost:8000/parse', false, stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode(['parser_method' => 'newspaper3k'])
    ]
]));
```

#### Node.js
```javascript
const response = await fetch('http://localhost:8000/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        news_id: 1,
        publish_vk: true,
        publish_tg: true
    })
});
```

## Архитектура

```
news_aggregator/
├── core/                    # Бизнес-логика
│   ├── parser.py           # Парсинг новостей
│   ├── publisher.py        # Публикация в соцсети
│   ├── paraphraser.py      # Рерайтинг через DeepSeek
│   └── db.py              # Работа с базой данных
├── gui.py                  # Десктопное GUI
├── api_server.py           # REST API сервер
├── main.py                 # Точка входа
├── requirements.txt        # Зависимости
└── docs/                  # Документация
```

## Технологии

- **Python 3.8+** - основной язык
- **Tkinter** - GUI фреймворк
- **FastAPI** - REST API
- **SQLite** - локальная база данных
- **Requests + BeautifulSoup** - парсинг
- **DeepSeek API** - рерайтинг
- **Telegram Bot API + VK API** - публикация

## Документация

Подробная документация находится в папке `docs/`:

- [Project.md](docs/Project.md) - Описание проекта и архитектуры
- [Tasktracker.md](docs/Tasktracker.md) - Отслеживание задач
- [Diary.md](docs/Diary.md) - Дневник разработки
- [changelog.md](docs/changelog.md) - Журнал изменений

## Разработка

### Установка для разработки

```bash
git clone https://github.com/golkonst77/news-whisperer-platform.git
cd news_aggregator
pip install -r requirements.txt
```

### Запуск тестов

```bash
# Планируется
pytest tests/
```

### Структура кода

Проект следует принципам:
- **SOLID** - принципы объектно-ориентированного программирования
- **KISS** - простота и понятность кода
- **DRY** - избежание дублирования кода

## Лицензия

MIT License

## Поддержка

При возникновении проблем создавайте issue в репозитории проекта. 
