import json
import re
from typing import Dict

def count_substrings_in_file(json_path: str, file_path: str) -> Dict[str, int]:
    """
    Подсчитывает количество вхождений каждой подстроки из JSON файла в указанный текстовый файл.

    Аргументы:
        json_path (str): Путь к JSON файлу, содержащему список подстрок.
        file_path (str): Путь к текстовому файлу, в котором нужно подсчитать количество вхождений подстрок.

    Возвращает:
        Dict[str, int]: Словарь, где ключи — подстроки, а значения — их соответствующее количество вхождений.
    """
    # Загрузить подстроки из JSON файла
    print(f"Загрузка подстрок из файла: {json_path}")
    with open(json_path, 'r', encoding='utf-8') as json_file:
        substrings = json.load(json_file)

    # Проверить, что подстроки представлены в виде списка строк
    if not isinstance(substrings, list) or not all(isinstance(s, str) for s in substrings):
        raise ValueError("JSON должен содержать список строк.")

    print(f"Подстроки загружены: {substrings}")

    # Прочитать содержимое текстового файла
    print(f"Чтение содержимого текстового файла: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as text_file:
        file_content = text_file.read()

    # Инициализировать пустой словарь для хранения количества каждой подстроки
    substring_counts = {}
    for substring in substrings:
        # Использовать re.escape, чтобы специальные символы в подстроке рассматривались как литералы
        print(f"Подсчет количества вхождений подстроки: '{substring}'")
        count = len(re.findall(re.escape(substring), file_content))
        # Сохранить количество текущей подстроки в словарь
        substring_counts[substring] = count
        print(f"Подстрока '{substring}' найдена {count} раз(а).")

    return substring_counts

# Пример использования
if __name__ == "__main__":
    # Определить путь к JSON файлу, содержащему подстроки
    json_path = "substrings.json"
    # Определить путь к текстовому файлу, в котором будут подсчитаны подстроки
    file_path = "textfile.txt"
    
    try:
        # Вызвать функцию для подсчета количества вхождений подстрок
        print(f"Запуск подсчета вхождений подстрок из файла '{json_path}' в файле '{file_path}'")
        result = count_substrings_in_file(json_path, file_path)
        # Напечатать количество каждой подстроки, найденной в текстовом файле
        for substring, count in result.items():
            print(f"'{substring}' найдено {count} раз(а) в файле.")
    except Exception as e:
        # Обработать и вывести любые возникшие исключения
        print(f"Ошибка: {e}")
