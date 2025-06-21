import json
import os
from datetime import datetime
import psycopg2
import sys

def is_valid_iso_timestamp(ts):
    try:
        datetime.fromisoformat(ts.replace('Z', '+00:00'))  
        return True
    except Exception:
        return False



def normalize_and_validate(data):
    users = {}
    courses = {}
    lessons = {}
    events = []

    for i, record in enumerate(data, start=1):
        if not all([
            'event_id' in record,
            'timestamp' in record,
            'action' in record,
            isinstance(record.get('user'), dict),
            isinstance(record.get('course'), dict),
            'id' in record['user'],
            'name' in record['user'],
            'id' in record['course'],
            'title' in record['course']
        ]):
            print(f"Error: Record #{i} missing required fields")
            sys.exit(1)

        if not is_valid_iso_timestamp(record['timestamp']):
            print(f"Error: Record #{i} has invalid timestamp '{record['timestamp']}'")
            sys.exit(1)

        user = record['user']
        course = record['course']
        metadata = record.get('metadata', {})
        lesson_id = metadata.get('lesson_id')

        users[user['id']] = user['name']
        courses[course['id']] = course['title']

        if lesson_id:
            lessons[lesson_id] = metadata.get('lesson_title', '')

        events.append({
            "event_id": record["event_id"],
            "timestamp": record["timestamp"],
            "action": record["action"],
            "user_id": user["id"],
            "course_id": course["id"],
            "lesson_id": lesson_id,
            "duration_minutes": metadata.get("duration_minutes")
        })

    return users, courses, lessons, events


def connect():
    db_host = os.getenv("DB_HOST", "localhost")
    db_name = os.getenv("DB_NAME")
    db_user = os.getenv("DB_USER")
    db_pass = os.getenv("DB_PASSWORD")

    try:
        conn = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_pass
        )
        print("✅ Connected to the database.")
        return conn
    except psycopg2.OperationalError as e:
        raise Exception(f"Database connection failed: {e}")


def main():
   #load data
    with open("activity_logs.json", "r") as f:
        raw_data = json.load(f)

    users, courses, lessons, events = normalize_and_validate(raw_data)

    conn = connect()
    cur = conn.cursor()

    #create tables
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY,
            name TEXT
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS courses (
            id TEXT PRIMARY KEY,
            title TEXT
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS lessons (
            id TEXT PRIMARY KEY,
            title TEXT
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id SERIAL PRIMARY KEY,
            event_id TEXT UNIQUE,
            timestamp TIMESTAMPTZ,
            action TEXT,
            user_id INT REFERENCES users(id),
            course_id TEXT REFERENCES courses(id),
            lesson_id TEXT REFERENCES lessons(id),
            duration_minutes INT
        );
    """)

    #seed users
    for user_id, name in users.items():
        cur.execute(
            "INSERT INTO users (id, name) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING",
            (user_id, name)
        )

    #seed courses
    for course_id, title in courses.items():
        cur.execute(
            "INSERT INTO courses (id, title) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING",
            (course_id, title)
        )

    #seed lessons
    for lesson_id, title in lessons.items():
        cur.execute(
            "INSERT INTO lessons (id, title) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING",
            (lesson_id, title)
        )

    #seed events with conflict protection
    for event in events:
        cur.execute(
            """
            INSERT INTO events (
                event_id, timestamp, action, user_id, course_id, lesson_id, duration_minutes
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (event_id) DO NOTHING
            """,
            (
                event["event_id"],
                event["timestamp"],
                event["action"],
                event["user_id"],
                event["course_id"],
                event["lesson_id"],
                event["duration_minutes"]
            )
        )

    conn.commit()
    cur.close()
    conn.close()

    print("✅ Data loaded successfully.")


if __name__ == "__main__":
    main()
