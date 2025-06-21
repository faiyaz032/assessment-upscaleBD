from datetime import datetime
import json
import sys
import psycopg2
import os


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
            'user' in record and isinstance(record['user'], dict),
            'course' in record and isinstance(record['course'], dict),
            'user' in record and 'id' in record['user'],
            'user' in record and 'name' in record['user'],
            'course' in record and 'id' in record['course'],
            'course' in record and 'title' in record['course']
        ]):
            print(f"Validation failed at record #{i}: Missing required fields")
            sys.exit(1)

        if not is_valid_iso_timestamp(record['timestamp']):
            print(f"Validation failed at record #{i}: Invalid timestamp '{record['timestamp']}'")
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
        print("Connected to the database.")
        return conn
    except psycopg2.OperationalError as e:
        raise Exception(f"Database connection failed: {e}")


def main():
    with open('activity_logs.json', 'r') as file:
        data = json.load(file)

    users, courses, lessons, events = normalize_and_validate(data)
    conn = connect()
    curr = conn.cursor()

    print(users)
    print(courses)
    print(lessons)
    print(events)


if __name__ == "__main__":
    main()
