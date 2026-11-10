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

## Nourish dashboard and meal planner

The app now includes a responsive dashboard, daily calorie and macro tracking,
meal logging with serving sizes, custom foods, water tracking, editable goals,
a seven-day progress chart, and data export. Diary entries, goals, custom foods,
water intake, and the latest meal plan are saved in this browser's local storage.
There are no user accounts or cross-device sync. The built-in food library works
without PostgreSQL; the existing database food search/edit/delete API remains
available when the backend database is connected. Foods without macro data only
contribute their known nutrition values.

### Run locally

Use Node.js 22.12+ (or Node.js 24). Install both sets of dependencies:

```bash
npm install
npm --prefix backend install
```

Start the backend and frontend in separate terminals:

```bash
npm run dev:server
```

```bash
npm run dev
```

The frontend uses Vite's `/api` proxy to `http://localhost:3000` when
`VITE_API_URL` is empty. For a separately hosted API, set `VITE_API_URL` to the
backend's public base URL before building. For same-origin production hosting,
configure the host to forward `/api` to the backend; Vite's development proxy
is not included in the production build.

### Enable AI meal plans

1. Create an API key at [OpenRouter](https://openrouter.ai/settings/keys).
2. Add the following to `backend/.env`, preserving any existing database settings:

   ```dotenv
   OPENROUTER_API_KEY=your_key_here
   OPENROUTER_MODEL=openrouter/free
   ```

3. Restart the backend. For hosted deployments, add these variables to the
   backend service's environment and redeploy the updated backend.
4. Open **Meal planner**, choose a goal, diet, calorie target, plan length
   (1, 3, or 7 days), allergies, and preferences, then generate your plan.

The [free model router](https://openrouter.ai/openrouter/free) uses free models;
provider availability and [free-tier rate limits](https://openrouter.ai/docs/api/reference/limits)
apply. No key is included in this repository. The key stays on the server and
must never use a `VITE_` prefix. The planner shows a setup message when no key
is configured and clear retry messages for service errors; it does not present
sample data as AI output.

Each generated plan includes portions, estimated nutrition, ingredients,
preparation instructions, and a downloadable grocery checklist. You can add a
plan day to the selected diary date; repeated clicks do not duplicate the same
planned meals on that date. Logging a plan marks those meals as eaten. The grocery
checklist deduplicates identical ingredient lines; combine quantities as needed.
Preferences are sent to OpenRouter. Nutrition and allergen exclusions are model
estimates, so review ingredients and product labels. Calorie targets are supplied
by the user rather than calculated as medical recommendations.

The server validates preferences and plan structure, checks daily calorie totals,
limits concurrent generations to two, and allows 20 generation requests per hour
per server process to conserve quota. These in-memory limits reset on restart.

### Checks

```bash
npm run lint
npm run build
npm test
```

The backend tests use a mocked AI provider and cover preference validation,
plan validation, prompt forwarding, missing keys, authentication and quota errors,
malformed responses, timeouts, and the request limit. A live AI request requires
your own configured API key.

The dashboard food photograph is bundled from
[Unsplash](https://images.unsplash.com/photo-1512621776951-a57141f2eefd).
