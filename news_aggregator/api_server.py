# news_aggregator/api_server.py
# FastAPI REST API для интеграции с сайтом

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import sys
import os

# Добавляем путь к модулям
sys.path.append(os.path.dirname(__file__))

from core.parser import parse_news
from core.publisher import publish_news
from core.paraphraser import paraphrase_text
from core.db import get_news_list, create_tables

# Создаем таблицы при запуске
create_tables()

app = FastAPI(title="News Aggregator API", version="1.0.0")

# Модели данных
class ParseRequest(BaseModel):
    parser_method: str = "newspaper3k"

class PublishRequest(BaseModel):
    news_id: int
    publish_vk: bool = True
    publish_tg: bool = True

class ParaphraseRequest(BaseModel):
    text: str
    prompt: Optional[str] = None

@app.post('/parse')
def parse(request: ParseRequest):
    """Парсинг новостей с указанным методом"""
    try:
        parsed = parse_news(request.parser_method)
        return {"status": "ok", "parsed": parsed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка парсинга: {str(e)}")

@app.post('/publish')
def publish(request: PublishRequest):
    """Публикация новости в выбранные платформы"""
    try:
        result = publish_news(request.news_id, request.publish_vk, request.publish_tg)
        return {"status": "ok", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка публикации: {str(e)}")

@app.post('/paraphrase')
def paraphrase(request: ParaphraseRequest):
    """Рерайтинг текста через DeepSeek API"""
    try:
        result = paraphrase_text(request.text, request.prompt)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка рерайтинга: {str(e)}")

@app.get('/news')
def news():
    """Получение списка новостей"""
    try:
        news_list = get_news_list()
        return {"news": news_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения новостей: {str(e)}")

@app.get('/health')
def health():
    """Проверка состояния API"""
    return {"status": "ok", "message": "API работает"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 