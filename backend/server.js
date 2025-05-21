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

const dbPath = path.join(__dirname, 'database', 'users.db'); // Path to your SQLite database
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

app.post('/api/register', (req, res) => {
    const { name, email, password, role } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send('Internal server error');
        }
        const sql = `INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)`;
        db.run(sql, [name, email, hashedPassword, role], function(err) {
            if (err) {
                console.error('Error inserting user data:', err);
                return res.status(500).send('Error inserting data');
            }
            res.status(201).json({ id: this.lastID });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});