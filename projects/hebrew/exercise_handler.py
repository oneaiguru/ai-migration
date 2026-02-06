import datetime
import json
import random

from .config import EXERCISE_FILES, TEMPLATE_FILES

def load_exercises_config():
    with open("exercises_config.json", "r") as f:
        config = json.load(f)
    return config

def load_exercise_data(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        data = [line.strip().split(",") for line in f.readlines()]
    return data

# ... rest of the code remains the same


def load_user_performance_history(user_id):
    filename = f"{user_id}_performance_history.json"
    try:
        with open(filename, "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        data = {}
    return data

def update_and_save_user_performance_history(user_id, exercise_id, line_number, correct):
    history = load_user_performance_history(user_id)

    if exercise_id not in history:
        history[exercise_id] = {}

    if line_number not in history[exercise_id]:
        history[exercise_id][line_number] = {"correct": 0, "wrong": 0, "last_correct": None}

    if correct:
        history[exercise_id][line_number]["correct"] += 1
        history[exercise_id][line_number]["last_correct"] = datetime.datetime.now().strftime("%Y-%m-%d")
    else:
        history[exercise_id][line_number]["wrong"] += 1

    filename = f"{user_id}_performance_history.json"
    with open(filename, "w") as f:
        json.dump(history, f)

def get_exercise_probability(user_id, exercise_id, line_number, days_passed=7):
    history = load_user_performance_history(user_id)

    if exercise_id not in history or line_number not in history[exercise_id]:
        return 1.0

    exercise_history = history[exercise_id][line_number]
    correct_count = exercise_history["correct"]
    wrong_count = exercise_history["wrong"]
    last_correct_date = exercise_history["last_correct"]

    if last_correct_date is not None:
        last_correct_date = datetime.datetime.strptime(last_correct_date, "%Y-%m-%d")
        days_since_last_correct = (datetime.datetime.now() - last_correct_date).days
    else:
        days_since_last_correct = None

    if days_since_last_correct is not None and days_since_last_correct > days_passed:
        return 1.0
    else:
        total_attempts = correct_count + wrong_count
        return correct_count / total_attempts if total_attempts > 0 else 1.0



def set_current_exercise(user_id, exercise_id):
    filename = f"{user_id}_current_exercise.txt"
    with open(filename, "w") as f:
        f.write(exercise_id)




def select_random_exercise(user_id):
    exercises_config = load_exercises_config()
    exercises = []
    probabilities = []

    for exercise_id, exercise_info in exercises_config.items():
        data_file = EXERCISE_FILES[int(exercise_id.replace("exercise", "")) - 1]
        data = load_exercise_data(data_file)
        for line_number in range(len(data)):
            probability = get_exercise_probability(user_id, exercise_id, line_number)
            exercises.append((exercise_id, line_number))
            probabilities.append(probability)

    if sum(probabilities) == 0:
        probabilities = [1 / len(probabilities)] * len(probabilities)

    selected_exercise, selected_line_number = random.choices(exercises, weights=probabilities, k=1)[0]
    return selected_exercise, selected_line_number

def get_exercise_question_answer(user_id, exercise_id, line_number):
    exercises_config = load_exercises_config()
    exercise_info = exercises_config[exercise_id]
    data_file = EXERCISE_FILES[int(exercise_id.replace("exercise", "")) - 1]
    data = load_exercise_data(data_file)

    item = data[line_number]
    input_variables = {name: item[name] for name in exercise_info["input_variables"]}
    output_variables = {name: item[name] for name in exercise_info["output_variables"]}

    question_template = exercise_info["question_template"]
    question = question_template.format(**input_variables)

    return question, output_variables
