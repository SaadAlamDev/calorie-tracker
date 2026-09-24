const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'calorie_tracker',
    password: 'postgres',
    port: 5432,
})
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/foods', async (request, response) => {
    try {
        const searchTerm = request.query.search;
        let dbResult;

        if (searchTerm) {
            dbResult = await pool.query('SELECT * FROM foods WHERE description ILIKE $1', [`%${searchTerm}%`]
            );
        } else {
            dbResult = await pool.query('SELECT * FROM foods');
        }
        response.json(dbResult.rows);
    } catch (error) {
        console.error('Database query failed:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/foods', async (request, response) => {
    try{
        console.log("Incoming data from React:", request.body);
        const {description, portion, calories} = request.body;

        const dbResult = pool.query(
            'INSERT INTO foods (description, portion, calories) VALUES ($1, $2, $3) RETURNING *', [description, portion, calories]
        );
        response.json(dbResult.rows[0]);
    } catch(error) {
        console.error('Failed to add food:', error);
        response.status(500).json({error: 'Internal server Error'});
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
