# news_aggregator/api_server.py
# FastAPI REST API для интеграции с сайтом

from fastapi import FastAPI
from news_aggregator.core.parser import parse_news
from news_aggregator.core.publisher import publish_news
from news_aggregator.core.paraphraser import paraphrase_text
from news_aggregator.core.db import get_news_list

app = FastAPI()

@app.post('/parse')
def parse():
	parsed = parse_news()
	return {"status": "ok", "parsed": parsed}

@app.post('/publish')
def publish(news_id: int, publish_vk: bool = True, publish_tg: bool = True):
	result = publish_news(news_id, publish_vk, publish_tg)
	return {"status": "ok", "result": result}

@app.post('/paraphrase')
def paraphrase(text: str, prompt: str = None):
	return {"result": paraphrase_text(text, prompt)}

@app.get('/news')
def news():
	return {"news": get_news_list()} 