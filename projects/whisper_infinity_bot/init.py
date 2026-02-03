import sqlite3

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

cursor.execute("SELECT * FROM teachers WHERE teacher_code = ?", ("TEACHER001",))
teacher = cursor.fetchone()
conn.close()

print(teacher)  # This should print the teacher's details if inserted correctly.
