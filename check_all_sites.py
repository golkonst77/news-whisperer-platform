import sqlite3
import json

# Подключаемся к базе данных
conn = sqlite3.connect('news_aggregator/aggregators.db')
cursor = conn.cursor()

# Покажем все сайты в базе
cursor.execute("SELECT id, name, url, active, parsing_rules_json FROM aggregator_sites")
all_sites = cursor.fetchall()

if all_sites:
    print("Все сайты в базе данных:")
    for row in all_sites:
        site_id, name, url, active, rules_json = row
        status = "Активен" if active else "Отключен"
        print(f"\nID: {site_id}")
        print(f"Название: {name}")
        print(f"URL: {url}")
        print(f"Статус: {status}")
        if rules_json:
            try:
                rules = json.loads(rules_json)
                print("Правила парсинга:")
                for key, value in rules.items():
                    print(f"  {key}: {value}")
            except json.JSONDecodeError as e:
                print(f"  Ошибка парсинга JSON: {e}")
                print(f"  Сырые данные: {rules_json}")
        else:
            print("Правила парсинга: не заданы")
else:
    print("База данных пуста.")

conn.close() 