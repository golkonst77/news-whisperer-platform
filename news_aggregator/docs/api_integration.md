# Интеграция новостного агрегатора с сайтом через REST API

## Запуск API-сервера

1. Установите FastAPI и Uvicorn:
   ```bash
   pip install fastapi uvicorn
   ```
2. Запустите сервер:
   ```bash
   uvicorn news_aggregator.api_server:app --reload
   ```
   По умолчанию сервер будет доступен на http://127.0.0.1:8000

## Эндпоинты API

- `POST /parse` — запустить парсинг новостей
- `POST /publish` — опубликовать новость в VK/Telegram
- `POST /paraphrase` — сделать рерайтинг текста
- `GET /news` — получить список новостей

## Пример запроса на публикацию (PHP)
```php
<?php
$data = [
  'news_id' => 123,
  'publish_vk' => true,
  'publish_tg' => true
];
$options = [
  'http' => [
    'header'  => "Content-type: application/json\r\n",
    'method'  => 'POST',
    'content' => json_encode($data),
  ],
];
$context  = stream_context_create($options);
$result = file_get_contents('http://localhost:8000/publish', false, $context);
echo $result;
?>
```

## Пример запроса на публикацию (Node.js)
```js
const axios = require('axios');
axios.post('http://localhost:8000/publish', {
  news_id: 123,
  publish_vk: true,
  publish_tg: true
}).then(res => console.log(res.data));
```

## Безопасность
- Для production рекомендуется ограничить доступ к API по IP или токену.
- Не размещайте сервер с открытым API в интернете без авторизации!

## Использование вместе с GUI
- GUI-приложение продолжает работать как раньше.
- Бизнес-логика не дублируется: и GUI, и API используют одни и те же функции из модуля `core`.

---
Если потребуется расширить API или добавить новые функции — просто добавьте новые методы в FastAPI и используйте их на сайте. 