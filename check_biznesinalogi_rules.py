import sqlite3
import json

# Подключаемся к базе данных
conn = sqlite3.connect('aggregators.db')
cursor = conn.cursor()

# Ищем сайт biznesinalogi.ru
cursor.execute("SELECT name, url, parsing_rules_json FROM aggregator_sites WHERE url LIKE '%biznesinalogi.ru%'")
rows = cursor.fetchall()

if rows:
    print("Найдены записи для biznesinalogi.ru:")
    for row in rows:
        name, url, rules_json = row
        print(f"\nНазвание: {name}")
        print(f"URL: {url}")
        print("Правила парсинга:")
        try:
            rules = json.loads(rules_json)
            for key, value in rules.items():
                print(f"  {key}: {value}")
        except json.JSONDecodeError as e:
            print(f"  Ошибка парсинга JSON: {e}")
            print(f"  Сырые данные: {rules_json}")
else:
    print("Сайт biznesinalogi.ru не найден в базе данных.")
    
    # Покажем все сайты в базе
    cursor.execute("SELECT name, url FROM aggregator_sites")
    all_sites = cursor.fetchall()
    if all_sites:
        print("\nВсе сайты в базе данных:")
        for name, url in all_sites:
            print(f"  {name}: {url}")
    else:
        print("База данных пуста.")

conn.close() 