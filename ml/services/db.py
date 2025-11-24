import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

DB_HOST = os.getenv("PGHOST", "db")
DB_PORT = os.getenv("PGPORT", "5432")
DB_USER = os.getenv("PGUSER", "capstone")
DB_NAME = os.getenv("PGDATABASE", "ai_learning_insight")
DB_PASS = os.getenv("PGPASSWORD", "admin123")

def get_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        dbname=DB_NAME,
        password=DB_PASS
    )
    return conn
