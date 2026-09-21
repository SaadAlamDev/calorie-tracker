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

app.get('/api/foods', async (request, response) => {
    try{
        const dbResult = await pool.query('SELECT * FROM foods');
        response.json(dbResult.rows);
    } catch(error){
        console.error('Database query failed:', error);
        response.status(500).json({error: 'Internal server error'});
    }
});

const PORT = 3000;
app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
})
