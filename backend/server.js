const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();

const port = 3000;

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, '..', 'frontend')));

const dbPath = path.join(__dirname, 'database', 'users.db'); /*Creating a table for users*/
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            password TEXT,
            role TEXT
        )`);
    }
});




app.post('/api/register', (req, res) => { /* register post function */
    const { name, email, password, role } = req.body;
    
    const saltRounds = 10;
    const salt = bcrypt.genSalt(saltRounds);
    const hashPass  = bcrypt.hash(password, salt)
    const sql = `INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)`
    db.run(sql, 
        [name, email, hashPass, role],
        (err) => {
            if (err) {
                res.status(500).send('Error inserting data');
            } else {
                res.status(201).json({id: this.lastID});
            }
        });
});


/*if (regsubmit = 2) {
    pass
}


if (regsubmit = 1) {
    pass
}*/

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});