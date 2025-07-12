# Примеры интеграции News Aggregator

## Содержание

1. [PHP интеграция](#php-интеграция)
2. [Node.js интеграция](#nodejs-интеграция)
3. [Python интеграция](#python-интеграция)
4. [JavaScript (Frontend) интеграция](#javascript-frontend-интеграция)
5. [WordPress интеграция](#wordpress-интеграция)
6. [Laravel интеграция](#laravel-интеграция)
7. [React интеграция](#react-интеграция)
8. [Vue.js интеграция](#vuejs-интеграция)

## PHP интеграция

### Простой класс для интеграции

```php
<?php
/**
 * News Aggregator PHP Client
 */
class NewsAggregatorClient {
    private $api_url;
    private $api_key;
    
    public function __construct($api_url = 'http://localhost:8000', $api_key = null) {
        $this->api_url = rtrim($api_url, '/');
        $this->api_key = $api_key;
    }
    
    /**
     * Парсинг новости с URL
     */
    public function parseNews($url, $parsing_rules = []) {
        $data = ['url' => $url];
        if (!empty($parsing_rules)) {
            $data['parsing_rules'] = $parsing_rules;
        }
        
        return $this->makeRequest('POST', '/parse', $data);
    }
    
    /**
     * Рерайтинг текста
     */
    public function paraphraseText($text, $prompt = '') {
        $data = [
            'text' => $text,
            'prompt' => $prompt
        ];
        
        return $this->makeRequest('POST', '/paraphrase', $data);
    }
    
    /**
     * Публикация новости
     */
    public function publishNews($title, $content, $networks = ['telegram']) {
        $data = [
            'title' => $title,
            'content' => $content,
            'networks' => $networks
        ];
        
        return $this->makeRequest('POST', '/publish', $data);
    }
    
    /**
     * Получение списка источников
     */
    public function getSources($active = null) {
        $params = [];
        if ($active !== null) {
            $params['active'] = $active ? 'true' : 'false';
        }
        
        return $this->makeRequest('GET', '/sources', null, $params);
    }
    
    /**
     * Добавление нового источника
     */
    public function addSource($name, $url, $parsing_rules = []) {
        $data = [
            'name' => $name,
            'url' => $url,
            'parsing_rules' => $parsing_rules,
            'active' => true
        ];
        
        return $this->makeRequest('POST', '/sources', $data);
    }
    
    /**
     * Получение статистики
     */
    public function getStats($period = null) {
        $params = [];
        if ($period) {
            $params['period'] = $period;
        }
        
        return $this->makeRequest('GET', '/stats', null, $params);
    }
    
    /**
     * Выполнение HTTP запроса
     */
    private function makeRequest($method, $endpoint, $data = null, $params = []) {
        $url = $this->api_url . $endpoint;
        
        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }
        
        $context = [
            'http' => [
                'method' => $method,
                'header' => 'Content-Type: application/json',
                'timeout' => 30
            ]
        ];
        
        if ($this->api_key) {
            $context['http']['header'] .= "\r\nAuthorization: Bearer " . $this->api_key;
        }
        
        if ($data !== null) {
            $context['http']['content'] = json_encode($data);
        }
        
        $response = file_get_contents($url, false, stream_context_create($context));
        
        if ($response === false) {
            return [
                'success' => false,
                'error' => 'Failed to connect to API'
            ];
        }
        
        return json_decode($response, true);
    }
}

// Пример использования
$aggregator = new NewsAggregatorClient('http://localhost:8000');

// Парсинг новости
$news = $aggregator->parseNews('https://example.com/news');
if ($news['success']) {
    echo "Заголовок: " . $news['data']['title'] . "\n";
    echo "Текст: " . substr($news['data']['content'], 0, 100) . "...\n";
    
    // Рерайтинг
    $rewritten = $aggregator->paraphraseText(
        $news['data']['content'],
        'Перепиши в деловом стиле'
    );
    
    if ($rewritten['success']) {
        // Публикация
        $result = $aggregator->publishNews(
            $news['data']['title'],
            $rewritten['data']['rewritten_text']
        );
        
        if ($result['success']) {
            echo "Новость успешно опубликована!\n";
        }
    }
}
?>
```

### WordPress плагин

```php
<?php
/**
 * Plugin Name: News Aggregator Integration
 * Description: Интеграция с News Aggregator для автоматической публикации новостей
 * Version: 1.0.0
 * Author: Your Name
 */

// Предотвращение прямого доступа
if (!defined('ABSPATH')) {
    exit;
}

class NewsAggregatorWordPress {
    private $api_url;
    private $api_key;
    
    public function __construct() {
        $this->api_url = get_option('news_aggregator_api_url', 'http://localhost:8000');
        $this->api_key = get_option('news_aggregator_api_key', '');
        
        add_action('admin_menu', [$this, 'addAdminMenu']);
        add_action('wp_ajax_parse_news', [$this, 'ajaxParseNews']);
        add_action('wp_ajax_publish_news', [$this, 'ajaxPublishNews']);
    }
    
    public function addAdminMenu() {
        add_menu_page(
            'News Aggregator',
            'News Aggregator',
            'manage_options',
            'news-aggregator',
            [$this, 'adminPage'],
            'dashicons-rss'
        );
    }
    
    public function adminPage() {
        ?>
        <div class="wrap">
            <h1>News Aggregator Integration</h1>
            
            <div class="card">
                <h2>Парсинг новости</h2>
                <form id="parse-form">
                    <table class="form-table">
                        <tr>
                            <th><label for="news-url">URL новости:</label></th>
                            <td>
                                <input type="url" id="news-url" name="url" class="regular-text" required>
                            </td>
                        </tr>
                    </table>
                    <p>
                        <button type="submit" class="button button-primary">Парсить новость</button>
                    </p>
                </form>
            </div>
            
            <div class="card" id="news-preview" style="display: none;">
                <h2>Предварительный просмотр</h2>
                <div id="news-content"></div>
                <p>
                    <button type="button" id="publish-btn" class="button button-primary">Опубликовать</button>
                </p>
            </div>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            $('#parse-form').on('submit', function(e) {
                e.preventDefault();
                
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'parse_news',
                        url: $('#news-url').val(),
                        nonce: '<?php echo wp_create_nonce("news_aggregator_nonce"); ?>'
                    },
                    success: function(response) {
                        if (response.success) {
                            $('#news-content').html(
                                '<h3>' + response.data.title + '</h3>' +
                                '<p>' + response.data.content.substring(0, 500) + '...</p>'
                            );
                            $('#news-preview').show();
                        } else {
                            alert('Ошибка: ' + response.error);
                        }
                    }
                });
            });
            
            $('#publish-btn').on('click', function() {
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'publish_news',
                        title: $('#news-content h3').text(),
                        content: $('#news-content p').text(),
                        nonce: '<?php echo wp_create_nonce("news_aggregator_nonce"); ?>'
                    },
                    success: function(response) {
                        if (response.success) {
                            alert('Новость успешно опубликована!');
                            $('#news-preview').hide();
                            $('#parse-form')[0].reset();
                        } else {
                            alert('Ошибка публикации: ' + response.error);
                        }
                    }
                });
            });
        });
        </script>
        <?php
    }
    
    public function ajaxParseNews() {
        check_ajax_referer('news_aggregator_nonce', 'nonce');
        
        $url = sanitize_url($_POST['url']);
        $aggregator = new NewsAggregatorClient($this->api_url, $this->api_key);
        
        $result = $aggregator->parseNews($url);
        
        wp_send_json($result);
    }
    
    public function ajaxPublishNews() {
        check_ajax_referer('news_aggregator_nonce', 'nonce');
        
        $title = sanitize_text_field($_POST['title']);
        $content = sanitize_textarea_field($_POST['content']);
        
        $aggregator = new NewsAggregatorClient($this->api_url, $this->api_key);
        
        $result = $aggregator->publishNews($title, $content);
        
        wp_send_json($result);
    }
}

// Инициализация плагина
new NewsAggregatorWordPress();
?>
```

## Node.js интеграция

### NPM пакет

```javascript
// package.json
{
  "name": "news-aggregator-client",
  "version": "1.0.0",
  "description": "Node.js client for News Aggregator API",
  "main": "index.js",
  "scripts": {
    "test": "jest"
  },
  "dependencies": {
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

### Основной класс

```javascript
// index.js
const axios = require('axios');

class NewsAggregatorClient {
    constructor(config = {}) {
        this.apiUrl = config.apiUrl || 'http://localhost:8000';
        this.apiKey = config.apiKey || null;
        this.timeout = config.timeout || 30000;
        
        this.client = axios.create({
            baseURL: this.apiUrl,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (this.apiKey) {
            this.client.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`;
        }
    }
    
    /**
     * Парсинг новости
     */
    async parseNews(url, parsingRules = {}) {
        try {
            const data = { url };
            if (Object.keys(parsingRules).length > 0) {
                data.parsing_rules = parsingRules;
            }
            
            const response = await this.client.post('/parse', data);
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }
    
    /**
     * Рерайтинг текста
     */
    async paraphraseText(text, options = {}) {
        try {
            const data = {
                text,
                prompt: options.prompt || '',
                max_length: options.maxLength,
                tone: options.tone,
                style: options.style
            };
            
            const response = await this.client.post('/paraphrase', data);
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }
    
    /**
     * Публикация новости
     */
    async publishNews(title, content, options = {}) {
        try {
            const data = {
                title,
                content,
                networks: options.networks || ['telegram'],
                tags: options.tags || [],
                schedule_time: options.scheduleTime,
                image_url: options.imageUrl,
                link: options.link
            };
            
            const response = await this.client.post('/publish', data);
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }
    
    /**
     * Получение источников
     */
    async getSources(options = {}) {
        try {
            const params = {};
            if (options.active !== undefined) {
                params.active = options.active;
            }
            if (options.limit) {
                params.limit = options.limit;
            }
            if (options.offset) {
                params.offset = options.offset;
            }
            
            const response = await this.client.get('/sources', { params });
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }
    
    /**
     * Добавление источника
     */
    async addSource(name, url, parsingRules = {}) {
        try {
            const data = {
                name,
                url,
                parsing_rules: parsingRules,
                active: true
            };
            
            const response = await this.client.post('/sources', data);
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }
    
    /**
     * Получение статистики
     */
    async getStats(options = {}) {
        try {
            const params = {};
            if (options.period) {
                params.period = options.period;
            }
            if (options.dateFrom) {
                params.date_from = options.dateFrom;
            }
            if (options.dateTo) {
                params.date_to = options.dateTo;
            }
            
            const response = await this.client.get('/stats', { params });
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }
    
    /**
     * Проверка здоровья API
     */
    async healthCheck() {
        try {
            const response = await this.client.get('/health');
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }
    
    /**
     * Обработка ошибок
     */
    handleError(error) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data.error || 'API Error',
                status: error.response.status
            };
        } else if (error.request) {
            return {
                success: false,
                error: 'Network Error',
                details: error.message
            };
        } else {
            return {
                success: false,
                error: 'Request Error',
                details: error.message
            };
        }
    }
}

module.exports = NewsAggregatorClient;
```

### Express.js middleware

```javascript
// middleware.js
const NewsAggregatorClient = require('./index');

function newsAggregatorMiddleware(config = {}) {
    const client = new NewsAggregatorClient(config);
    
    return (req, res, next) => {
        req.newsAggregator = client;
        next();
    };
}

module.exports = newsAggregatorMiddleware;
```

### Express.js приложение

```javascript
// app.js
const express = require('express');
const newsAggregatorMiddleware = require('./middleware');

const app = express();
app.use(express.json());

// Middleware для News Aggregator
app.use(newsAggregatorMiddleware({
    apiUrl: process.env.NEWS_AGGREGATOR_API_URL || 'http://localhost:8000',
    apiKey: process.env.NEWS_AGGREGATOR_API_KEY
}));

// Роут для парсинга новости
app.post('/api/parse-news', async (req, res) => {
    try {
        const { url, parsingRules } = req.body;
        
        const result = await req.newsAggregator.parseNews(url, parsingRules);
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Роут для публикации новости
app.post('/api/publish-news', async (req, res) => {
    try {
        const { title, content, networks } = req.body;
        
        const result = await req.newsAggregator.publishNews(title, content, {
            networks: networks || ['telegram']
        });
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Роут для получения статистики
app.get('/api/stats', async (req, res) => {
    try {
        const { period } = req.query;
        
        const result = await req.newsAggregator.getStats({
            period: period
        });
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

## Python интеграция

### pip пакет

```python
# setup.py
from setuptools import setup, find_packages

setup(
    name="news-aggregator-client",
    version="1.0.0",
    description="Python client for News Aggregator API",
    author="Your Name",
    author_email="your.email@example.com",
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0",
        "pydantic>=1.8.0"
    ],
    python_requires=">=3.8",
)
```

### Основной класс

```python
# news_aggregator_client.py
import requests
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, HttpUrl
import json

class ParseRequest(BaseModel):
    url: HttpUrl
    parsing_rules: Optional[Dict[str, Any]] = None

class ParaphraseRequest(BaseModel):
    text: str
    prompt: Optional[str] = None
    max_length: Optional[int] = None
    tone: Optional[str] = None
    style: Optional[str] = None

class PublishRequest(BaseModel):
    title: str
    content: str
    networks: List[str] = ["telegram"]
    tags: Optional[List[str]] = None
    schedule_time: Optional[str] = None
    image_url: Optional[str] = None
    link: Optional[str] = None

class NewsAggregatorClient:
    def __init__(self, api_url: str = "http://localhost:8000", api_key: Optional[str] = None):
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({
                'Authorization': f'Bearer {api_key}'
            })
        
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> Dict:
        """Выполнение HTTP запроса"""
        url = f"{self.api_url}{endpoint}"
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                params=params,
                timeout=30
            )
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e),
                'details': getattr(e, 'response', None)
            }
    
    def parse_news(self, url: str, parsing_rules: Optional[Dict] = None) -> Dict:
        """Парсинг новости с URL"""
        data = {'url': url}
        if parsing_rules:
            data['parsing_rules'] = parsing_rules
        
        return self._make_request('POST', '/parse', data)
    
    def paraphrase_text(self, text: str, **options) -> Dict:
        """Рерайтинг текста"""
        data = {
            'text': text,
            'prompt': options.get('prompt', ''),
            'max_length': options.get('max_length'),
            'tone': options.get('tone'),
            'style': options.get('style')
        }
        
        # Удаляем None значения
        data = {k: v for k, v in data.items() if v is not None}
        
        return self._make_request('POST', '/paraphrase', data)
    
    def publish_news(self, title: str, content: str, **options) -> Dict:
        """Публикация новости"""
        data = {
            'title': title,
            'content': content,
            'networks': options.get('networks', ['telegram']),
            'tags': options.get('tags', []),
            'schedule_time': options.get('schedule_time'),
            'image_url': options.get('image_url'),
            'link': options.get('link')
        }
        
        # Удаляем None значения
        data = {k: v for k, v in data.items() if v is not None}
        
        return self._make_request('POST', '/publish', data)
    
    def get_sources(self, **options) -> Dict:
        """Получение списка источников"""
        params = {}
        if 'active' in options:
            params['active'] = options['active']
        if 'limit' in options:
            params['limit'] = options['limit']
        if 'offset' in options:
            params['offset'] = options['offset']
        
        return self._make_request('GET', '/sources', params=params)
    
    def add_source(self, name: str, url: str, parsing_rules: Optional[Dict] = None) -> Dict:
        """Добавление нового источника"""
        data = {
            'name': name,
            'url': url,
            'parsing_rules': parsing_rules or {},
            'active': True
        }
        
        return self._make_request('POST', '/sources', data)
    
    def get_stats(self, **options) -> Dict:
        """Получение статистики"""
        params = {}
        if 'period' in options:
            params['period'] = options['period']
        if 'date_from' in options:
            params['date_from'] = options['date_from']
        if 'date_to' in options:
            params['date_to'] = options['date_to']
        
        return self._make_request('GET', '/stats', params=params)
    
    def health_check(self) -> Dict:
        """Проверка здоровья API"""
        return self._make_request('GET', '/health')

# Пример использования
if __name__ == "__main__":
    client = NewsAggregatorClient()
    
    # Парсинг новости
    result = client.parse_news("https://example.com/news")
    if result['success']:
        print(f"Заголовок: {result['data']['title']}")
        
        # Рерайтинг
        rewritten = client.paraphrase_text(
            result['data']['content'],
            prompt="Перепиши в деловом стиле"
        )
        
        if rewritten['success']:
            # Публикация
            publish_result = client.publish_news(
                result['data']['title'],
                rewritten['data']['rewritten_text']
            )
            
            if publish_result['success']:
                print("Новость успешно опубликована!")
```

### Django интеграция

```python
# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .news_aggregator_client import NewsAggregatorClient

# Инициализация клиента
client = NewsAggregatorClient(
    api_url=settings.NEWS_AGGREGATOR_API_URL,
    api_key=settings.NEWS_AGGREGATOR_API_KEY
)

@csrf_exempt
@require_http_methods(["POST"])
def parse_news(request):
    """API endpoint для парсинга новости"""
    try:
        data = json.loads(request.body)
        url = data.get('url')
        
        if not url:
            return JsonResponse({
                'success': False,
                'error': 'URL is required'
            }, status=400)
        
        result = client.parse_news(url, data.get('parsing_rules'))
        
        if result['success']:
            return JsonResponse(result)
        else:
            return JsonResponse(result, status=400)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def publish_news(request):
    """API endpoint для публикации новости"""
    try:
        data = json.loads(request.body)
        title = data.get('title')
        content = data.get('content')
        
        if not title or not content:
            return JsonResponse({
                'success': False,
                'error': 'Title and content are required'
            }, status=400)
        
        result = client.publish_news(
            title=title,
            content=content,
            networks=data.get('networks', ['telegram']),
            tags=data.get('tags', [])
        )
        
        if result['success']:
            return JsonResponse(result)
        else:
            return JsonResponse(result, status=400)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@require_http_methods(["GET"])
def get_stats(request):
    """API endpoint для получения статистики"""
    try:
        period = request.GET.get('period')
        
        result = client.get_stats(period=period)
        
        if result['success']:
            return JsonResponse(result)
        else:
            return JsonResponse(result, status=400)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
```

## JavaScript (Frontend) интеграция

### Vanilla JavaScript

```javascript
// news-aggregator.js
class NewsAggregatorFrontend {
    constructor(config = {}) {
        this.apiUrl = config.apiUrl || 'http://localhost:8000';
        this.apiKey = config.apiKey || null;
        this.timeout = config.timeout || 30000;
    }
    
    async makeRequest(endpoint, options = {}) {
        const url = `${this.apiUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async parseNews(url, parsingRules = {}) {
        const data = { url };
        if (Object.keys(parsingRules).length > 0) {
            data.parsing_rules = parsingRules;
        }
        
        return this.makeRequest('/parse', {
            method: 'POST',
            body: data
        });
    }
    
    async paraphraseText(text, options = {}) {
        const data = {
            text,
            prompt: options.prompt || '',
            max_length: options.maxLength,
            tone: options.tone,
            style: options.style
        };
        
        return this.makeRequest('/paraphrase', {
            method: 'POST',
            body: data
        });
    }
    
    async publishNews(title, content, options = {}) {
        const data = {
            title,
            content,
            networks: options.networks || ['telegram'],
            tags: options.tags || [],
            schedule_time: options.scheduleTime,
            image_url: options.imageUrl,
            link: options.link
        };
        
        return this.makeRequest('/publish', {
            method: 'POST',
            body: data
        });
    }
    
    async getSources(options = {}) {
        const params = new URLSearchParams();
        if (options.active !== undefined) {
            params.append('active', options.active);
        }
        if (options.limit) {
            params.append('limit', options.limit);
        }
        if (options.offset) {
            params.append('offset', options.offset);
        }
        
        const query = params.toString();
        const endpoint = query ? `/sources?${query}` : '/sources';
        
        return this.makeRequest(endpoint);
    }
    
    async getStats(options = {}) {
        const params = new URLSearchParams();
        if (options.period) {
            params.append('period', options.period);
        }
        if (options.dateFrom) {
            params.append('date_from', options.dateFrom);
        }
        if (options.dateTo) {
            params.append('date_to', options.dateTo);
        }
        
        const query = params.toString();
        const endpoint = query ? `/stats?${query}` : '/stats';
        
        return this.makeRequest(endpoint);
    }
}

// Пример использования
const aggregator = new NewsAggregatorFrontend({
    apiUrl: 'http://localhost:8000'
});

// Обработчик формы парсинга
document.getElementById('parseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('newsUrl').value;
    const result = await aggregator.parseNews(url);
    
    if (result.success) {
        document.getElementById('title').value = result.data.title;
        document.getElementById('content').value = result.data.content;
        
        // Показать предварительный просмотр
        document.getElementById('preview').style.display = 'block';
        document.getElementById('previewTitle').textContent = result.data.title;
        document.getElementById('previewContent').textContent = result.data.content;
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
    
    const result = await aggregator.publishNews(title, content, { networks });
    
    if (result.success) {
        alert('Новость успешно опубликована!');
        document.getElementById('publishForm').reset();
        document.getElementById('preview').style.display = 'none';
    } else {
        alert('Ошибка публикации: ' + result.error);
    }
});
```

### HTML интерфейс

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>News Aggregator Integration</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="url"], input[type="text"], textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        textarea {
            height: 100px;
            resize: vertical;
        }
        button {
            background-color: #007cba;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #005a87;
        }
        .preview {
            display: none;
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
        }
        .error {
            color: red;
            margin-top: 10px;
        }
        .success {
            color: green;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <h1>News Aggregator Integration</h1>
    
    <!-- Форма парсинга -->
    <div class="card">
        <h2>Парсинг новости</h2>
        <form id="parseForm">
            <div class="form-group">
                <label for="newsUrl">URL новости:</label>
                <input type="url" id="newsUrl" name="url" required>
            </div>
            <button type="submit">Парсить новость</button>
        </form>
    </div>
    
    <!-- Предварительный просмотр -->
    <div class="card preview" id="preview">
        <h2>Предварительный просмотр</h2>
        <div id="previewTitle"></div>
        <div id="previewContent"></div>
    </div>
    
    <!-- Форма публикации -->
    <div class="card">
        <h2>Публикация новости</h2>
        <form id="publishForm">
            <div class="form-group">
                <label for="title">Заголовок:</label>
                <input type="text" id="title" name="title" required>
            </div>
            <div class="form-group">
                <label for="content">Текст новости:</label>
                <textarea id="content" name="content" required></textarea>
            </div>
            <div class="form-group">
                <label>Социальные сети:</label>
                <div>
                    <input type="checkbox" id="telegram" name="networks" value="telegram" checked>
                    <label for="telegram">Telegram</label>
                </div>
                <div>
                    <input type="checkbox" id="vk" name="networks" value="vk">
                    <label for="vk">VK</label>
                </div>
            </div>
            <button type="submit">Опубликовать</button>
        </form>
    </div>
    
    <script src="news-aggregator.js"></script>
    <script>
        // Инициализация клиента
        const aggregator = new NewsAggregatorFrontend({
            apiUrl: 'http://localhost:8000'
        });
        
        // Обработчик формы парсинга
        document.getElementById('parseForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const url = document.getElementById('newsUrl').value;
            const result = await aggregator.parseNews(url);
            
            if (result.success) {
                document.getElementById('title').value = result.data.title;
                document.getElementById('content').value = result.data.content;
                
                // Показать предварительный просмотр
                document.getElementById('preview').style.display = 'block';
                document.getElementById('previewTitle').textContent = result.data.title;
                document.getElementById('previewContent').textContent = result.data.content;
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
            
            const result = await aggregator.publishNews(title, content, { networks });
            
            if (result.success) {
                alert('Новость успешно опубликована!');
                document.getElementById('publishForm').reset();
                document.getElementById('preview').style.display = 'none';
            } else {
                alert('Ошибка публикации: ' + result.error);
            }
        });
    </script>
</body>
</html>
```

## Заключение

Данные примеры показывают различные способы интеграции News Aggregator в ваши проекты. Выберите подходящий подход в зависимости от вашей технологии и требований.

Для получения дополнительной помощи обратитесь к основной документации проекта или создайте issue в репозитории. 