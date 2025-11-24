-- create limited ML user and grant read-only access
CREATE USER ml_user WITH PASSWORD 'ml123';

-- allow connect to DB
GRANT CONNECT ON DATABASE ai_learning_insight TO ml_user;

-- allow usage of public schema
GRANT USAGE ON SCHEMA public TO ml_user;

-- grant read-only on existing tables and future tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ml_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ml_user;