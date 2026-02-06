import sqlite3
from database import get_db_connection
import os

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

def register_course(teacher_code, course_name):
    """
    Register a teacher for a course pending admin approval.
    Inserts the registration request into the pending_courses table.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO pending_courses (teacher_code, course_name)
            VALUES (?, ?)
        """, (teacher_code, course_name))
        conn.commit()
        return {"status": "success", "message": "Course registration request submitted and is pending approval."}
    except sqlite3.IntegrityError:
        return {"status": "failure", "message": "Course registration already pending or already registered."}
    finally:
        conn.close()

def approve_course(teacher_code, course_name):
    """
    Approve a pending course registration.
    Moves the request from pending_courses to the courses table.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT pending_id FROM pending_courses
        WHERE teacher_code = ? AND course_name = ? AND status = 'Pending'
    """, (teacher_code, course_name))
    pending = cursor.fetchone()
    if not pending:
        conn.close()
        return {"status": "failure", "message": "No pending course registration found."}
    try:
        cursor.execute("""
            INSERT INTO courses (teacher_code, course_name)
            VALUES (?, ?)
        """, (teacher_code, course_name))
    except sqlite3.IntegrityError:
        conn.close()
        return {"status": "failure", "message": "Course already registered."}
    cursor.execute("""
        UPDATE pending_courses SET status = 'Approved'
        WHERE pending_id = ?
    """, (pending["pending_id"],))
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Course '{course_name}' approved for {teacher_code}."}

def reject_course(teacher_code, course_name):
    """
    Reject a pending course registration.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT pending_id FROM pending_courses
        WHERE teacher_code = ? AND course_name = ? AND status = 'Pending'
    """, (teacher_code, course_name))
    pending = cursor.fetchone()
    if not pending:
        conn.close()
        return {"status": "failure", "message": "No pending course registration found."}
    cursor.execute("""
        UPDATE pending_courses SET status = 'Rejected'
        WHERE pending_id = ?
    """, (pending["pending_id"],))
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Course registration for '{course_name}' rejected for {teacher_code}."}

def get_registered_courses(teacher_code):
    """
    Retrieve all approved courses registered by a teacher.
    Returns: { "status": "success", "courses": [course_name, ...] }
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT course_name FROM courses WHERE teacher_code = ?
    """, (teacher_code,))
    courses = cursor.fetchall()
    conn.close()
    return {"status": "success", "courses": [course["course_name"] for course in courses]}

def get_pending_courses():
    """
    Retrieve all pending course registration requests.
    Returns a list of pending course rows.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT pending_id, teacher_code, course_name FROM pending_courses
        WHERE status = 'Pending'
    """)
    pending = cursor.fetchall()
    conn.close()
    return pending

if __name__ == "__main__":
    print("Courses module loaded.")