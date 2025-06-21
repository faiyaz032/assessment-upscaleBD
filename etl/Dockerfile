
FROM python:3.11-slim

WORKDIR /app

COPY etl.py activity_logs.json ./

RUN pip install psycopg2-binary

CMD ["python", "etl.py"]
