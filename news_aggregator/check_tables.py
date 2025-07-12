import sqlite3

DB_PATH = 'aggregators.db'

with sqlite3.connect(DB_PATH) as conn:
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = c.fetchall()
    print('Таблицы в базе данных:')
    for t in tables:
        print('-', t[0]) 