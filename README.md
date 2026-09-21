# Calorie Tracker

A full-stack web application that allows users to search for nutritional information and track their food intake. Built as a minimal viable product (MVP) with a decoupled client-server architecture.

## Tech Stack

* **Frontend:** React, Vite, CSS
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL, node-postgres (pg)

## Features

* Real-time search filtering for food items.
* Warning messages for empty searches or no matches.
* RESTful API backend serving database queries.
* Strict component-based UI architecture.

## Local Setup Instructions

### Prerequisites
* Node.js installed
* PostgreSQL installed and running locally

### 1. Database Setup
Log into your PostgreSQL shell and run the following:
```sql
CREATE DATABASE calorie_tracker;
\c calorie_tracker

CREATE TABLE foods (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  portion VARCHAR(100) NOT NULL,
  calories INTEGER NOT NULL
);

INSERT INTO foods (description, portion, calories) VALUES
  ('Apple, raw', '1 medium (182g)', 95),
  ('Chicken breast, grilled', '3 oz (85g)', 128),
  ('Brown rice, cooked', '1 cup (195g)', 216),
  ('Banana', '1 medium (118g)', 105),
  ('Peanut butter, smooth', '2 tbsp (32g)', 188);
```
### 2. Backend
Navigate to the backend directory, install dependencies, and start the Node server:
```bash
cd backend
npm install
node server.js
```

### 3. Frontend
Open a new terminal tab, navigate to the root directory of the project, install dependencies, and start the Vite development server:
```
npm install
npm run dev
```
