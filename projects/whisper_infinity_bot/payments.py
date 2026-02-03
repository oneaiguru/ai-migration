import sqlite3
from database import get_db_connection
import os

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

def record_payment(teacher_code, course_name, amount):
    """
    Record a payment for a course. In a real scenario, 
    you'd probably check if the teacher is enrolled in the course first.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO payments (teacher_code, course_name, amount, status)
            VALUES (?, ?, ?, 'Pending')
        """, (teacher_code, course_name, amount))
        conn.commit()
        return {
            "status": "success",
            "message": f"Payment of {amount} recorded successfully, awaiting confirmation."
        }
    except sqlite3.IntegrityError:
        return {
            "status": "failure",
            "message": "Failed to record payment. Possibly invalid teacher_code/course_name."
        }
    finally:
        conn.close()

def update_payment_status(payment_id, status):
    """Update the status of a payment."""
    if status not in ['Paid', 'Pending', 'Failed']:
        return {"status": "failure", "message": "Invalid status."}

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE payments SET status = ? WHERE payment_id = ?",
        (status, payment_id)
    )
    conn.commit()
    conn.close()

    return {
        "status": "success",
        "message": f"Payment status updated to {status}."
    }

if __name__ == "__main__":
    print("Payments module loaded.")
