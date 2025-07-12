import sqlite3

DB_PATH = 'aggregators.db'

with sqlite3.connect(DB_PATH) as conn:
    c = conn.cursor()
    # 1. Переименовать старую таблицу
    c.execute('ALTER TABLE aggregator_sites RENAME TO aggregator_sites_old')
    # 2. Создать новую таблицу без parsing_rules_json
    c.execute('''
        CREATE TABLE aggregator_sites (
            id INTEGER PRIMARY KEY,
            name TEXT UNIQUE,
            url TEXT UNIQUE,
            active INTEGER
        )
    ''')
    # 3. Перенести данные
    c.execute('''
        INSERT INTO aggregator_sites (id, name, url, active)
        SELECT id, name, url, active FROM aggregator_sites_old
    ''')
    # 4. Удалить старую таблицу
    c.execute('DROP TABLE aggregator_sites_old')
    conn.commit()
print('Миграция завершена: parsing_rules_json удалён.') 