import sqlite3
from auth import hash_password  # Ensure you're using the correct hashing function

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

password = "123"  # Set their password
hashed_password = hash_password(password)

cursor.execute(
    "INSERT INTO teachers (teacher_code, password_hash, name, courses) VALUES (?, ?, ?, ?)",
    ("ADMIN002", hashed_password, "Admin User", "")
)

conn.commit()
conn.close()
print("✅ ADMIN002 has been added to teachers!")
