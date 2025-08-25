-- Active: 1755615876148@@127.0.0.1@5432

-- Tabel role
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

ALTER TABLE "user" RENAME COLUMN roleId TO  role_id;

DROP TABLE IF EXISTS transaction CASCADE;
-- Tabel user
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES role(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active',
    picture VARCHAR(255)
);

-- Tabel blacklisted_tokens
CREATE TABLE blacklisted_tokens (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL
);

-- Tabel menu
CREATE TABLE menu (
    id SERIAL PRIMARY KEY,
    image VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT
);

-- Tabel order
CREATE TABLE "order" (
    id SERIAL PRIMARY KEY,
    no_order VARCHAR(30) NOT NULL,
    no_table VARCHAR(20),
    date TIMESTAMP NOT NULL,
    type VARCHAR(20) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    sub_total NUMERIC NOT NULL,
    tax NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status VARCHAR(20) NOT NULL,
    user_id INTEGER REFERENCES "user"(id)
);

-- Tabel order_item
CREATE TABLE order_item (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES "order"(id),
    menu_id INTEGER REFERENCES menu(id),
    quantity INTEGER NOT NULL,
    notes TEXT,
    price NUMERIC NOT NULL
);

-- Tabel transaction
CREATE TABLE transaction (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES "order"(id),
    amount_change NUMERIC NOT NULL,
    amount_received NUMERIC NOT NULL,
    transaction_status VARCHAR(20) NOT NULL,
    transaction_date TIMESTAMP NOT NULL
);