from main import create_tables
create_tables()

import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
from main import DB_PATH, parse_news, post_to_vk, get_active_aggregator_sites, add_aggregator_site, post_to_telegram
import sqlite3
import threading
from tkinter.scrolledtext import ScrolledText
import webbrowser
import openai
import os
import requests
from bs4 import BeautifulSoup, Tag
import urllib.parse
import difflib
import tkinter.font as tkfont

OPENAI_API_KEY = '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'

def paraphrase_text_gpt(text, prompt=None):
    api_key = os.getenv('DEEPSEEK_API_KEY')
    url = 'https://api.deepseek.com/v1/chat/completions'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    if prompt is None:
        prompt = 'Перепиши этот текст своими словами, сохраняя смысл и структуру:\n\n'
    data = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "user", "content": f"{prompt}{text}"}
        ],
        "max_tokens": 1024,
        "temperature": 0.8
    }
    try:
        response = requests.post(url, headers=headers, json=data, timeout=20)
        response.raise_for_status()
        result = response.json()
        return result['choices'][0]['message']['content'].strip()
    except Exception as e:
        return f"[Ошибка DeepSeek: {e}]\n\n{text}"

class NewsAggregatorGUI(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title('Агрегатор новостей (бухгалтерские услуги)')
        self.geometry('1200x600')
        self.configure(bg='#1A1A1A')
        self.paraphrase_prompt = 'Перепиши этот текст своими словами, сохраняя смысл и структуру:\n\n'
        self._apply_dark_theme()
        self.parser_method = tk.StringVar(value='newspaper3k')
        self.create_widgets()
        self.refresh_news_list()
        self.refresh_aggregators_list()

    def _apply_dark_theme(self):
        style = ttk.Style()
        style.theme_use('default')
        # Фон
        style.configure('.', background='#1A1A1A', foreground='#FFFFFF', font=('Sans-serif', 12))
        style.configure('TFrame', background='#1A1A1A')
        style.configure('TLabel', background='#1A1A1A', foreground='#FFFFFF', font=('Sans-serif', 12))
        style.configure('Treeview', background='#2C2C2C', foreground='#FFFFFF', fieldbackground='#2C2C2C', bordercolor='#404040', font=('Sans-serif', 12))
        style.configure('Treeview.Heading', background='#242424', foreground='#A0A0A0', font=('Sans-serif', 13, 'bold'))
        style.map('Treeview', background=[('selected', '#4CAF50')], foreground=[('selected', '#FFFFFF')])
        style.configure('TButton', background='#4CAF50', foreground='#FFFFFF', borderwidth=0, focusthickness=3, focuscolor='#4CAF50', font=('Sans-serif', 12, 'bold'))
        style.map('TButton', background=[('active', '#388E3C'), ('pressed', '#388E3C')])
        style.configure('TCheckbutton', background='#1A1A1A', foreground='#A0A0A0', font=('Sans-serif', 12))
        style.configure('Horizontal.TProgressbar', background='#4CAF50', troughcolor='#2C2C2C', bordercolor='#404040')
        # Для Entry и Text вручную
        self.default_font = tkfont.Font(family='Sans-serif', size=10)
        self.heading_font = tkfont.Font(family='Sans-serif', size=13, weight='bold')
        self.body_font = tkfont.Font(family='Sans-serif', size=10)

    def create_widgets(self):
        # Двухпанельный интерфейс
        paned = tk.PanedWindow(self, orient='horizontal', sashrelief='raised', bg='#1A1A1A')
        paned.pack(fill='both', expand=True)

        # Левая панель — новости
        left_frame = tk.Frame(paned, bg='#1A1A1A')
        paned.add(left_frame, minsize=700)
        btn_frame = tk.Frame(left_frame, bg='#1A1A1A')
        btn_frame.pack(fill='x', pady=5)
        tk.Button(btn_frame, text='Запустить парсинг', command=self.run_parsing, bg='#4CAF50', fg='#FFFFFF', font=self.body_font, activebackground='#388E3C', activeforeground='#FFFFFF', bd=0, highlightthickness=0, padx=6, pady=2).pack(side='left', padx=3)
        tk.Button(btn_frame, text='Обновить список', command=self.refresh_news_list, bg='#4CAF50', fg='#FFFFFF', font=self.body_font, activebackground='#388E3C', activeforeground='#FFFFFF', bd=0, highlightthickness=0, padx=6, pady=2).pack(side='left', padx=3)
        tk.Button(btn_frame, text='Настроить prompt', command=self.edit_paraphrase_prompt, bg='#4CAF50', fg='#FFFFFF', font=self.body_font, activebackground='#388E3C', activeforeground='#FFFFFF', bd=0, highlightthickness=0, padx=6, pady=2).pack(side='left', padx=3)
        def on_parser_method_change():
            print('[DEBUG] Выбран способ парсинга:', self.parser_method.get())
            self.parser_method_label.config(text=f'Текущий способ: {self.parser_method.get()}')
        tk.Label(btn_frame, text='Способ парсинга:', bg='#1A1A1A', fg='#A0A0A0', font=self.body_font).pack(side='left', padx=(10, 0))
        tk.Radiobutton(
            btn_frame, text='newspaper3k', variable=self.parser_method, value='newspaper3k',
            bg='#1A1A1A', fg='#A0A0A0', font=self.body_font,
            activebackground='#2C2C2C', activeforeground='#4CAF50',
            indicatoron=True, relief='flat', highlightthickness=0, borderwidth=0,
            state='normal', command=on_parser_method_change
        ).pack(side='left')
        tk.Radiobutton(
            btn_frame, text='readability-lxml', variable=self.parser_method, value='readability-lxml',
            bg='#1A1A1A', fg='#A0A0A0', font=self.body_font,
            activebackground='#2C2C2C', activeforeground='#4CAF50',
            indicatoron=True, relief='flat', highlightthickness=0, borderwidth=0,
            state='normal', command=on_parser_method_change
        ).pack(side='left')
        self.parser_method_label = tk.Label(btn_frame, text=f'Текущий способ: {self.parser_method.get()}', bg='#1A1A1A', fg='#4CAF50', font=self.body_font)
        self.parser_method_label.pack(side='left', padx=(10,0))
        columns = ('id', 'title', 'publish_date', 'source_name', 'published_vk', 'published_tg')
        self.tree = ttk.Treeview(left_frame, columns=columns, show='headings', height=20, selectmode='extended', style='Treeview')
        self.tree.heading('id', text='ID')
        self.tree.heading('title', text='Заголовок')
        self.tree.heading('publish_date', text='Дата публикации')
        self.tree.heading('source_name', text='Сайт')
        self.tree.heading('published_vk', text='ВК')
        self.tree.heading('published_tg', text='ТГ')
        self.tree.column('id', width=40)
        self.tree.column('title', width=400)
        self.tree.column('publish_date', width=120)
        self.tree.column('source_name', width=120)
        self.tree.column('published_vk', width=40, anchor='center')
        self.tree.column('published_tg', width=40, anchor='center')
        self.tree.pack(fill='both', expand=True, padx=10, pady=5)
        self.tree.bind('<Double-1>', self.show_news_details)
        self.publish_vk_var = tk.BooleanVar(value=True)
        self.publish_tg_var = tk.BooleanVar(value=False)
        self.status_label = tk.Label(left_frame, text='', anchor='w', fg='#4CAF50', bg='#1A1A1A', font=self.body_font)
        self.status_label.pack(fill='x', padx=10, pady=(0, 5))
        action_frame = tk.Frame(left_frame, bg='#1A1A1A')
        action_frame.pack(pady=5)
        tk.Checkbutton(action_frame, text='VK', variable=self.publish_vk_var, bg='#1A1A1A', fg='#A0A0A0', selectcolor='#FFFFFF', font=self.body_font, activebackground='#1A1A1A', activeforeground='#4CAF50', padx=2, pady=0).pack(side='left', padx=3)
        tk.Checkbutton(action_frame, text='Telegram', variable=self.publish_tg_var, bg='#1A1A1A', fg='#A0A0A0', selectcolor='#FFFFFF', font=self.body_font, activebackground='#1A1A1A', activeforeground='#4CAF50', padx=2, pady=0).pack(side='left', padx=3)
        self.do_rewrite_var = tk.BooleanVar(value=True)
        tk.Checkbutton(action_frame, text='Делать рерайтинг', variable=self.do_rewrite_var, bg='#1A1A1A', fg='#A0A0A0', selectcolor='#FFFFFF', font=self.body_font, activebackground='#1A1A1A', activeforeground='#4CAF50', padx=2, pady=0).pack(side='left', padx=3)
        tk.Button(action_frame, text='Опубликовать выбранные новости', command=self.publish_selected_news, bg='#4CAF50', fg='#FFFFFF', font=self.body_font, activebackground='#388E3C', activeforeground='#FFFFFF', bd=0, highlightthickness=0, padx=6, pady=2).pack(side='left', padx=6)
        tk.Button(action_frame, text='Удалить выбранные новости', command=self.delete_selected_news, bg='#4CAF50', fg='#FFFFFF', font=self.body_font, activebackground='#388E3C', activeforeground='#FFFFFF', bd=0, highlightthickness=0, padx=6, pady=2).pack(side='left', padx=6)
        tk.Button(action_frame, text='Удалить все новости', command=self.delete_all_news, bg='#4CAF50', fg='#FFFFFF', font=self.body_font, activebackground='#388E3C', activeforeground='#FFFFFF', bd=0, highlightthickness=0, padx=6, pady=2).pack(side='left', padx=6)
        self.progress = ttk.Progressbar(left_frame, orient='horizontal', length=500, mode='determinate', style='Horizontal.TProgressbar')
        self.progress.pack(side='bottom', pady=2)
        self.progress['value'] = 0
        self.progress['maximum'] = 100
        self.progress.pack_forget()
        right_frame = tk.Frame(paned, bg='#1A1A1A')
        paned.add(right_frame, minsize=350)
        tk.Label(right_frame, text='Сайты-агрегаторы', font=self.heading_font, bg='#1A1A1A', fg='#FFFFFF').pack(pady=5)
        right_btn_frame = tk.Frame(right_frame, bg='#1A1A1A')
        right_btn_frame.pack(fill='x', pady=2)
        tk.Button(right_btn_frame, text='Добавить сайт-агрегатор', command=self.add_aggregator_dialog, bg='#4CAF50', fg='#FFFFFF', font=self.body_font, activebackground='#388E3C', activeforeground='#FFFFFF', bd=0, highlightthickness=0).pack(side='left', padx=2)
        tk.Button(right_btn_frame, text='Обновить', command=self.refresh_aggregators_list, bg='#4CAF50', fg='#FFFFFF', font=self.body_font, activebackground='#388E3C', activeforeground='#FFFFFF', bd=0, highlightthickness=0).pack(side='left', padx=2)
        self.agg_tree = ttk.Treeview(right_frame, columns=('id', 'name', 'url', 'active'), show='headings', height=18, style='Treeview')
        self.agg_tree.heading('id', text='ID')
        self.agg_tree.heading('name', text='Название')
        self.agg_tree.heading('url', text='URL')
        self.agg_tree.heading('active', text='Статус')
        self.agg_tree.column('id', width=30)
        self.agg_tree.column('name', width=120)
        self.agg_tree.column('url', width=150)
        self.agg_tree.column('active', width=50, anchor='center')
        self.agg_tree.pack(fill='both', expand=True, padx=5, pady=5)
        agg_action_frame = tk.Frame(right_frame, bg='#1A1A1A')
        agg_action_frame.pack(fill='x', pady=2)
        tk.Button(agg_action_frame, text='Включить', command=self.activate_selected_aggregator, bg='#4CAF50', fg='#FFFFFF', font=self.body_font, activebackground='#388E3C', activeforeground='#FFFFFF', bd=0, highlightthickness=0).pack(side='left', padx=2)
        tk.Button(agg_action_frame, text='Отключить', command=self.deactivate_selected_aggregator, bg='#4CAF50', fg='#FFFFFF', font=self.body_font, activebackground='#388E3C', activeforeground='#FFFFFF', bd=0, highlightthickness=0).pack(side='left', padx=2)
        tk.Button(agg_action_frame, text='Удалить', command=self.delete_selected_aggregator, bg='#4CAF50', fg='#FFFFFF', font=self.body_font, activebackground='#388E3C', activeforeground='#FFFFFF', bd=0, highlightthickness=0).pack(side='left', padx=2)
        tk.Button(agg_action_frame, text='Редактировать', command=self.edit_selected_aggregator, bg='#4CAF50', fg='#FFFFFF', font=self.body_font, activebackground='#388E3C', activeforeground='#FFFFFF', bd=0, highlightthickness=0).pack(side='left', padx=2)

    def refresh_news_list(self):
        for row in self.tree.get_children():
            self.tree.delete(row)
        try:
            with sqlite3.connect(DB_PATH) as conn:
                c = conn.cursor()
                c.execute('SELECT id, title, publish_date, source_id, published_vk, published_tg FROM news ORDER BY id DESC LIMIT 100')
                for row in c.fetchall():
                    # Получаем имя сайта по source_id
                    c2 = conn.cursor()
                    c2.execute('SELECT name FROM aggregator_sites WHERE id=?', (row[3],))
                    site_name = c2.fetchone()
                    site_name = site_name[0] if site_name else ''
                    self.tree.insert('', 'end', values=(row[0], row[1], row[2], site_name, row[4], row[5]))
        except Exception as e:
            messagebox.showerror('Ошибка', f'Ошибка загрузки новостей: {e}')

    def refresh_aggregators_list(self):
        for row in self.agg_tree.get_children():
            self.agg_tree.delete(row)
        try:
            with sqlite3.connect(DB_PATH) as conn:
                c = conn.cursor()
                c.execute('SELECT id, name, url, active FROM aggregator_sites ORDER BY id DESC')
                for row in c.fetchall():
                    status = 'Активен' if row[3] else 'Отключен'
                    self.agg_tree.insert('', 'end', values=(row[0], row[1], row[2], status))
        except Exception as e:
            messagebox.showerror('Ошибка', f'Ошибка загрузки агрегаторов: {e}')

    def run_parsing(self):
        # Передаём выбранный способ парсинга
        method = self.parser_method.get()
        threading.Thread(target=lambda: self._run_parsing_with_progress(method), daemon=True).start()

    def _run_parsing_with_progress(self, parser_method):
        self.progress.pack(side='bottom')
        self.status_label.config(text='Подготовка...')
        self.progress['value'] = 0
        self.progress.update()
        self.update()
        news = []
        sites = get_active_aggregator_sites()
        total = 0
        for site in sites:
            url = site['url']
            source_id = site['id']
            try:
                import requests
                from bs4 import BeautifulSoup
                import urllib.parse
                resp = requests.get(url, timeout=10)
                if resp.status_code != 200:
                    continue
                soup = BeautifulSoup(resp.text, 'html.parser')
                base_url = urllib.parse.urlparse(url)
                found_links = set()
                for a in soup.find_all('a', href=True):
                    if not isinstance(a, Tag):
                        continue
                    href = a.get('href')
                    if isinstance(href, list):
                        href = href[0]
                    link = urllib.parse.urljoin(url, href)
                    parsed_link = urllib.parse.urlparse(link)
                    if parsed_link.netloc == base_url.netloc and link not in found_links:
                        found_links.add(link)
                total += len(found_links)
            except Exception:
                continue
        if total == 0:
            self.status_label.config(text='Нет новостей для парсинга.')
            self.progress.pack_forget()
            return
        self.progress['maximum'] = total
        self.progress['value'] = 0
        self.progress.update()
        self.update()
        processed = 0
        for site in sites:
            url = site['url']
            source_id = site['id']
            try:
                import requests
                from bs4 import BeautifulSoup
                import urllib.parse
                resp = requests.get(url, timeout=10)
                if resp.status_code != 200:
                    continue
                soup = BeautifulSoup(resp.text, 'html.parser')
                base_url = urllib.parse.urlparse(url)
                found_links = set()
                for a in soup.find_all('a', href=True):
                    if not isinstance(a, Tag):
                        continue
                    href = a.get('href')
                    if isinstance(href, list):
                        href = href[0]
                    link = urllib.parse.urljoin(url, href)
                    parsed_link = urllib.parse.urlparse(link)
                    if parsed_link.netloc == base_url.netloc and link not in found_links:
                        found_links.add(link)
                links = list(found_links)
                # Ограничение на 5 новостей
                links = links[:5]
                for link in links:
                    if parser_method == 'readability-lxml':
                        from main import get_full_article_details_readability, save_news_item, is_news_url
                        details = get_full_article_details_readability(link)
                    else:
                        from main import get_full_article_details, save_news_item, is_news_url
                        details = get_full_article_details(link)
                    full_text = details.get('full_text')
                    title = details.get('title', link)
                    # Отладочный вывод
                    text_len = len(full_text.replace('\n','').replace('\r','').strip()) if full_text else 0
                    print(f"[DEBUG] {link} | Длина: {text_len}")
                    if not is_news_url(link, title):
                        print(f"[DEBUG] ОТФИЛЬТРОВАНО ПО КЛЮЧЕВЫМ СЛОВАМ: {link} | {title}")
                        continue
                    if full_text and 100 <= text_len <= 3000:
                        news_item = {
                            'source_id': source_id,
                            'source_name': site['name'],
                            'source_url': url,
                            'title': title,
                            'link': link,
                            'full_text': full_text,
                            'publish_date': details.get('publish_date')
                        }
                        save_news_item(news_item)
                    else:
                        print(f"[DEBUG] ОТФИЛЬТРОВАНО ПО ДЛИНЕ: {link} | {text_len} символов")
                    processed += 1
                    self.progress['value'] = processed
                    self.status_label.config(text=f'Обработано {processed} из {total}')
                    self.progress.update()
                    self.update()
            except Exception:
                continue
        self.status_label.config(text=f'Парсинг завершён. Новых новостей: {processed}')
        self.progress['value'] = self.progress['maximum']
        self.progress.update()
        self.update()
        import time
        time.sleep(2)
        self.progress.pack_forget()
        self.refresh_news_list()

    def publish_selected_news(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning('Внимание', 'Выберите одну или несколько новостей для публикации!')
            return
        publish_vk = self.publish_vk_var.get()
        publish_tg = self.publish_tg_var.get()
        do_rewrite = self.do_rewrite_var.get()
        if not (publish_vk or publish_tg):
            messagebox.showwarning('Внимание', 'Отметьте хотя бы одну платформу для публикации!')
            return
        errors = []
        for item in selected:
            values = self.tree.item(item, 'values')
            news_id = values[0]
            try:
                with sqlite3.connect(DB_PATH) as conn:
                    c = conn.cursor()
                    c.execute('SELECT id, title, link, full_text, publish_date, published_vk, published_tg FROM news WHERE id=?', (news_id,))
                    row = c.fetchone()
                    if not row:
                        continue
                    news_item = {
                        'id': row[0],
                        'title': row[1],
                        'link': row[2],
                        'full_text': row[3],
                        'publish_date': row[4]
                    }
                    # Только для одной новости показываем окно сравнения
                    if len(selected) == 1 and do_rewrite:
                        orig_title = news_item['title']
                        orig_text = news_item['full_text']
                        rewritten_title = paraphrase_text_gpt(orig_title, self.paraphrase_prompt)
                        rewritten_text = paraphrase_text_gpt(orig_text, self.paraphrase_prompt)
                        dialog = DiffDialog(self, orig_title, orig_text, rewritten_title, rewritten_text)
                        self.wait_window(dialog)
                        if dialog.result is None:
                            return
                        new_title, new_text = dialog.result
                        news_item['title'] = new_title
                        news_item['full_text'] = new_text
                        # Сохраняем изменения в базу
                        c.execute('UPDATE news SET title=?, full_text=? WHERE id=?', (new_title, new_text, news_id))
                        conn.commit()
                    elif len(selected) == 1:
                        # Обычное окно редактирования (без рерайта)
                        orig_text = news_item['full_text'] or news_item['title']
                        edit_win = tk.Toplevel(self)
                        edit_win.title('Редактирование текста перед публикацией')
                        edit_win.geometry('700x400')
                        tk.Label(edit_win, text='Отредактируйте текст перед публикацией:', font=('Arial', 12)).pack(pady=5)
                        text_box = tk.Text(edit_win, wrap='word', width=80, height=15)
                        text_box.pack(padx=10, pady=10, fill='both', expand=True)
                        text_box.insert('1.0', orig_text)
                        def on_publish():
                            new_text = text_box.get('1.0', 'end').strip()
                            news_item['full_text'] = new_text
                            edit_win.destroy()
                            c.execute('UPDATE news SET full_text=? WHERE id=?', (new_text, news_id))
                            conn.commit()
                            # VK
                            if publish_vk:
                                if row[5] != 1:
                                    ok = post_to_vk(news_item, news_id)
                                    if ok:
                                        c.execute('UPDATE news SET published_vk=1 WHERE id=?', (news_id,))
                                        conn.commit()
                                    else:
                                        errors.append(f'Не удалось опубликовать в VK: {news_item["title"]}')
                            # Telegram
                            if publish_tg:
                                if row[6] != 1:
                                    result = post_to_telegram(news_item)
                                    if result:
                                        c.execute('UPDATE news SET published_tg=1 WHERE id=?', (news_id,))
                                        conn.commit()
                                    else:
                                        errors.append(f'Не удалось опубликовать в Telegram: {news_item["title"]}')
                            self.refresh_news_list()
                        tk.Button(edit_win, text='Опубликовать', command=on_publish).pack(side='left', padx=10, pady=5)
                        tk.Button(edit_win, text='Отмена', command=edit_win.destroy).pack(side='right', padx=10, pady=5)
                        edit_win.grab_set()
                        self.wait_window(edit_win)
                        break
                    else:
                        # Множественная публикация — без окна редактирования
                        # VK
                        if publish_vk:
                            if row[5] == 1:
                                pass  # Уже опубликовано
                            else:
                                ok = post_to_vk(news_item, news_id)
                                if ok:
                                    c.execute('UPDATE news SET published_vk=1 WHERE id=?', (news_id,))
                                    conn.commit()
                                else:
                                    errors.append(f'Не удалось опубликовать в VK: {news_item["title"]}')
                        # Telegram
                        if publish_tg:
                            if row[6] == 1:
                                pass  # Уже опубликовано
                            else:
                                result = post_to_telegram(news_item)
                                if result:
                                    c.execute('UPDATE news SET published_tg=1 WHERE id=?', (news_id,))
                                    conn.commit()
                                else:
                                    errors.append(f'Не удалось опубликовать в Telegram: {news_item["title"]}')
            except Exception as e:
                errors.append(f'Ошибка публикации новости {news_id}: {e}')
        self.refresh_news_list()
        if errors:
            messagebox.showerror('Ошибки публикации', '\n'.join(errors))
        else:
            messagebox.showinfo('Успех', 'Публикация завершена!')

    def publish_selected_vk(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning('Внимание', 'Выберите новость для публикации!')
            return
        item = self.tree.item(selected[0])
        news_id = item['values'][0]
        # Получаем все данные новости
        try:
            with sqlite3.connect(DB_PATH) as conn:
                c = conn.cursor()
                c.execute('SELECT title, link, full_text, publish_date, published_vk FROM news WHERE id=?', (news_id,))
                row = c.fetchone()
                if not row:
                    messagebox.showerror('Ошибка', 'Новость не найдена в базе данных.')
                    return
                if row[4] == 1:
                    messagebox.showinfo('Информация', 'Эта новость уже опубликована в VK.')
                    return
                news_item = {
                    'title': row[0],
                    'link': row[1],
                    'full_text': row[2],
                    'publish_date': row[3]
                }
                # --- Временно: публикация без рерайта ---
                orig_text = news_item['full_text'] or news_item['title']
                # paraphrased = paraphrase_text_gpt(orig_text)  # Отключено временно
                paraphrased = orig_text
                # Окно для ручной правки
                edit_win = tk.Toplevel(self)
                edit_win.title('Редактирование текста перед публикацией')
                edit_win.geometry('700x400')
                tk.Label(edit_win, text='Отредактируйте текст перед публикацией в VK:', font=('Arial', 12)).pack(pady=5)
                text_box = tk.Text(edit_win, wrap='word', width=80, height=15)
                text_box.pack(padx=10, pady=10, fill='both', expand=True)
                text_box.insert('1.0', paraphrased)
                def on_publish():
                    new_text = text_box.get('1.0', 'end').strip()
                    news_item['full_text'] = new_text
                    edit_win.destroy()
                    ok = post_to_vk(news_item, news_id)
                    if ok:
                        messagebox.showinfo('Успех', 'Новость опубликована в VK!')
                    else:
                        messagebox.showerror('Ошибка', 'Не удалось опубликовать новость в VK.')
                    self.refresh_news_list()
                tk.Button(edit_win, text='Опубликовать', command=on_publish).pack(side='left', padx=10, pady=5)
                tk.Button(edit_win, text='Отмена', command=edit_win.destroy).pack(side='right', padx=10, pady=5)
        except Exception as e:
            messagebox.showerror('Ошибка', f'Ошибка публикации: {e}')

    def publish_selected_telegram(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning('Внимание', 'Выберите одну или несколько новостей для публикации в Telegram.')
            return
        for item in selected:
            values = self.tree.item(item, 'values')
            news_id = values[0]
            try:
                with sqlite3.connect(DB_PATH) as conn:
                    c = conn.cursor()
                    c.execute('SELECT id, title, link, full_text, publish_date FROM news WHERE id=?', (news_id,))
                    row = c.fetchone()
                    if not row:
                        continue
                    news_item = {
                        'id': row[0],
                        'title': row[1],
                        'link': row[2],
                        'full_text': row[3],
                        'publish_date': row[4]
                    }
                    result = post_to_telegram(news_item)
                    if result:
                        c.execute('UPDATE news SET published_tg=1 WHERE id=?', (news_id,))
                        conn.commit()
            except Exception as e:
                messagebox.showerror('Ошибка', f'Не удалось опубликовать новость в Telegram.\n{e}')
        self.refresh_news_list()

    def add_aggregator_dialog(self):
        dialog = AddAggregatorDialog(self)
        self.wait_window(dialog)
        if not dialog.result:
            return
        name, url = dialog.result
        try:
            add_aggregator_site(name, url, active=1)
            messagebox.showinfo('Успех', 'Сайт-агрегатор добавлен!')
        except Exception as e:
            messagebox.showerror('Ошибка', f'Ошибка добавления сайта: {e}')

    def deactivate_selected_aggregator(self):
        selected = self.agg_tree.selection()
        if not selected:
            messagebox.showwarning('Внимание', 'Выберите агрегатор для отключения!')
            return
        item = self.agg_tree.item(selected[0])
        agg_id = item['values'][0]
        try:
            with sqlite3.connect(DB_PATH) as conn:
                c = conn.cursor()
                c.execute('UPDATE aggregator_sites SET active=0 WHERE id=?', (agg_id,))
                conn.commit()
            self.refresh_aggregators_list()
        except Exception as e:
            messagebox.showerror('Ошибка', f'Ошибка отключения агрегатора: {e}')

    def delete_selected_aggregator(self):
        selected = self.agg_tree.selection()
        if not selected:
            messagebox.showwarning('Внимание', 'Выберите агрегатор для удаления!')
            return
        item = self.agg_tree.item(selected[0])
        agg_id = item['values'][0]
        if not messagebox.askyesno('Подтвердите', 'Удалить выбранный агрегатор?'):
            return
        try:
            with sqlite3.connect(DB_PATH) as conn:
                c = conn.cursor()
                c.execute('DELETE FROM aggregator_sites WHERE id=?', (agg_id,))
                conn.commit()
            self.refresh_aggregators_list()
        except Exception as e:
            messagebox.showerror('Ошибка', f'Ошибка удаления агрегатора: {e}')

    def edit_selected_aggregator(self):
        selected = self.agg_tree.selection()
        if not selected:
            messagebox.showwarning('Внимание', 'Выберите агрегатор для редактирования!')
            return
        item = self.agg_tree.item(selected[0])
        agg_id = item['values'][0]
        # Получаем текущие данные агрегатора
        try:
            with sqlite3.connect(DB_PATH) as conn:
                c = conn.cursor()
                c.execute('SELECT name, url FROM aggregator_sites WHERE id=?', (agg_id,))
                row = c.fetchone()
                if not row:
                    messagebox.showerror('Ошибка', 'Агрегатор не найден в базе данных.')
                    return
                name, url = row
        except Exception as e:
            messagebox.showerror('Ошибка', f'Ошибка чтения агрегатора: {e}')
            return
        # Открываем диалог с заполненными полями
        dialog = AddAggregatorDialog(self, name, url)
        self.wait_window(dialog)
        if not dialog.result:
            return
        new_name, new_url = dialog.result
        try:
            with sqlite3.connect(DB_PATH) as conn:
                c = conn.cursor()
                c.execute('UPDATE aggregator_sites SET name=?, url=? WHERE id=?', (new_name, new_url, agg_id))
                conn.commit()
            messagebox.showinfo('Успех', 'Агрегатор обновлён!')
            self.refresh_aggregators_list()
        except Exception as e:
            messagebox.showerror('Ошибка', f'Ошибка обновления агрегатора: {e}')

    def activate_selected_aggregator(self):
        selected = self.agg_tree.selection()
        if not selected:
            messagebox.showwarning('Внимание', 'Выберите агрегатор для включения!')
            return
        item = self.agg_tree.item(selected[0])
        agg_id = item['values'][0]
        try:
            with sqlite3.connect(DB_PATH) as conn:
                c = conn.cursor()
                c.execute('UPDATE aggregator_sites SET active=1 WHERE id=?', (agg_id,))
                conn.commit()
            self.refresh_aggregators_list()
        except Exception as e:
            messagebox.showerror('Ошибка', f'Ошибка включения агрегатора: {e}')

    def delete_selected_news(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning('Внимание', 'Выберите новости для удаления!')
            return
        if not messagebox.askyesno('Подтвердите', f'Удалить {len(selected)} выбранных новостей?'):
            return
        try:
            with sqlite3.connect(DB_PATH) as conn:
                c = conn.cursor()
                for item_id in selected:
                    item = self.tree.item(item_id)
                    news_id = item['values'][0]
                    c.execute('DELETE FROM news WHERE id=?', (news_id,))
                conn.commit()
            self.refresh_news_list()
        except Exception as e:
            messagebox.showerror('Ошибка', f'Ошибка удаления новостей: {e}')

    def delete_all_news(self):
        if not messagebox.askyesno('Подтвердите', 'Удалить ВСЕ новости?'):
            return
        try:
            with sqlite3.connect(DB_PATH) as conn:
                c = conn.cursor()
                c.execute('DELETE FROM news')
                conn.commit()
            self.refresh_news_list()
        except Exception as e:
            messagebox.showerror('Ошибка', f'Ошибка удаления всех новостей: {e}')

    def show_news_details(self, event):
        item_id = self.tree.identify_row(event.y)
        if not item_id:
            return
        item = self.tree.item(item_id)
        news_id = item['values'][0]
        # Получаем все данные новости
        try:
            with sqlite3.connect(DB_PATH) as conn:
                c = conn.cursor()
                c.execute('SELECT title, full_text, publish_date, link FROM news WHERE id=?', (news_id,))
                row = c.fetchone()
                if not row:
                    messagebox.showerror('Ошибка', 'Новость не найдена в базе данных.')
                    return
                title, full_text, publish_date, link = row
        except Exception as e:
            messagebox.showerror('Ошибка', f'Ошибка чтения новости: {e}')
            return
        # Окно с подробностями
        win = tk.Toplevel(self)
        win.title(title[:80])
        win.geometry('700x500')
        tk.Label(win, text=title, font=('Arial', 14, 'bold'), wraplength=650, justify='left').pack(pady=8)
        tk.Label(win, text=f'Дата публикации: {publish_date}', font=('Arial', 10)).pack(pady=2)
        text_box = ScrolledText(win, wrap='word', width=80, height=20)
        text_box.pack(padx=10, pady=10, fill='both', expand=True)
        text_box.insert('1.0', full_text or '(нет текста)')
        text_box.config(state='disabled')
        def open_link():
            if link:
                webbrowser.open(link)
        tk.Button(win, text='Открыть в браузере', command=open_link).pack(side='left', padx=10, pady=5)
        tk.Button(win, text='Закрыть', command=win.destroy).pack(side='right', padx=10, pady=5)

    def edit_paraphrase_prompt(self):
        dialog = PromptDialog(self, initial_text=self.paraphrase_prompt)
        self.wait_window(dialog)
        if dialog.result is not None and dialog.result.strip():
            self.paraphrase_prompt = dialog.result.strip()

class AddAggregatorDialog(tk.Toplevel):
    def __init__(self, parent, name='', url=''):
        super().__init__(parent)
        self.title('Добавить сайт-агрегатор' if not name else 'Редактировать сайт-агрегатор')
        self.resizable(False, False)
        self.minsize(400, 150)
        self.result = None
        tk.Label(self, text='Название сайта:').grid(row=0, column=0, sticky='w', padx=8, pady=4)
        self.name_entry = tk.Entry(self, width=40)
        self.name_entry.grid(row=0, column=1, padx=8, pady=4)
        self.name_entry.insert(0, name)
        tk.Button(self, text='Вставить', command=lambda: self.name_entry.insert(tk.INSERT, self.clipboard_get())).grid(row=0, column=2, padx=2)
        tk.Label(self, text='URL сайта:').grid(row=1, column=0, sticky='w', padx=8, pady=4)
        self.url_entry = tk.Entry(self, width=40)
        self.url_entry.grid(row=1, column=1, padx=8, pady=4)
        self.url_entry.insert(0, url)
        tk.Button(self, text='Вставить', command=lambda: self.url_entry.insert(tk.INSERT, self.clipboard_get())).grid(row=1, column=2, padx=2)
        btn_frame = tk.Frame(self)
        btn_frame.grid(row=2, column=0, columnspan=3, pady=8)
        tk.Button(btn_frame, text='Сохранить', width=12, command=self.on_ok).pack(side='left', padx=5)
        tk.Button(btn_frame, text='Отмена', width=12, command=self.on_cancel).pack(side='left', padx=5)
        self.name_entry.focus_set()
        self.bind('<Return>', lambda e: self.on_ok())
        self.bind('<Escape>', lambda e: self.on_cancel())

    def on_ok(self):
        name = self.name_entry.get().strip()
        url = self.url_entry.get().strip()
        if name and url:
            self.result = (name, url)
            self.destroy()

    def on_cancel(self):
        self.result = None
        self.destroy()

    def paste_clipboard(self, event):
        widget = event.widget
        try:
            text = self.clipboard_get()
            if isinstance(widget, tk.Entry):
                widget.insert(tk.INSERT, text)
            elif isinstance(widget, tk.Text):
                widget.insert(tk.INSERT, text)
        except Exception:
            pass
        return "break"

    def add_context_menu(self, widget):
        menu = tk.Menu(widget, tearoff=0)
        menu.add_command(label="Вставить", command=lambda w=widget: self.context_paste(w))
        def show_menu(event, m=menu):
            m.tk_popup(event.x_root, event.y_root)
        widget.bind('<Button-3>', show_menu)
        # Для MacOS (ПКМ = Button-2)
        widget.bind('<Button-2>', show_menu)

    def context_paste(self, widget):
        try:
            text = self.clipboard_get()
            if isinstance(widget, tk.Entry):
                widget.insert(tk.INSERT, text)
            elif isinstance(widget, tk.Text):
                widget.insert(tk.INSERT, text)
        except Exception:
            pass

class PromptDialog(tk.Toplevel):
    def __init__(self, parent, initial_text=''):
        super().__init__(parent)
        self.title('Настройка prompt')
        self.geometry('600x300')
        self.resizable(False, False)
        self.result = None
        tk.Label(self, text='Введите prompt для рерайтинга:').pack(anchor='w', padx=10, pady=(10, 0))
        self.text_widget = tk.Text(self, wrap='word', width=70, height=12)
        self.text_widget.pack(padx=10, pady=10, fill='both', expand=True)
        self.text_widget.insert('1.0', initial_text)
        btn_frame = tk.Frame(self)
        btn_frame.pack(pady=8)
        tk.Button(btn_frame, text='OK', width=12, command=self.on_ok).pack(side='left', padx=5)
        tk.Button(btn_frame, text='Cancel', width=12, command=self.on_cancel).pack(side='left', padx=5)
        self.text_widget.focus_set()
        self.bind('<Return>', lambda e: self.on_ok() if e.widget==self.text_widget else None)
        self.bind('<Escape>', lambda e: self.on_cancel())

    def on_ok(self):
        self.result = self.text_widget.get('1.0', 'end').strip()
        self.destroy()

    def on_cancel(self):
        self.result = None
        self.destroy()

class DiffDialog(tk.Toplevel):
    def __init__(self, parent, orig_title, orig_text, rewritten_title, rewritten_text):
        super().__init__(parent)
        self.title('Сравнение рерайтинга')
        self.geometry('1000x600')
        self.resizable(True, True)
        self.result = None
        # Заголовки
        title_frame = tk.Frame(self)
        title_frame.pack(fill='x', padx=10, pady=(10, 0))
        tk.Label(title_frame, text='Оригинальный заголовок:', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        tk.Label(title_frame, text='Рерайтинг заголовка:', font=('Arial', 10, 'bold')).pack(side='left', padx=(100, 0))
        # Два поля для заголовка
        title_fields = tk.Frame(self)
        title_fields.pack(fill='x', padx=10)
        orig_title_box = tk.Text(title_fields, width=40, height=2, wrap='word', state='normal')
        orig_title_box.pack(side='left', padx=(0, 10), pady=2)
        orig_title_box.insert('1.0', orig_title)
        orig_title_box.config(state='disabled')
        self.rewritten_title_box = tk.Text(title_fields, width=40, height=2, wrap='word')
        self.rewritten_title_box.pack(side='left', padx=(100, 0), pady=2)
        self.rewritten_title_box.insert('1.0', rewritten_title)
        self._highlight_diff(self.rewritten_title_box, orig_title, rewritten_title)
        # Тексты
        text_frame = tk.Frame(self)
        text_frame.pack(fill='x', padx=10, pady=(20, 0))
        tk.Label(text_frame, text='Оригинальный текст:', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        tk.Label(text_frame, text='Рерайтинг текста:', font=('Arial', 10, 'bold')).pack(side='left', padx=(100, 0))
        # Два поля для текста
        text_fields = tk.Frame(self)
        text_fields.pack(fill='both', expand=True, padx=10)
        orig_text_box = tk.Text(text_fields, width=40, height=20, wrap='word', state='normal')
        orig_text_box.pack(side='left', padx=(0, 10), pady=2, fill='y')
        orig_text_box.insert('1.0', orig_text)
        orig_text_box.config(state='disabled')
        self.rewritten_text_box = tk.Text(text_fields, width=40, height=20, wrap='word')
        self.rewritten_text_box.pack(side='left', padx=(100, 0), pady=2, fill='y')
        self.rewritten_text_box.insert('1.0', rewritten_text)
        self._highlight_diff(self.rewritten_text_box, orig_text, rewritten_text)
        # Кнопки
        btn_frame = tk.Frame(self)
        btn_frame.pack(pady=10)
        tk.Button(btn_frame, text='Опубликовать', width=16, command=self.on_publish).pack(side='left', padx=10)
        tk.Button(btn_frame, text='Отмена', width=16, command=self.on_cancel).pack(side='left', padx=10)
        self.rewritten_title_box.focus_set()
        self.bind('<Escape>', lambda e: self.on_cancel())
    def _highlight_diff(self, text_widget, orig, rewritten):
        # Подсветка отличий (простая: выделяем изменённые слова)
        text_widget.tag_configure('diff', background='#ffeeba')
        sm = difflib.SequenceMatcher(None, orig, rewritten)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag in ('replace', 'insert'):
                text_widget.tag_add('diff', f'1.0+{j1}c', f'1.0+{j2}c')
    def on_publish(self):
        title = self.rewritten_title_box.get('1.0', 'end').strip()
        text = self.rewritten_text_box.get('1.0', 'end').strip()
        self.result = (title, text)
        self.destroy()
    def on_cancel(self):
        self.result = None
        self.destroy()

if __name__ == '__main__':
    app = NewsAggregatorGUI()
    app.mainloop() 